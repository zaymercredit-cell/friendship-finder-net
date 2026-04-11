import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Smile, Brain, Loader2 } from "lucide-react";
import { useAiWingman } from "@/hooks/useAiWingman";
import { cn } from "@/lib/utils";

interface Props {
  targetUserId: string;
  lastMessages: { text: string; isMine: boolean }[];
  onSelect: (text: string) => void;
  className?: string;
}

const toneIcons: Record<string, { icon: any; label: string; color: string }> = {
  friendly: { icon: Smile, label: "Дружелюбно", color: "text-success" },
  playful: { icon: Sparkles, label: "Игриво", color: "text-warning" },
  deep: { icon: Brain, label: "Серьёзно", color: "text-primary" },
};

export default function AiSmartReplies({ targetUserId, lastMessages, onSelect, className }: Props) {
  const { loading, getSmartReplies } = useAiWingman();
  const [replies, setReplies] = useState<{ text: string; tone: string; emoji: string }[] | null>(null);

  const handleGenerate = async () => {
    const data = await getSmartReplies(targetUserId, lastMessages);
    if (data && Array.isArray(data)) {
      setReplies(data);
    }
  };

  if (!replies) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn("h-7 text-[10.5px] gap-1 text-primary hover:text-primary px-2", className)}
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
        Умные ответы
      </Button>
    );
  }

  return (
    <div className={cn("flex gap-1.5 overflow-x-auto scrollbar-hide py-1", className)}>
      {replies.map((r, i) => {
        const toneInfo = toneIcons[r.tone] || toneIcons.friendly;
        return (
          <button
            key={i}
            onClick={() => { onSelect(r.text); setReplies(null); }}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/80 hover:bg-primary/10 border border-border/40 text-[11px] text-foreground transition-all active:scale-[0.97] max-w-[200px]"
          >
            <span>{r.emoji}</span>
            <span className="truncate">{r.text}</span>
          </button>
        );
      })}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-[10px] text-muted-foreground px-1.5 shrink-0"
        onClick={handleGenerate}
        disabled={loading}
      >
        ↻
      </Button>
    </div>
  );
}
