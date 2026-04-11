import { useNewProfiles } from "@/hooks/useNewProfiles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

export default function NewTodayBlock() {
  const { data: newUsers, isLoading } = useNewProfiles(8);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border/60 card-shadow p-4">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus className="h-4 w-4 text-success" />
          <span className="text-[14px] font-semibold text-foreground">Новые сегодня</span>
        </div>
        <div className="flex gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shrink-0 text-center">
              <Skeleton className="h-14 w-14 rounded-full" />
              <Skeleton className="h-3 w-12 mt-1 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!newUsers || newUsers.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border/60 card-shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-success" />
          <span className="text-[14px] font-semibold text-foreground">Новые сегодня</span>
        </div>
        <Link to="/discover">
          <Button variant="ghost" size="sm" className="text-[12px] text-primary h-7">Все →</Button>
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {newUsers.map(u => (
          <Link key={u.user_id} to={`/profile/${u.username || u.user_id}`} className="shrink-0 text-center group">
            <div className="relative">
              <Avatar className="h-14 w-14 ring-2 ring-success/20 group-hover:ring-success/50 transition-all">
                <AvatarImage src={u.avatar_url || undefined} alt={u.first_name} className="object-cover" />
                <AvatarFallback>{u.first_name[0]}</AvatarFallback>
              </Avatar>
              {u.is_online && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-card" />
              )}
            </div>
            <p className="text-[11px] text-foreground mt-1 font-medium truncate w-14">{u.first_name}</p>
            {u.age && <p className="text-[10px] text-muted-foreground">{u.age}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
