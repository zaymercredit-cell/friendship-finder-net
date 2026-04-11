import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2, X } from "lucide-react";
import { useAiReplySuggestions } from "@/hooks/useAiAssistant";

interface Props {
  targetUserId: string;
  lastMessages: { text: string; isMine: boolean }[];
  onSelect: (text: string) => void;
}

export default function AiSuggestMessageButton({ targetUserId, lastMessages, onSelect }: Props) {
  const { loading, suggestions, generate, clear } = useAiReplySuggestions();
  const [open, setOpen] = useState(false);

  const handleGenerate = async () => {
    setOpen(true);
    await generate(targetUserId, lastMessages);
  };

  if (open && (loading || suggestions.length > 0)) {
    return (
      <div className="px-3 pb-2">
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/20 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-medium text-foreground">Варианты ответа</span>
            </div>
            <button onClick={() => { setOpen(false); clear(); }} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span className="text-[12px] text-muted-foreground">Генерирую…</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { onSelect(s); setOpen(false); clear(); }}
                  className="w-full text-left text-[12px] text-foreground bg-card/80 hover:bg-card rounded-md border border-border/50 hover:border-primary/30 px-3 py-2 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 pb-1">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-[11px] h-7 text-muted-foreground hover:text-primary"
        onClick={handleGenerate}
        disabled={loading}
      >
        <Lightbulb className="h-3 w-3" />
        Предложить сообщение
      </Button>
    </div>
  );
}
