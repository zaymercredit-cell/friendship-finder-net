import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, MessageCircle, Heart, Calendar, HelpCircle, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Props {
  targetUserId: string;
  targetName: string;
  context: "profile" | "messenger" | "match";
  lastMessages?: { text: string; isMine: boolean }[];
  onSelectText?: (text: string) => void;
}

const contextLabels = {
  profile: "Как лучше познакомиться",
  messenger: "AI Coach",
  match: "Как начать общение",
};

const contextActions = {
  profile: [
    { label: "Что зацепить в разговоре", icon: MessageCircle, type: "profile_advice" },
    { label: "Общие интересы", icon: Heart, type: "compatibility_analysis" },
    { label: "Стиль общения", icon: Brain, type: "coach_style" },
  ],
  messenger: [
    { label: "Как ответить", icon: MessageCircle, type: "reply_suggestions" },
    { label: "Продолжить разговор", icon: Sparkles, type: "coach_continue" },
    { label: "Перейти к встрече", icon: Calendar, type: "coach_date" },
    { label: "Что спросить", icon: HelpCircle, type: "coach_question" },
  ],
  match: [
    { label: "Первое сообщение", icon: MessageCircle, type: "first_message" },
    { label: "Темы разговора", icon: Sparkles, type: "conversation_topics" },
    { label: "Идея для общения", icon: Brain, type: "coach_idea" },
  ],
};

export default function AiCoachCard({ targetUserId, targetName, context, lastMessages, onSelectText }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeType, setActiveType] = useState<string | null>(null);

  const generate = async (type: string) => {
    if (!user) return;
    setLoading(true);
    setActiveType(type);
    setResult(null);

    try {
      // Map coach-specific types to existing edge function types
      let mappedType = type;
      if (type === "coach_style" || type === "coach_idea") mappedType = "compatibility_analysis";
      if (type === "coach_continue" || type === "coach_question") mappedType = "reply_suggestions";
      if (type === "coach_date") mappedType = "conversation_topics";
      if (type === "profile_advice") mappedType = "compatibility_analysis";

      const { data, error } = await supabase.functions.invoke("ai-dating-assistant", {
        body: { type: mappedType, targetUserId, lastMessages },
      });
      if (error) throw error;
      setResult(data?.data);
    } catch (e) {
      toast.error("Не удалось получить совет AI");
    } finally {
      setLoading(false);
    }
  };

  const actions = contextActions[context];

  return (
    <div className="premium-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center">
          <Brain className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-semibold text-foreground">{contextLabels[context]}</h3>
          <p className="text-[11px] text-muted-foreground">AI проанализирует и даст совет</p>
        </div>
        {result && (
          <button onClick={() => { setResult(null); setActiveType(null); }} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Actions */}
      {!result && !loading && (
        <div className="px-4 pb-4 pt-1 flex flex-wrap gap-1.5">
          {actions.map(({ label, icon: Icon, type }) => (
            <Button
              key={type}
              variant="secondary"
              size="sm"
              className="gap-1.5 text-[11px] h-8 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => generate(type)}
            >
              <Icon className="h-3 w-3" />
              {label}
            </Button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="px-4 pb-4 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-[12px] text-muted-foreground">AI анализирует...</span>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="px-4 pb-4 space-y-2">
          {/* Array result (suggestions) */}
          {Array.isArray(result) && result.map((item: any, i: number) => {
            const text = typeof item === "string" ? item : item?.topic || item?.question || item?.text || JSON.stringify(item);
            return (
              <button
                key={i}
                onClick={() => onSelectText?.(text)}
                className="w-full text-left text-[12px] text-foreground bg-secondary/50 hover:bg-primary/10 hover:text-primary rounded-xl border border-border/30 hover:border-primary/20 px-3.5 py-2.5 transition-all duration-200"
              >
                {text}
              </button>
            );
          })}

          {/* Object result (analysis) */}
          {!Array.isArray(result) && typeof result === "object" && (
            <div className="space-y-2.5">
              {result.score !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">{result.score}%</span>
                  <span className="text-[12px] text-muted-foreground">{result.summary}</span>
                </div>
              )}
              {result.shared && (
                <div className="flex flex-wrap gap-1.5">
                  {result.shared.map((s: string, i: number) => (
                    <span key={i} className="text-[11px] bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              )}
              {result.tips && (
                <div className="space-y-1">
                  {result.tips.map((tip: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => onSelectText?.(tip)}
                      className="w-full text-left text-[12px] text-foreground bg-secondary/50 hover:bg-primary/10 rounded-xl px-3.5 py-2 transition-all"
                    >
                      💡 {tip}
                    </button>
                  ))}
                </div>
              )}
              {result.communication_style && (
                <p className="text-[12px] text-muted-foreground bg-accent/5 rounded-lg px-3 py-2 border border-accent/10">
                  🎯 {result.communication_style}
                </p>
              )}
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-[11px] h-7 text-muted-foreground hover:text-primary gap-1"
            onClick={() => generate(activeType!)}
          >
            <Sparkles className="h-3 w-3" />
            Новый совет
          </Button>
        </div>
      )}
    </div>
  );
}
