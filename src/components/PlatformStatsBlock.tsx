import { usePlatformStats } from "@/hooks/useNewProfiles";
import { Users, Heart, Sparkles } from "lucide-react";

export default function PlatformStatsBlock() {
  const { data: stats } = usePlatformStats();

  if (!stats || (stats.totalUsers === 0 && stats.todayLikes === 0)) return null;

  return (
    <div className="bg-card rounded-xl border border-border/60 card-shadow p-4">
      <p className="text-[14px] font-semibold text-foreground mb-3">Сегодня на платформе</p>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-2 rounded-lg bg-secondary/40">
          <Users className="h-4 w-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{stats.totalUsers.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">пользователей</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-secondary/40">
          <Heart className="h-4 w-4 text-destructive mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{stats.todayLikes.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">симпатий сегодня</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-secondary/40">
          <Sparkles className="h-4 w-4 text-warning mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{stats.totalMatches.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">совпадений</p>
        </div>
      </div>
    </div>
  );
}
