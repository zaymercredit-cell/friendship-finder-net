import { Brain, Heart, MessageCircle, Smile, Shield, Compass } from "lucide-react";

const temperamentMap: Record<string, { label: string; emoji: string; color: string }> = {
  sanguine: { label: "Сангвиник", emoji: "☀️", color: "bg-amber-500/10 text-amber-600" },
  choleric: { label: "Холерик", emoji: "🔥", color: "bg-red-500/10 text-red-500" },
  melancholic: { label: "Меланхолик", emoji: "🌙", color: "bg-indigo-500/10 text-indigo-500" },
  phlegmatic: { label: "Флегматик", emoji: "🌊", color: "bg-cyan-500/10 text-cyan-600" },
};

const styleMap: Record<string, { label: string; emoji: string }> = {
  direct: { label: "Прямой", emoji: "🎯" },
  gentle: { label: "Мягкий", emoji: "🌸" },
  humorous: { label: "С юмором", emoji: "😄" },
  deep: { label: "Глубокий", emoji: "🧠" },
  playful: { label: "Игривый", emoji: "✨" },
};

interface Props {
  temperament?: string;
  personalityType?: string;
  communicationStyle?: string;
  isOwnProfile?: boolean;
}

export default function PersonalityBlock({ temperament, personalityType, communicationStyle, isOwnProfile }: Props) {
  const temp = temperament ? temperamentMap[temperament] : null;
  const style = communicationStyle ? styleMap[communicationStyle] : null;
  const hasData = temp || personalityType || style;

  if (!hasData && !isOwnProfile) return null;

  return (
    <div className="rounded-2xl border border-border/40 p-5 md:p-6 bg-gradient-to-br from-violet-500/[0.02] via-card to-indigo-500/[0.02]">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-8 w-8 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
          <Brain className="h-4 w-4 text-violet-500" />
        </div>
        <h3 className="text-[15px] font-semibold text-foreground">Личность</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Temperament */}
        <div className="bg-secondary/40 rounded-xl p-3.5 text-center">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-1">Темперамент</span>
          {temp ? (
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-lg">{temp.emoji}</span>
              <span className={`text-[13px] font-semibold px-2 py-0.5 rounded-full ${temp.color}`}>{temp.label}</span>
            </div>
          ) : (
            <span className="text-[13px] text-muted-foreground/60">{isOwnProfile ? "Не указано" : "—"}</span>
          )}
        </div>

        {/* Personality type */}
        <div className="bg-secondary/40 rounded-xl p-3.5 text-center">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-1">Тип личности</span>
          {personalityType ? (
            <span className="text-[14px] font-bold text-foreground">{personalityType}</span>
          ) : (
            <span className="text-[13px] text-muted-foreground/60">{isOwnProfile ? "Пройти тест" : "—"}</span>
          )}
        </div>

        {/* Communication style */}
        <div className="bg-secondary/40 rounded-xl p-3.5 text-center">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-1">Стиль общения</span>
          {style ? (
            <div className="flex items-center justify-center gap-1.5">
              <span>{style.emoji}</span>
              <span className="text-[13px] font-semibold text-foreground">{style.label}</span>
            </div>
          ) : (
            <span className="text-[13px] text-muted-foreground/60">{isOwnProfile ? "Не указано" : "—"}</span>
          )}
        </div>
      </div>
    </div>
  );
}
