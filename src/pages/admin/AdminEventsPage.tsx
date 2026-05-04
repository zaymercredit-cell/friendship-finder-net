import { useAdminCheck } from "@/hooks/useAdminCheck";
import { PageSkeleton } from "@/components/ui/content-skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, Loader2, Trash2, Eye, Users, MapPin, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Link } from "react-router-dom";

export default function AdminEventsPage() {
  const { data: isAdmin, isLoading: adminLoading } = useAdminCheck();
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetups")
        .select("*")
        .order("start_time", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!isAdmin,
  });

  // Get participant counts
  const { data: participantCounts } = useQuery({
    queryKey: ["admin-event-participants"],
    queryFn: async () => {
      const { data } = await supabase.from("meetup_participants").select("meetup_id");
      const counts: Record<string, number> = {};
      (data || []).forEach((p: any) => {
        counts[p.meetup_id] = (counts[p.meetup_id] || 0) + 1;
      });
      return counts;
    },
    enabled: !!isAdmin,
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("meetup_participants").delete().eq("meetup_id", id);
      const { error } = await supabase.from("meetups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Событие удалено");
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (adminLoading) {
    return <div className="max-w-7xl mx-auto py-8 px-4"><PageSkeleton /></div>;
  }
  if (!isAdmin) {
    return <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">Доступ запрещён</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <CalendarDays className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">События</h1>
          <p className="text-sm text-muted-foreground">{events?.length || 0} событий</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : !events?.length ? (
        <div className="text-center py-12 text-muted-foreground">Событий пока нет</div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Город</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Участники</TableHead>
                <TableHead>Теги</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((e: any) => {
                const isPast = new Date(e.start_time) < new Date();
                const participantsCount = participantCounts?.[e.id] || 0;
                return (
                  <TableRow key={e.id} className={isPast ? "opacity-60" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                          {e.cover_url ? (
                            <img src={e.cover_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <CalendarDays className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{e.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{e.description || "—"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {e.city || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(e.start_time), "d MMM", { locale: ru })}
                        <span className="text-muted-foreground ml-1 text-xs">
                          {format(new Date(e.start_time), "HH:mm")}
                        </span>
                      </div>
                      {isPast && <Badge variant="secondary" className="text-[10px] mt-1">Прошло</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {participantsCount}/{e.max_participants || "∞"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(e.tags || []).slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                        ))}
                      </div>
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
                            <Link to={`/meetups/${e.id}`}>
                              <Eye className="h-4 w-4 mr-2" /> Открыть
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => deleteEvent.mutate(e.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Удалить
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
    </div>
  );
}
