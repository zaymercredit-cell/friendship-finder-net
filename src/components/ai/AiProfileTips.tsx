import { useEffect } from "react";
import { Lightbulb, Loader2, ArrowUp, ArrowRight } from "lucide-react";
import { useAiProfileTips } from "@/hooks/useAiAssistant";
import { Button } from "@/components/ui/button";

export default function AiProfileTips() {
  const { loading, tips, generate } = useAiProfileTips();

  if (tips.length === 0 && !loading) {
    return (
      <div className="bg-gradient-to-br from-warning/10 via-card to-primary/5 rounded-lg border border-warning/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-warning" />
          <h4 className="text-[13px] font-semibold text-foreground">AI-советы для профиля</h4>
        </div>
        <p className="text-[12px] text-muted-foreground mb-3">
          Узнайте, как улучшить профиль и получать больше симпатий
        </p>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-[12px] border-warning/30 text-warning hover:bg-warning/10"
          onClick={generate}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lightbulb className="h-3.5 w-3.5" />}
          Получить советы
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-warning/10 via-card to-primary/5 rounded-lg border border-warning/20 p-4 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-warning" />
        <p className="text-[13px] text-foreground">Анализирую профиль…</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-warning/10 via-card to-primary/5 rounded-lg border border-warning/20 p-4 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Lightbulb className="h-4 w-4 text-warning" />
        <h4 className="text-[13px] font-semibold text-foreground">Советы по профилю</h4>
      </div>
      {tips.map((t, i) => (
        <div key={i} className="flex items-start gap-2 bg-card/80 rounded-md border border-border/60 p-3">
          {t.impact === "high" ? (
            <ArrowUp className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
          ) : (
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
          )}
          <p className="text-[12px] text-foreground/80">{t.tip}</p>
        </div>
      ))}
    </div>
  );
}
