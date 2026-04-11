import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DateIdea {
  emoji: string;
  title: string;
  description: string;
  location: string;
  vibe: string;
}

export function useDatePlanner() {
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<DateIdea[]>([]);

  const generate = useCallback(async (targetUserId: string) => {
    setLoading(true);
    setIdeas([]);
    try {
      const { data, error } = await supabase.functions.invoke("ai-date-planner", {
        body: { targetUserId },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setIdeas(Array.isArray(data?.data) ? data.data : []);
    } catch (e: any) {
      console.error(e);
      toast.error("AI Date Planner временно недоступен");
    } finally {
      setLoading(false);
    }
  }, []);

  const createDate = useCallback(async (params: {
    user2_id: string;
    idea: string;
    idea_emoji: string;
    location: string;
    scheduled_at?: string;
    message_text: string;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("dates" as any)
      .insert({
        user1_id: user.id,
        user2_id: params.user2_id,
        idea: params.idea,
        idea_emoji: params.idea_emoji,
        location: params.location,
        scheduled_at: params.scheduled_at || null,
        message_text: params.message_text,
        status: "pending",
      } as any)
      .select()
      .single();

    if (error) {
      console.error(error);
      toast.error("Не удалось создать приглашение");
      return null;
    }
    toast.success("Приглашение на встречу отправлено!");
    return data;
  }, []);

  return { loading, ideas, generate, createDate, clear: () => setIdeas([]) };
}

export function useDates() {
  const [dates, setDates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDates = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("dates" as any)
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    setDates((data as any[]) || []);
    setLoading(false);
  }, []);

  const updateStatus = useCallback(async (dateId: string, status: string) => {
    const { error } = await supabase
      .from("dates" as any)
      .update({ status } as any)
      .eq("id", dateId);

    if (error) {
      toast.error("Ошибка обновления");
      return;
    }
    toast.success(status === "accepted" ? "Встреча подтверждена!" : "Встреча отклонена");
    fetchDates();
  }, [fetchDates]);

  return { dates, loading, fetchDates, updateStatus };
}
