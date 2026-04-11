import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FirstMessageResult { data: string[]; }
interface ReplyResult { data: string[]; }
interface TopicsResult { data: { topic: string; question: string }[]; }
interface CompatibilityResult { data: { score: number; summary: string; shared: string[]; tips: string[]; }; }
interface ProfileTipsResult { data: { tip: string; impact: string }[]; }
interface IcebreakerResult { data: string[]; }
interface ProfileHighlightsResult { data: { highlight: string; emoji: string }[]; }
interface ProfileScoreResult { data: { score: number; level: string; recommendations: { action: string; impact_points: number }[]; }; }
interface DailySuggestionsResult { data: { greeting: string; tips: { type: string; text: string; emoji: string }[]; }; }
interface MatchInsightsResult { data: { reasons: string[]; conversation_tip: string; }; }

function useAiCall<T>(type: string) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<T | null>(null);

  const call = useCallback(async (body: Record<string, any>) => {
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-dating-assistant", {
        body: { type, ...body },
      });
      if (error) throw error;
      setResult(data?.data ?? null);
      return data?.data ?? null;
    } catch (e: any) {
      console.error(e);
      toast.error("AI сервис временно недоступен");
      return null;
    } finally {
      setLoading(false);
    }
  }, [type]);

  return { loading, result, call, clear: () => setResult(null) };
}

export function useAiFirstMessage() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generate = useCallback(async (targetUserId: string) => {
    setLoading(true);
    setSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke("ai-dating-assistant", {
        body: { type: "first_message", targetUserId },
      });
      if (error) throw error;
      const result = data as FirstMessageResult;
      setSuggestions(Array.isArray(result.data) ? result.data : []);
    } catch (e: any) {
      console.error(e);
      toast.error("Не удалось сгенерировать подсказки");
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, suggestions, generate, clear: () => setSuggestions([]) };
}

export function useAiReplySuggestions() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generate = useCallback(async (targetUserId: string, lastMessages: { text: string; isMine: boolean }[]) => {
    setLoading(true);
    setSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke("ai-dating-assistant", {
        body: { type: "reply_suggestions", targetUserId, lastMessages },
      });
      if (error) throw error;
      const result = data as ReplyResult;
      setSuggestions(Array.isArray(result.data) ? result.data : []);
    } catch (e: any) {
      console.error(e);
      toast.error("Не удалось сгенерировать ответы");
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, suggestions, generate, clear: () => setSuggestions([]) };
}

export function useAiTopics() {
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<{ topic: string; question: string }[]>([]);

  const generate = useCallback(async (targetUserId: string) => {
    setLoading(true);
    setTopics([]);
    try {
      const { data, error } = await supabase.functions.invoke("ai-dating-assistant", {
        body: { type: "conversation_topics", targetUserId },
      });
      if (error) throw error;
      const result = data as TopicsResult;
      setTopics(Array.isArray(result.data) ? result.data : []);
    } catch (e: any) {
      console.error(e);
      toast.error("Не удалось загрузить темы");
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, topics, generate, clear: () => setTopics([]) };
}

export function useAiCompatibility() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompatibilityResult["data"] | null>(null);

  const analyze = useCallback(async (targetUserId: string) => {
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-dating-assistant", {
        body: { type: "compatibility_analysis", targetUserId },
      });
      if (error) throw error;
      const res = data as CompatibilityResult;
      setResult(res.data && typeof res.data === "object" && !Array.isArray(res.data) ? res.data : null);
    } catch (e: any) {
      console.error(e);
      toast.error("Не удалось проанализировать совместимость");
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, result, analyze };
}

export function useAiProfileTips() {
  const [loading, setLoading] = useState(false);
  const [tips, setTips] = useState<{ tip: string; impact: string }[]>([]);

  const generate = useCallback(async () => {
    setLoading(true);
    setTips([]);
    try {
      const { data, error } = await supabase.functions.invoke("ai-dating-assistant", {
        body: { type: "profile_tips" },
      });
      if (error) throw error;
      const result = data as ProfileTipsResult;
      setTips(Array.isArray(result.data) ? result.data : []);
    } catch (e: any) {
      console.error(e);
      toast.error("Не удалось загрузить советы");
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, tips, generate };
}

export function useAiIcebreaker() {
  const { loading, result, call, clear } = useAiCall<string[]>("icebreaker");
  return {
    loading,
    questions: Array.isArray(result) ? result : [],
    generate: (targetUserId?: string) => call({ targetUserId }),
    clear,
  };
}

export function useAiProfileHighlights() {
  const { loading, result, call } = useAiCall<{ highlight: string; emoji: string }[]>("profile_highlights");
  return {
    loading,
    highlights: Array.isArray(result) ? result : [],
    generate: () => call({}),
  };
}

export function useAiProfileScore() {
  const { loading, result, call } = useAiCall<{ score: number; level: string; recommendations: { action: string; impact_points: number }[] }>("profile_score");
  return {
    loading,
    score: result,
    generate: () => call({}),
  };
}

export function useAiDailySuggestions() {
  const { loading, result, call } = useAiCall<{ greeting: string; tips: { type: string; text: string; emoji: string }[] }>("daily_suggestions");
  return {
    loading,
    suggestions: result,
    generate: () => call({}),
  };
}

export function useAiMatchInsights() {
  const { loading, result, call } = useAiCall<{ reasons: string[]; conversation_tip: string }>("match_insights");
  return {
    loading,
    insights: result,
    generate: (targetUserId: string) => call({ targetUserId }),
  };
}
