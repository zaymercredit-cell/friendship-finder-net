import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2, Sparkles } from "lucide-react";
import { useAiTopics } from "@/hooks/useAiAssistant";

interface Props {
  targetUserId: string;
  onSelectTopic?: (question: string) => void;
}

export default function AiTopicsCard({ targetUserId, onSelectTopic }: Props) {
  const { loading, topics, generate } = useAiTopics();

  if (topics.length === 0) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-[11px] h-7 text-muted-foreground hover:text-primary"
        onClick={() => generate(targetUserId)}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <MessageSquare className="h-3 w-3" />}
        Темы для разговора
      </Button>
    );
  }

  return (
    <div className="px-3 pb-2">
      <div className="bg-gradient-to-r from-accent/5 to-primary/5 rounded-lg border border-accent/20 p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-medium text-foreground">Темы для разговора</span>
        </div>
        <div className="space-y-1.5">
          {topics.map((t, i) => (
            <button
              key={i}
              onClick={() => onSelectTopic?.(t.question)}
              className="w-full text-left bg-card/80 hover:bg-card rounded-md border border-border/50 hover:border-primary/30 px-3 py-2 transition-colors"
            >
              <p className="text-[11px] font-medium text-primary">{t.topic}</p>
              <p className="text-[12px] text-foreground/80 mt-0.5">{t.question}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
