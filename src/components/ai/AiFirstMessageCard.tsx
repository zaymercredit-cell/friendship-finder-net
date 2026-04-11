import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2, Sparkles, Copy, Check } from "lucide-react";
import { useAiFirstMessage } from "@/hooks/useAiAssistant";
import { toast } from "sonner";

interface Props {
  targetUserId: string;
  onSelectMessage?: (text: string) => void;
}

export default function AiFirstMessageCard({ targetUserId, onSelectMessage }: Props) {
  const { loading, suggestions, generate } = useAiFirstMessage();
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (suggestions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-primary/5 via-card to-accent/5 rounded-lg border border-primary/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <h4 className="text-[13px] font-semibold text-foreground">Как начать разговор</h4>
        </div>
        <p className="text-[12px] text-muted-foreground mb-3">
          AI подберёт персональные варианты первого сообщения
        </p>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-[12px] border-primary/30 text-primary hover:bg-primary/10"
          onClick={() => generate(targetUserId)}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {loading ? "Генерирую…" : "Предложить сообщения"}
        </Button>
      </div>
    );
  }

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    toast.success("Скопировано");
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 via-card to-accent/5 rounded-lg border border-primary/20 p-4 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-4 w-4 text-primary" />
        <h4 className="text-[13px] font-semibold text-foreground">Варианты первого сообщения</h4>
      </div>
      {suggestions.map((s, i) => (
        <div
          key={i}
          className="bg-card/80 rounded-md border border-border/60 p-3 flex items-start gap-2 group hover:border-primary/30 transition-colors cursor-pointer"
          onClick={() => onSelectMessage?.(s)}
        >
          <p className="text-[13px] text-foreground flex-1 leading-relaxed">"{s}"</p>
          <button
            onClick={(e) => { e.stopPropagation(); handleCopy(s, i); }}
            className="shrink-0 mt-0.5 text-muted-foreground hover:text-primary transition-colors"
          >
            {copiedIdx === i ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      ))}
    </div>
  );
}
