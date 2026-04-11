import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Coffee, MapPin, Calendar, Sparkles, Loader2 } from "lucide-react";
import { useAiWingman } from "@/hooks/useAiWingman";
import { cn } from "@/lib/utils";

interface Props {
  targetUserId: string;
  targetName: string;
  onSelectIdea?: (idea: string) => void;
  className?: string;
}

const typeIcons: Record<string, any> = {
  coffee: Coffee,
  walk: MapPin,
  activity: Sparkles,
  event: Calendar,
};

export default function AiDateIdeasCard({ targetUserId, targetName, onSelectIdea, className }: Props) {
  const { loading, getDateIdeas } = useAiWingman();
  const [ideas, setIdeas] = useState<{ idea: string; emoji: string; description: string; type: string }[] | null>(null);

  const handleGenerate = async () => {
    const data = await getDateIdeas(targetUserId);
    if (data && Array.isArray(data)) {
      setIdeas(data);
    }
  };

  return (
    <div className={cn("premium-card p-4 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-warning/10 flex items-center justify-center">
            <Coffee className="h-3.5 w-3.5 text-warning" />
          </div>
          <h3 className="text-[13px] font-semibold text-foreground">Идеи для встречи</h3>
        </div>
        {!ideas && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-[11px] text-primary gap-1 px-2"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            AI подбор
          </Button>
        )}
      </div>

      {ideas ? (
        <div className="grid grid-cols-2 gap-2">
          {ideas.map((idea, i) => {
            const Icon = typeIcons[idea.type] || Coffee;
            return (
              <button
                key={i}
                onClick={() => onSelectIdea?.(idea.idea)}
                className="flex flex-col items-start gap-1 p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/30 transition-all text-left active:scale-[0.97]"
              >
                <span className="text-[16px]">{idea.emoji}</span>
                <span className="text-[12px] font-semibold text-foreground">{idea.idea}</span>
                <span className="text-[10px] text-muted-foreground line-clamp-2">{idea.description}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          AI подберёт идеи для первой встречи с {targetName}
        </p>
      )}
    </div>
  );
}
