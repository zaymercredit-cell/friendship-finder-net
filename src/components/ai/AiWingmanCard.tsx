import { useState, useEffect } from "react";
import { Sparkles, Heart, Users, MessageCircle, Compass, Loader2 } from "lucide-react";
import { useAiWingman } from "@/hooks/useAiWingman";
import { cn } from "@/lib/utils";

const vibeEmojis: Record<string, string> = {
  romantic: "💕",
  friendly: "😊",
  intellectual: "🧠",
  adventurous: "🌍",
};

interface Props {
  targetUserId: string;
  className?: string;
}

export default function AiWingmanCard({ targetUserId, className }: Props) {
  const { loading, getInsights } = useAiWingman();
  const [insights, setInsights] = useState<{
    chemistry: string;
    common_ground: string[];
    talk_about: string[];
    vibe: string;
    tip: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getInsights(targetUserId).then(data => {
      if (!cancelled && data) setInsights(data);
    });
    return () => { cancelled = true; };
  }, [targetUserId]);

  if (loading && !insights) {
    return (
      <div className={cn("premium-card p-4 space-y-3", className)}>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-foreground">AI Wingman</h3>
            <p className="text-[11px] text-muted-foreground">Анализирую профиль...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className={cn("premium-card p-4 space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-foreground">AI Wingman</h3>
          <p className="text-[11px] text-muted-foreground">
            {vibeEmojis[insights.vibe] || "✨"} {insights.chemistry}
          </p>
        </div>
      </div>

      {/* Common ground */}
      {insights.common_ground.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
            <Heart className="h-3 w-3 text-destructive" />
            Что у вас общего
          </div>
          <div className="flex flex-wrap gap-1">
            {insights.common_ground.map((item, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/8 text-primary font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Talk about */}
      {insights.talk_about.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
            <MessageCircle className="h-3 w-3 text-primary" />
            О чём поговорить
          </div>
          <div className="space-y-1">
            {insights.talk_about.map((topic, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Compass className="h-2.5 w-2.5 text-primary/50" />
                {topic}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tip */}
      <div className="bg-primary/[0.04] rounded-lg px-3 py-2 text-[11px] text-primary font-medium flex items-start gap-2">
        <Sparkles className="h-3 w-3 shrink-0 mt-0.5" />
        {insights.tip}
      </div>
    </div>
  );
}
