import { Button } from "@/components/ui/button";
import { Zap, Loader2, Copy, Check } from "lucide-react";
import { useAiIcebreaker } from "@/hooks/useAiAssistant";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  targetUserId?: string;
  onSelect?: (question: string) => void;
}

export default function AiIcebreakerCard({ targetUserId, onSelect }: Props) {
  const { loading, questions, generate } = useAiIcebreaker();
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    toast.success("Скопировано");
  };

  if (questions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-warning/10 via-card to-accent/5 rounded-2xl border border-warning/20 p-5">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="h-9 w-9 rounded-xl bg-warning/15 flex items-center justify-center">
            <Zap className="h-4.5 w-4.5 text-warning" />
          </div>
          <div>
            <h4 className="text-[14px] font-semibold text-foreground">Сгенерировать вопрос</h4>
            <p className="text-[12px] text-muted-foreground">AI подберёт интересные icebreaker-вопросы</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-[13px] mt-3 border-warning/30 text-warning hover:bg-warning/10 rounded-xl"
          onClick={() => generate(targetUserId)}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
          {loading ? "Генерирую…" : "Сгенерировать вопросы"}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-warning/10 via-card to-accent/5 rounded-2xl border border-warning/20 p-5 space-y-2.5">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="h-4 w-4 text-warning" />
        <h4 className="text-[14px] font-semibold text-foreground">Icebreaker вопросы</h4>
      </div>
      {questions.map((q, i) => (
        <div
          key={i}
          className="bg-card/80 rounded-xl border border-border/50 hover:border-warning/30 p-3.5 flex items-start gap-2.5 group transition-colors cursor-pointer"
          onClick={() => onSelect?.(q)}
        >
          <p className="text-[13px] text-foreground flex-1 leading-relaxed">"{q}"</p>
          <button
            onClick={(e) => { e.stopPropagation(); handleCopy(q, i); }}
            className="shrink-0 mt-0.5 text-muted-foreground hover:text-warning transition-colors"
          >
            {copiedIdx === i ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      ))}
    </div>
  );
}
