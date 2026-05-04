import { useState, useMemo, useDeferredValue } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users, Search, Loader2, Ban, Eye, CheckCircle,
  MoreHorizontal,
} from "lucide-react";
import { AdminGuard, AdminHeader, AdminTableSkeleton, FilterChip } from "@/components/admin/AdminShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  username: string | null;
  avatar_url: string | null;
  city: string | null;
  trust_score: number | null;
  is_verified: boolean | null;
  is_vip: boolean | null;
  is_online: boolean | null;
  is_banned: boolean | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const { data: isAdmin, isLoading: adminLoading } = useAdminCheck();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState("");
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [banReason, setBanReason] = useState("");
  const [isPermanent, setIsPermanent] = useState(false);

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,username.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Profile[];
    },
    enabled: !!isAdmin,
  });

  // Fetch reports count per user
  const { data: reportCounts } = useQuery({
    queryKey: ["admin-report-counts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reports")
        .select("reported_user_id");
      
      const counts: Record<string, number> = {};
      (data || []).forEach((r: any) => {
        counts[r.reported_user_id] = (counts[r.reported_user_id] || 0) + 1;
      });
      return counts;
    },
    enabled: !!isAdmin,
  });

  // Ban user mutation
  const banUser = useMutation({
    mutationFn: async ({ userId, reason, permanent }: { userId: string; reason: string; permanent: boolean }) => {
      // Insert ban record
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

      // Update profile
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
      setSelectedUser(null);
      setBanReason("");
    },
    onError: (err: any) => {
      toast.error(`Ошибка: ${err.message}`);
    },
  });

  // Unban user mutation
  const unbanUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error: banError } = await supabase
        .from("user_bans")
        .delete()
        .eq("user_id", userId);
      if (banError) throw banError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ is_banned: false })
        .eq("user_id", userId);
      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Блокировка снята");
    },
    onError: (err: any) => {
      toast.error(`Ошибка: ${err.message}`);
    },
  });

  const handleBanClick = (profile: Profile) => {
    setSelectedUser(profile);
    setBanDialogOpen(true);
  };

  const handleBanSubmit = () => {
    if (!selectedUser || !banReason.trim()) {
      toast.error("Укажите причину блокировки");
      return;
    }
    banUser.mutate({
      userId: selectedUser.user_id,
      reason: banReason,
      permanent: isPermanent,
    });
  };

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Доступ запрещён
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Пользователи</h1>
            <p className="text-sm text-muted-foreground">{users?.length || 0} пользователей</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по имени или username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !users?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          Пользователи не найдены
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Город</TableHead>
                <TableHead>Trust</TableHead>
                <TableHead>Жалобы</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Регистрация</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((profile) => {
                const reportsOnUser = reportCounts?.[profile.user_id] || 0;
                return (
                  <TableRow key={profile.id} className={profile.is_banned ? "opacity-60" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {profile.first_name?.[0]}{profile.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">
                              {profile.first_name} {profile.last_name}
                            </p>
                            {profile.is_verified && (
                              <CheckCircle className="h-3.5 w-3.5 text-primary" />
                            )}
                            {profile.is_vip && (
                              <Badge variant="secondary" className="text-[10px] px-1 py-0">VIP</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            @{profile.username || "—"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {profile.city || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          (profile.trust_score || 0) >= 70 
                            ? "border-green-500/30 text-green-600" 
                            : (profile.trust_score || 0) >= 40 
                              ? "border-yellow-500/30 text-yellow-600"
                              : "border-red-500/30 text-red-600"
                        }`}
                      >
                        {profile.trust_score || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {reportsOnUser > 0 ? (
                        <Badge variant="destructive" className="text-xs">
                          {reportsOnUser}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {profile.is_banned ? (
                        <Badge variant="destructive" className="text-xs gap-1">
                          <Ban className="h-3 w-3" /> Заблокирован
                        </Badge>
                      ) : profile.is_online ? (
                        <Badge variant="outline" className="text-xs border-green-500/30 text-green-600">
                          Онлайн
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Офлайн</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(profile.created_at), "dd.MM.yy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/profile/${profile.username || profile.user_id}`}>
                              <Eye className="h-4 w-4 mr-2" /> Профиль
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {profile.is_banned ? (
                            <DropdownMenuItem onClick={() => unbanUser.mutate(profile.user_id)}>
                              <CheckCircle className="h-4 w-4 mr-2" /> Разблокировать
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleBanClick(profile)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Ban className="h-4 w-4 mr-2" /> Заблокировать
                            </DropdownMenuItem>
                          )}
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
              {selectedUser && (
                <span>
                  {selectedUser.first_name} {selectedUser.last_name} (@{selectedUser.username || "—"})
                </span>
              )}
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
