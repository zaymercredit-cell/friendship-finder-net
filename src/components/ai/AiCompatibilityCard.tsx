import { useEffect } from "react";
import { Loader2, Brain, TrendingUp, Lightbulb } from "lucide-react";
import { useAiCompatibility } from "@/hooks/useAiAssistant";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  targetUserId: string;
  autoLoad?: boolean;
}

export default function AiCompatibilityCard({ targetUserId, autoLoad = false }: Props) {
  const { loading, result, analyze } = useAiCompatibility();

  useEffect(() => {
    if (autoLoad && targetUserId) {
      analyze(targetUserId);
    }
  }, [autoLoad, targetUserId]);

  if (!result && !loading) {
    return (
      <div className="bg-gradient-to-br from-accent/10 via-card to-primary/5 rounded-lg border border-accent/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-4 w-4 text-accent-foreground" />
          <h4 className="text-[13px] font-semibold text-foreground">AI-совместимость</h4>
        </div>
        <p className="text-[12px] text-muted-foreground mb-3">
          AI проанализирует вашу совместимость по интересам и целям
        </p>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-[12px]"
          onClick={() => analyze(targetUserId)}
        >
          <Brain className="h-3.5 w-3.5" />
          Анализировать
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-accent/10 via-card to-primary/5 rounded-lg border border-accent/20 p-4 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <div>
          <p className="text-[13px] font-medium text-foreground">Анализирую совместимость…</p>
          <p className="text-[11px] text-muted-foreground">AI изучает ваши профили</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const scoreColor = result.score >= 80
    ? "text-success"
    : result.score >= 60
      ? "text-primary"
      : "text-muted-foreground";

  return (
    <div className="bg-gradient-to-br from-accent/10 via-card to-primary/5 rounded-lg border border-accent/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h4 className="text-[13px] font-semibold text-foreground">AI-совместимость</h4>
        </div>
        <span className={`text-xl font-bold ${scoreColor}`}>{result.score}%</span>
      </div>

      <p className="text-[13px] text-muted-foreground">{result.summary}</p>

      {result.shared?.length > 0 && (
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />Общие черты
          </p>
          <div className="flex flex-wrap gap-1.5">
            {result.shared.map((s, i) => (
              <Badge key={i} variant="secondary" className="text-[11px] font-normal">{s}</Badge>
            ))}
          </div>
        </div>
      )}

      {result.tips?.length > 0 && (
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <Lightbulb className="h-3 w-3" />Советы для общения
          </p>
          <div className="space-y-1">
            {result.tips.map((t, i) => (
              <p key={i} className="text-[12px] text-foreground/80 pl-3 border-l-2 border-primary/30">{t}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
