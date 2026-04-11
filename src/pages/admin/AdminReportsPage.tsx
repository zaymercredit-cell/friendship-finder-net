import { useState } from "react";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAdminReports, useUpdateReportStatus, reportReasons } from "@/hooks/useReports";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Shield, Loader2, CheckCircle, Clock, AlertTriangle, Eye, Ban,
  MoreHorizontal, MessageSquare, Filter
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const statusColors: Record<string, string> = {
  pending: "bg-warning/15 text-warning border-warning/30",
  reviewed: "bg-primary/15 text-primary border-primary/30",
  resolved: "bg-green-500/15 text-green-600 border-green-500/30",
};

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  reviewed: AlertTriangle,
  resolved: CheckCircle,
};

export default function AdminReportsPage() {
  const { data: isAdmin, isLoading: adminLoading } = useAdminCheck();
  const { data: reports, isLoading } = useAdminReports();
  const updateStatus = useUpdateReportStatus();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");
  const [isPermanent, setIsPermanent] = useState(false);

  // Fetch profiles for reported users
  const reportedIds = [...new Set((reports || []).map((r: any) => r.reported_user_id))];
  const { data: profiles } = useQuery({
    queryKey: ["admin-report-profiles", reportedIds],
    queryFn: async () => {
      if (!reportedIds.length) return [];
      const { data } = await supabase.from("profiles").select("user_id, first_name, last_name, username, avatar_url").in("user_id", reportedIds);
      return data || [];
    },
    enabled: reportedIds.length > 0,
  });

  // Ban user mutation
  const banUser = useMutation({
    mutationFn: async ({ userId, reason, permanent }: { userId: string; reason: string; permanent: boolean }) => {
      const { error: banError } = await supabase
        .from("user_bans")
        .upsert({
          user_id: userId,
          banned_by: user?.id,
          reason,
          is_permanent: permanent,
          expires_at: permanent ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      if (banError) throw banError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ is_banned: true })
        .eq("user_id", userId);
      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Пользователь заблокирован");
      setBanDialogOpen(false);
      setSelectedUserId(null);
      setBanReason("");
    },
    onError: (err: any) => {
      toast.error(`Ошибка: ${err.message}`);
    },
  });

  const getProfile = (uid: string) => (profiles || []).find((p: any) => p.user_id === uid);
  const getReasonLabel = (v: string) => reportReasons.find(r => r.value === v)?.label || v;

  const handleBanClick = (userId: string) => {
    setSelectedUserId(userId);
    setBanDialogOpen(true);
  };

  const handleBanSubmit = () => {
    if (!selectedUserId || !banReason.trim()) {
      toast.error("Укажите причину блокировки");
      return;
    }
    banUser.mutate({
      userId: selectedUserId,
      reason: banReason,
      permanent: isPermanent,
    });
  };

  const filteredReports = (reports || []).filter((r: any) => 
    statusFilter === "all" || r.status === statusFilter
  );

  if (adminLoading || isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAdmin) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Доступ запрещён</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Жалобы</h1>
            <p className="text-sm text-muted-foreground">
              {(reports || []).filter((r: any) => r.status === "pending").length} ожидают рассмотрения
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">Все ({reports?.length || 0})</TabsTrigger>
          <TabsTrigger value="pending">
            Ожидают ({(reports || []).filter((r: any) => r.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            Рассмотрены ({(reports || []).filter((r: any) => r.status === "reviewed").length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Закрыты ({(reports || []).filter((r: any) => r.status === "resolved").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {!filteredReports.length ? (
        <div className="text-center py-16 text-muted-foreground">
          {statusFilter === "all" ? "Жалоб пока нет" : "Нет жалоб с этим статусом"}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Причина</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="w-[100px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((r: any) => {
                const prof = getProfile(r.reported_user_id);
                const StatusIcon = statusIcons[r.status] || Clock;
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={prof?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {prof?.first_name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{prof ? `${prof.first_name} ${prof.last_name}` : "Неизвестный"}</p>
                          <p className="text-xs text-muted-foreground">@{prof?.username || "—"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{getReasonLabel(r.reason)}</Badge></TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{r.description || "—"}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusColors[r.status] || ""}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />{r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(r.created_at), "dd.MM.yyyy HH:mm")}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/profile/${prof?.username || r.reported_user_id}`}>
                              <Eye className="h-4 w-4 mr-2" /> Профиль
                            </Link>
                          </DropdownMenuItem>
                          {r.status === "pending" && (
                            <DropdownMenuItem onClick={() => updateStatus.mutate({ id: r.id, status: "reviewed" })}>
                              <AlertTriangle className="h-4 w-4 mr-2" /> Рассмотреть
                            </DropdownMenuItem>
                          )}
                          {r.status !== "resolved" && (
                            <DropdownMenuItem onClick={() => updateStatus.mutate({ id: r.id, status: "resolved" })}>
                              <CheckCircle className="h-4 w-4 mr-2" /> Закрыть
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleBanClick(r.reported_user_id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Ban className="h-4 w-4 mr-2" /> Заблокировать
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-destructive" />
              Заблокировать пользователя
            </DialogTitle>
            <DialogDescription>
              Заблокировать пользователя по жалобе
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Причина блокировки</Label>
              <Textarea
                placeholder="Опишите причину блокировки..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Постоянная блокировка</Label>
                <p className="text-xs text-muted-foreground">
                  Если нет — блокировка на 7 дней
                </p>
              </div>
              <Switch checked={isPermanent} onCheckedChange={setIsPermanent} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleBanSubmit}
              disabled={banUser.isPending}
            >
              {banUser.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Ban className="h-4 w-4 mr-2" />
              )}
              Заблокировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
