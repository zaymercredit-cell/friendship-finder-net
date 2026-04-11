import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, Heart, Coffee, Zap, Loader2 } from "lucide-react";
import { useAiWingman } from "@/hooks/useAiWingman";
import { cn } from "@/lib/utils";

interface Props {
  targetUserId: string;
  targetName: string;
  onSelectStarter: (text: string) => void;
  className?: string;
}

export default function AiConversationStarters({ targetUserId, targetName, onSelectStarter, className }: Props) {
  const { loading, getConversationStarters } = useAiWingman();
  const [starters, setStarters] = useState<{ text: string; category: string; emoji: string }[] | null>(null);
  const [shown, setShown] = useState(false);

  const categoryIcons: Record<string, any> = {
    interests: Sparkles,
    humor: Coffee,
    question: MessageCircle,
    compliment: Heart,
  };

  const handleGenerate = async () => {
    setShown(true);
    const data = await getConversationStarters(targetUserId);
    if (data && Array.isArray(data)) {
      setStarters(data);
    }
  };

  if (!shown) {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-2 bg-primary/[0.03] rounded-xl border border-primary/10", className)}>
        <Sparkles className="h-4 w-4 text-primary shrink-0" />
        <span className="text-[12px] text-muted-foreground flex-1">
          AI Wingman может помочь начать разговор с {targetName}
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-[11px] text-primary hover:text-primary font-semibold gap-1 px-2"
          onClick={handleGenerate}
        >
          <Zap className="h-3 w-3" />
          Подсказать
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2 px-3 py-2 bg-primary/[0.03] rounded-xl border border-primary/10", className)}>
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="text-[11px] font-semibold text-primary">AI Wingman</span>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-[12px] text-muted-foreground">Думаю...</span>
        </div>
      ) : starters ? (
        <div className="space-y-1.5">
          {starters.map((s, i) => {
            const Icon = categoryIcons[s.category] || MessageCircle;
            return (
              <button
                key={i}
                onClick={() => onSelectStarter(s.text)}
                className="w-full flex items-start gap-2 px-2.5 py-2 rounded-lg bg-card hover:bg-secondary/80 border border-border/40 transition-all text-left group active:scale-[0.98]"
              >
                <span className="text-[14px] shrink-0 mt-0.5">{s.emoji}</span>
                <span className="text-[12px] text-foreground leading-snug group-hover:text-primary transition-colors">{s.text}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground">Не удалось загрузить подсказки</p>
      )}
      {starters && (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 text-[10px] text-muted-foreground px-1"
          onClick={handleGenerate}
          disabled={loading}
        >
          Обновить подсказки
        </Button>
      )}
    </div>
  );
}
