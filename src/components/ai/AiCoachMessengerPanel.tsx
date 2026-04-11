import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, MessageCircle, Sparkles, Calendar, HelpCircle, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Props {
  targetUserId: string;
  targetName: string;
  lastMessages: { text: string; isMine: boolean }[];
  onSelect: (text: string) => void;
}

const actions = [
  { label: "Как ответить", icon: MessageCircle, type: "reply_suggestions" },
  { label: "Продолжить", icon: Sparkles, type: "conversation_topics" },
  { label: "К встрече", icon: Calendar, type: "conversation_topics" },
  { label: "Что спросить", icon: HelpCircle, type: "icebreaker" },
];

export default function AiCoachMessengerPanel({ targetUserId, targetName, lastMessages, onSelect }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const generate = async (type: string) => {
    if (!user) return;
    setLoading(true);
    setOpen(true);
    setSuggestions([]);

    try {
      const { data, error } = await supabase.functions.invoke("ai-dating-assistant", {
        body: { type, targetUserId, lastMessages },
      });
      if (error) throw error;
      const result = data?.data;
      if (Array.isArray(result)) {
        setSuggestions(result.map((r: any) => typeof r === "string" ? r : r?.question || r?.topic || r?.text || JSON.stringify(r)));
      } else if (result?.tips) {
        setSuggestions(result.tips);
      }
    } catch {
      toast.error("AI Coach недоступен");
    } finally {
      setLoading(false);
    }
  };

  if (open && (loading || suggestions.length > 0)) {
    return (
      <div className="bg-gradient-to-r from-primary/[0.03] to-accent/[0.03] border-t border-primary/10 px-3 py-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Brain className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-semibold text-foreground">AI Coach</span>
          </div>
          <button onClick={() => { setOpen(false); setSuggestions([]); }} className="text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 py-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            <span className="text-[11px] text-muted-foreground">Анализирую переписку...</span>
          </div>
        ) : (
          <div className="space-y-1">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => { onSelect(s); setOpen(false); setSuggestions([]); }}
                className="w-full text-left text-[11.5px] text-foreground bg-card/80 hover:bg-card rounded-lg border border-border/40 hover:border-primary/20 px-3 py-2 transition-all duration-200"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 border-t border-border/40 bg-card/30">
      <div className="flex items-center gap-0.5 mr-1">
        <Brain className="h-3 w-3 text-primary/60" />
        <span className="text-[10px] font-medium text-muted-foreground">Coach</span>
      </div>
      {actions.map(({ label, icon: Icon, type }) => (
        <Button
          key={type + label}
          variant="ghost"
          size="sm"
          className="text-[10.5px] gap-1 text-muted-foreground hover:text-primary h-7 px-2 rounded-lg"
          onClick={() => generate(type)}
        >
          <Icon className="h-3 w-3" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
}
