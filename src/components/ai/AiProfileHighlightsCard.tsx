import { Button } from "@/components/ui/button";
import { Star, Loader2 } from "lucide-react";
import { useAiProfileHighlights } from "@/hooks/useAiAssistant";

export default function AiProfileHighlightsCard() {
  const { loading, highlights, generate } = useAiProfileHighlights();

  if (highlights.length === 0 && !loading) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-[12px] border-primary/20 text-primary hover:bg-primary/10 rounded-xl"
        onClick={generate}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Star className="h-3.5 w-3.5" />}
        AI-подсветка профиля
      </Button>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-1">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        <span className="text-[12px] text-muted-foreground">Анализирую…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {highlights.map((h, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 text-[12px] bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/15 px-3 py-1.5 rounded-full font-medium"
        >
          <span>{h.emoji}</span>
          {h.highlight}
        </span>
      ))}
    </div>
  );
}
