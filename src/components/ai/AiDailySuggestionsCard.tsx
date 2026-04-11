import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Users, Calendar, Zap } from "lucide-react";
import { useAiDailySuggestions } from "@/hooks/useAiAssistant";

const typeIcons: Record<string, any> = {
  people: Users,
  event: Calendar,
  action: Zap,
};

export default function AiDailySuggestionsCard() {
  const { loading, suggestions, generate } = useAiDailySuggestions();

  if (!suggestions && !loading) {
    return (
      <div className="premium-card p-5 bg-gradient-to-r from-primary/[0.04] to-accent/[0.04]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-foreground">AI рекомендует</h3>
              <p className="text-[12px] text-muted-foreground">Персональные рекомендации на сегодня</p>
            </div>
          </div>
          <Button
            size="sm"
            className="gap-1.5 text-[12px] rounded-xl"
            onClick={generate}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Узнать
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="premium-card p-5 bg-gradient-to-r from-primary/[0.04] to-accent/[0.04]">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-[14px] text-foreground">AI анализирует…</p>
        </div>
      </div>
    );
  }

  if (!suggestions) return null;

  return (
    <div className="premium-card p-5 bg-gradient-to-r from-primary/[0.04] to-accent/[0.04] space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-foreground">AI рекомендует</h3>
          <p className="text-[13px] text-muted-foreground">{suggestions.greeting}</p>
        </div>
      </div>
      <div className="space-y-2">
        {suggestions.tips.map((tip, i) => {
          const Icon = typeIcons[tip.type] || Sparkles;
          return (
            <div
              key={i}
              className="flex items-start gap-3 bg-card/80 rounded-xl border border-border/50 p-3.5 hover:border-primary/20 transition-colors"
            >
              <span className="text-lg shrink-0">{tip.emoji}</span>
              <p className="text-[13px] text-foreground leading-relaxed flex-1">{tip.text}</p>
              <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
