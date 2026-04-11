import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WingmanInsights {
  chemistry: string;
  common_ground: string[];
  talk_about: string[];
  vibe: string;
  tip: string;
}

interface SmartReply {
  text: string;
  tone: string;
  emoji: string;
}

interface DateIdea {
  idea: string;
  emoji: string;
  description: string;
  type: string;
}

interface ConversationStarter {
  text: string;
  category: string;
  emoji: string;
}

interface CoachNudge {
  nudge: string;
  tone: string;
  suggest_meetup: boolean;
  energy: string;
}

export function useAiWingman() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const callWingman = async (type: string, params: Record<string, any> = {}) => {
    if (!user) return null;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-wingman", {
        body: { type, ...params },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return null;
      }
      return data?.data;
    } catch (e: any) {
      console.error("AI Wingman error:", e);
      toast.error("AI Wingman временно недоступен");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getInsights = (targetUserId: string) =>
    callWingman("wingman_insights", { targetUserId }) as Promise<WingmanInsights | null>;

  const getSmartReplies = (targetUserId: string, lastMessages: { text: string; isMine: boolean }[]) =>
    callWingman("smart_replies", { targetUserId, lastMessages }) as Promise<SmartReply[] | null>;

  const getDateIdeas = (targetUserId: string) =>
    callWingman("date_ideas", { targetUserId }) as Promise<DateIdea[] | null>;

  const getConversationStarters = (targetUserId: string) =>
    callWingman("conversation_starters", { targetUserId }) as Promise<ConversationStarter[] | null>;

  const getCoachNudge = (targetUserId: string, lastMessages: { text: string; isMine: boolean }[]) =>
    callWingman("conversation_coach", { targetUserId, lastMessages }) as Promise<CoachNudge | null>;

  return { loading, getInsights, getSmartReplies, getDateIdeas, getConversationStarters, getCoachNudge };
}
