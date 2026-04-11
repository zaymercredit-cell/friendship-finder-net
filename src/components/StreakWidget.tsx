import { useStreak } from "@/hooks/useStreaks";
import { Flame, Gift, Zap, Crown, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const milestones = [
  { days: 2, label: "2 дня", icon: Flame, reward: "+5 симпатий", color: "text-orange-500" },
  { days: 5, label: "5 дней", icon: Zap, reward: "Boost профиля", color: "text-primary" },
  { days: 7, label: "7 дней", icon: Crown, reward: "VIP на день", color: "text-warning" },
  { days: 14, label: "14 дней", icon: Star, reward: "Super Like", color: "text-accent" },
  { days: 30, label: "30 дней", icon: Gift, reward: "VIP на 3 дня", color: "text-success" },
];

export default function StreakWidget({ compact = false }: { compact?: boolean }) {
  const { data: streak } = useStreak();
  const current = streak?.current_streak || 0;
  const longest = streak?.longest_streak || 0;

  const nextMilestone = milestones.find(m => m.days > current) || milestones[milestones.length - 1];
  const progress = nextMilestone ? Math.min(100, (current / nextMilestone.days) * 100) : 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Flame className={cn("h-4 w-4", current >= 7 ? "text-orange-500" : current >= 3 ? "text-warning" : "text-muted-foreground")} />
          <span className="text-[14px] font-bold text-foreground">{current}</span>
        </div>
        <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-500 to-warning rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="premium-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500/10 to-warning/10 flex items-center justify-center">
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-foreground">{current} {current === 1 ? "день" : current < 5 ? "дня" : "дней"} подряд 🔥</p>
            <p className="text-[11px] text-muted-foreground">Рекорд: {longest} дн.</p>
          </div>
        </div>
        {current >= 7 && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-warning/10 text-warning px-2 py-1 rounded-lg">
            Огонь!
          </span>
        )}
      </div>

      {/* Progress to next milestone */}
      {nextMilestone && current < nextMilestone.days && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">До награды «{nextMilestone.reward}»</span>
            <span className="font-semibold text-foreground">{current}/{nextMilestone.days}</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-warning rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Milestones row */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
        {milestones.map(m => {
          const achieved = current >= m.days;
          return (
            <div key={m.days} className={cn(
              "shrink-0 flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl text-center transition-all",
              achieved ? "bg-primary/8" : "bg-secondary/50 opacity-60"
            )}>
              <m.icon className={cn("h-4 w-4", achieved ? m.color : "text-muted-foreground")} />
              <span className="text-[10px] font-semibold text-foreground">{m.label}</span>
              <span className="text-[9px] text-muted-foreground leading-tight">{m.reward}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
