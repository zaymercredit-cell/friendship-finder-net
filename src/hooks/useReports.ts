import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const reportReasons = [
  { value: "spam", label: "Спам" },
  { value: "fake", label: "Фейковый профиль" },
  { value: "scam", label: "Мошенничество" },
  { value: "abuse", label: "Оскорбления" },
  { value: "inappropriate", label: "Неприемлемый контент" },
] as const;

export function useSubmitReport() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ reportedUserId, reason, description }: {
      reportedUserId: string;
      reason: string;
      description?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        reason,
        description: description || null,
      });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Жалоба отправлена. Мы рассмотрим её в ближайшее время."),
    onError: () => toast.error("Не удалось отправить жалобу"),
  });
}

export function useAdminReports() {
  return useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useUpdateReportStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("reports")
        .update({ status } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reports"] });
      toast.success("Статус жалобы обновлён");
    },
  });
}
