import { Heart, MessageCircle, Users, Sparkles } from "lucide-react";

const styles: Record<string, { icon: any; label: string; color: string; description: string }> = {
  "лёгкое общение": { icon: MessageCircle, label: "Лёгкое общение", color: "border-blue-500/20 bg-blue-500/5", description: "Без обязательств, интересные разговоры" },
  "серьёзные отношения": { icon: Heart, label: "Серьёзные отношения", color: "border-rose-500/20 bg-rose-500/5", description: "Ищу партнёра для долгих отношений" },
  "дружба": { icon: Users, label: "Дружба", color: "border-amber-500/20 bg-amber-500/5", description: "Новые знакомства и дружба" },
  "any": { icon: Sparkles, label: "Открыт(а) ко всему", color: "border-violet-500/20 bg-violet-500/5", description: "Посмотрим, куда приведёт" },
};

interface Props {
  goals: string[];
  datingStyle?: string;
  isOwnProfile?: boolean;
}

export default function DatingStyleBlock({ goals, datingStyle, isOwnProfile }: Props) {
  if (goals.length === 0 && !datingStyle && !isOwnProfile) return null;

  const activeStyles = goals.length > 0
    ? goals.map(g => styles[g.toLowerCase()] || { icon: Sparkles, label: g, color: "border-border bg-secondary/30", description: "" })
    : datingStyle && styles[datingStyle]
      ? [styles[datingStyle]]
      : [];

  return (
    <div className="rounded-2xl border border-border/40 p-5 md:p-6 bg-gradient-to-br from-rose-500/[0.02] via-card to-amber-500/[0.02]">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-rose-500/10 to-amber-500/10 flex items-center justify-center shrink-0">
          <Heart className="h-4 w-4 text-rose-500" />
        </div>
        <h3 className="text-[15px] font-semibold text-foreground">Стиль знакомств</h3>
      </div>

      {activeStyles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeStyles.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className={`flex items-start gap-3 rounded-xl border ${s.color} p-3.5 transition-all hover:scale-[1.02]`}>
                <Icon className="h-5 w-5 text-foreground/70 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{s.label}</p>
                  {s.description && <p className="text-[11px] text-muted-foreground mt-0.5">{s.description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[13px] text-muted-foreground/60">Не указано</p>
      )}
    </div>
  );
}
