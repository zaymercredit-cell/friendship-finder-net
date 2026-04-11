import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type FlaggedMessageStatus = "pending" | "reviewed" | "resolved" | "dismissed";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface FlaggedMessage {
  id: string;
  message_id: string;
  reporter_id: string | null;
  reason: string;
  risk_level: RiskLevel;
  status: FlaggedMessageStatus;
  ai_analysis: Record<string, any>;
  created_at: string;
}

export function useFlaggedMessages(status?: FlaggedMessageStatus) {
  return useQuery({
    queryKey: ["flagged-messages", status],
    queryFn: async () => {
      let query = supabase
        .from("flagged_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as FlaggedMessage[];
    },
  });
}

export function useFlaggedMessageStats() {
  return useQuery({
    queryKey: ["flagged-message-stats"],
    queryFn: async () => {
      const [
        { count: pendingCount },
        { count: criticalCount },
        { count: highCount },
        { count: todayCount },
      ] = await Promise.all([
        supabase.from("flagged_messages").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("flagged_messages").select("*", { count: "exact", head: true }).eq("risk_level", "critical").eq("status", "pending"),
        supabase.from("flagged_messages").select("*", { count: "exact", head: true }).eq("risk_level", "high").eq("status", "pending"),
        supabase.from("flagged_messages").select("*", { count: "exact", head: true })
          .gte("created_at", new Date(Date.now() - 86400000).toISOString()),
      ]);

      return {
        pending: pendingCount || 0,
        critical: criticalCount || 0,
        high: highCount || 0,
        today: todayCount || 0,
      };
    },
  });
}

export function useUpdateFlaggedMessage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: FlaggedMessageStatus }) => {
      const { error } = await supabase
        .from("flagged_messages")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["flagged-messages"] });
      qc.invalidateQueries({ queryKey: ["flagged-message-stats"] });
      toast.success("Статус обновлён");
    },
    onError: () => toast.error("Ошибка обновления"),
  });
}

export function getRiskColor(level: RiskLevel) {
  switch (level) {
    case "critical": return "text-red-500 bg-red-500/10 border-red-500/30";
    case "high": return "text-orange-500 bg-orange-500/10 border-orange-500/30";
    case "medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
    case "low": return "text-green-500 bg-green-500/10 border-green-500/30";
  }
}

export function getRiskLabel(level: RiskLevel) {
  switch (level) {
    case "critical": return "Критический";
    case "high": return "Высокий";
    case "medium": return "Средний";
    case "low": return "Низкий";
  }
}
