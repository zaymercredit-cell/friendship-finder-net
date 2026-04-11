import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SafetyAlertPriority = "low" | "medium" | "high" | "critical";
export type SafetyAlertStatus = "open" | "reviewing" | "resolved" | "dismissed";

export interface SafetyAlert {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  priority: SafetyAlertPriority;
  status: SafetyAlertStatus;
  details: Record<string, any>;
  assigned_to: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
}

export function useSafetyAlerts(status?: SafetyAlertStatus) {
  return useQuery({
    queryKey: ["safety-alerts", status],
    queryFn: async () => {
      let query = supabase
        .from("safety_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as SafetyAlert[];
    },
  });
}

export function useSafetyAlertStats() {
  return useQuery({
    queryKey: ["safety-alert-stats"],
    queryFn: async () => {
      const [
        { count: openCount },
        { count: criticalCount },
        { count: highCount },
        { count: todayCount },
      ] = await Promise.all([
        supabase.from("safety_alerts").select("*", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("safety_alerts").select("*", { count: "exact", head: true }).eq("priority", "critical").eq("status", "open"),
        supabase.from("safety_alerts").select("*", { count: "exact", head: true }).eq("priority", "high").eq("status", "open"),
        supabase.from("safety_alerts").select("*", { count: "exact", head: true })
          .gte("created_at", new Date(Date.now() - 86400000).toISOString()),
      ]);

      return {
        open: openCount || 0,
        critical: criticalCount || 0,
        high: highCount || 0,
        today: todayCount || 0,
      };
    },
  });
}

export function useUpdateSafetyAlert() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      resolution_note 
    }: { 
      id: string; 
      status: SafetyAlertStatus; 
      resolution_note?: string;
    }) => {
      const { error } = await supabase
        .from("safety_alerts")
        .update({ 
          status, 
          resolution_note: resolution_note || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety-alerts"] });
      qc.invalidateQueries({ queryKey: ["safety-alert-stats"] });
      toast.success("Алерт обновлён");
    },
    onError: () => toast.error("Ошибка обновления алерта"),
  });
}

export function getPriorityColor(priority: SafetyAlertPriority) {
  switch (priority) {
    case "critical": return "text-red-500 bg-red-500/10 border-red-500/30";
    case "high": return "text-orange-500 bg-orange-500/10 border-orange-500/30";
    case "medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
    case "low": return "text-blue-500 bg-blue-500/10 border-blue-500/30";
  }
}

export function getPriorityLabel(priority: SafetyAlertPriority) {
  switch (priority) {
    case "critical": return "Критический";
    case "high": return "Высокий";
    case "medium": return "Средний";
    case "low": return "Низкий";
  }
}
