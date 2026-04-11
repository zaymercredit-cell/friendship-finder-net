import { Sparkles, MessageCircle, Heart, Lightbulb } from "lucide-react";
import { useMemo } from "react";

interface Props {
  targetName: string;
  commonInterests: string[];
  commonGoals: string[];
  temperament?: string;
  communicationStyle?: string;
}

export default function AiProfileInsights({ targetName, commonInterests, commonGoals, temperament, communicationStyle }: Props) {
  const insights = useMemo(() => {
    const result: { icon: any; title: string; text: string; color: string }[] = [];

    // Why easy to talk to
    const reasons: string[] = [];
    if (commonInterests.length >= 3) reasons.push(`у вас ${commonInterests.length} общих интересов`);
    if (commonGoals.length > 0) reasons.push("совпадают цели общения");
    if (communicationStyle === "humorous") reasons.push("любит шутить — легко начать разговор");
    if (communicationStyle === "gentle") reasons.push("мягкий стиль общения — комфортно общаться");
    if (temperament === "sanguine") reasons.push("сангвиник — общительный и энергичный");

    if (reasons.length > 0) {
      result.push({
        icon: MessageCircle,
        title: `Почему легко общаться с ${targetName}`,
        text: reasons.join(", ").replace(/^./, s => s.toUpperCase()),
        color: "text-blue-500 bg-blue-500/10",
      });
    }

    // Topics
    const topics: string[] = [];
    if (commonInterests.length > 0) topics.push(...commonInterests.slice(0, 3).map(i => `обсудите ${i.toLowerCase()}`));
    if (topics.length === 0) topics.push("спросите о любимых местах", "обсудите хобби");

    result.push({
      icon: Lightbulb,
      title: "Темы для разговора",
      text: topics.join(" • "),
      color: "text-amber-500 bg-amber-500/10",
    });

    // What in common
    if (commonInterests.length > 0 || commonGoals.length > 0) {
      const commonItems = [...commonInterests.slice(0, 3), ...commonGoals.slice(0, 2)];
      result.push({
        icon: Heart,
        title: "Что у вас общего",
        text: commonItems.join(", "),
        color: "text-rose-500 bg-rose-500/10",
      });
    }

    return result;
  }, [targetName, commonInterests, commonGoals, temperament, communicationStyle]);

  if (insights.length === 0) return null;

  return (
    <div className="rounded-2xl border border-primary/10 p-5 md:p-6 bg-gradient-to-br from-primary/[0.03] via-card to-violet-500/[0.02]">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-[15px] font-semibold text-foreground">AI-инсайты</h3>
        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">AI</span>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          return (
            <div key={i} className="flex items-start gap-3 bg-secondary/30 rounded-xl p-3.5">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${insight.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-foreground">{insight.title}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">{insight.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
