import { useAchievements, ACHIEVEMENT_TYPES } from "@/hooks/useAchievements";
import { Badge } from "@/components/ui/badge";
import { Trophy, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AchievementsPage() {
  const { data: achievements = [], isLoading } = useAchievements();
  const earnedTypes = new Set(achievements.map((a: any) => a.type));

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Trophy className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Достижения</h1>
          <p className="text-sm text-muted-foreground">
            {earnedTypes.size} из {Object.keys(ACHIEVEMENT_TYPES).length} получено
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Прогресс</span>
          <Badge variant="secondary">{Math.round((earnedTypes.size / Object.keys(ACHIEVEMENT_TYPES).length) * 100)}%</Badge>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary rounded-full h-2 transition-all"
            style={{ width: `${(earnedTypes.size / Object.keys(ACHIEVEMENT_TYPES).length) * 100}%` }}
          />
        </div>
      </div>

      {/* Achievements grid */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(ACHIEVEMENT_TYPES).map(([key, ach]) => {
          const earned = earnedTypes.has(key);
          return (
            <div
              key={key}
              className={cn(
                "bg-card rounded-lg border p-4 text-center transition-all",
                earned ? "border-primary/30 shadow-card" : "border-border opacity-60"
              )}
            >
              <div className="text-3xl mb-2">{earned ? ach.icon : "🔒"}</div>
              <p className="text-sm font-semibold text-foreground">{ach.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{ach.desc}</p>
              {earned && (
                <Badge variant="default" className="mt-2 text-[10px]">Получено</Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
