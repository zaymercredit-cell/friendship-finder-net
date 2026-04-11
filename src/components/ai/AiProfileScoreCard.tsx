import { Button } from "@/components/ui/button";
import { Brain, Loader2, TrendingUp, ArrowUp } from "lucide-react";
import { useAiProfileScore } from "@/hooks/useAiAssistant";

export default function AiProfileScoreCard() {
  const { loading, score, generate } = useAiProfileScore();

  if (!score && !loading) {
    return (
      <div className="bg-gradient-to-br from-primary/5 via-card to-accent/5 rounded-2xl border border-primary/15 p-5">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h4 className="text-[14px] font-semibold text-foreground">AI-оценка профиля</h4>
            <p className="text-[12px] text-muted-foreground">Узнайте силу своего профиля</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-[13px] mt-3 border-primary/30 text-primary hover:bg-primary/10 rounded-xl"
          onClick={generate}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
          Оценить профиль
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-primary/5 via-card to-accent/5 rounded-2xl border border-primary/15 p-5 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <p className="text-[13px] text-foreground">AI анализирует профиль…</p>
      </div>
    );
  }

  if (!score) return null;

  const scoreColor = score.score >= 80 ? "text-success" : score.score >= 60 ? "text-primary" : score.score >= 40 ? "text-warning" : "text-destructive";
  const bgColor = score.score >= 80 ? "from-success/10" : score.score >= 60 ? "from-primary/10" : score.score >= 40 ? "from-warning/10" : "from-destructive/10";

  return (
    <div className={`bg-gradient-to-br ${bgColor} via-card to-accent/5 rounded-2xl border border-primary/15 p-5 space-y-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h4 className="text-[14px] font-semibold text-foreground">Сила профиля</h4>
            <p className="text-[12px] text-muted-foreground capitalize">{score.level}</p>
          </div>
        </div>
        <div className={`text-3xl font-bold ${scoreColor}`}>{score.score}</div>
      </div>

      {/* Score bar */}
      <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-1000"
          style={{ width: `${score.score}%` }}
        />
      </div>

      {/* Recommendations */}
      {score.recommendations && score.recommendations.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3" />Как улучшить
          </p>
          {score.recommendations.map((r, i) => (
            <div key={i} className="flex items-center gap-3 bg-card/80 rounded-xl border border-border/50 p-3">
              <ArrowUp className="h-3.5 w-3.5 text-success shrink-0" />
              <span className="text-[13px] text-foreground flex-1">{r.action}</span>
              <span className="text-[11px] font-semibold text-success">+{r.impact_points}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
