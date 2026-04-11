import { useEffect } from "react";
import { Sparkles, Loader2, MessageCircle } from "lucide-react";
import { useAiMatchInsights } from "@/hooks/useAiAssistant";
import { Button } from "@/components/ui/button";

interface Props {
  targetUserId: string;
  autoLoad?: boolean;
}

export default function AiMatchInsightsCard({ targetUserId, autoLoad = false }: Props) {
  const { loading, insights, generate } = useAiMatchInsights();

  useEffect(() => {
    if (autoLoad && targetUserId) generate(targetUserId);
  }, [autoLoad, targetUserId]);

  if (!insights && !loading) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-[12px] text-muted-foreground hover:text-primary"
        onClick={() => generate(targetUserId)}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        Почему вы совпали
      </Button>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-[12px] text-muted-foreground">Анализирую…</span>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/15 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-[13px] font-semibold text-foreground">Почему вы совпали</span>
      </div>
      <div className="space-y-1.5">
        {insights.reasons.map((r, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <p className="text-[13px] text-foreground/80">{r}</p>
          </div>
        ))}
      </div>
      {insights.conversation_tip && (
        <div className="flex items-start gap-2 bg-card/80 rounded-lg border border-border/50 p-3">
          <MessageCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-[12px] text-muted-foreground">{insights.conversation_tip}</p>
        </div>
      )}
    </div>
  );
}
