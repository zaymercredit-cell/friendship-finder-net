import { Trophy, Heart, MessageCircle, Star, Sparkles, UserCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const moments = [
  { icon: UserCheck, label: "Создали профиль", emoji: "🎉", gradient: "from-blue-500/10 to-cyan-500/10", color: "text-blue-500" },
  { icon: Heart, label: "Первая симпатия", emoji: "💕", gradient: "from-rose-500/10 to-pink-500/10", color: "text-rose-500" },
  { icon: Star, label: "Первое совпадение", emoji: "⭐", gradient: "from-amber-500/10 to-yellow-500/10", color: "text-amber-500" },
  { icon: MessageCircle, label: "Первый чат", emoji: "💬", gradient: "from-violet-500/10 to-purple-500/10", color: "text-violet-500" },
];

export default function PersonalMomentsBlock() {
  const { profile } = useAuth();
  if (!profile) return null;

  // Simple heuristic: show first 2 as achieved for any active user
  const achieved = 2;

  return (
    <div className="premium-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
          <Trophy className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-foreground">Ваши моменты</h3>
          <p className="text-[11px] text-muted-foreground">{achieved} из {moments.length} достигнуто</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {moments.map((m, i) => {
          const done = i < achieved;
          return (
            <div
              key={m.label}
              className={cn(
                "flex items-center gap-2.5 p-3 rounded-xl transition-all",
                done ? `bg-gradient-to-r ${m.gradient}` : "bg-secondary/30 opacity-50"
              )}
            >
              <span className="text-lg">{m.emoji}</span>
              <div className="min-w-0">
                <p className={cn("text-[12px] font-semibold truncate", done ? "text-foreground" : "text-muted-foreground")}>
                  {m.label}
                </p>
                {done && <p className="text-[10px] text-muted-foreground">✓ Достигнуто</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
