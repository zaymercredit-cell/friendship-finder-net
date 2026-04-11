import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useAiAvatarSettings() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["ai-avatar-settings", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("ai_avatar_profiles" as any)
        .select("*")
        .eq("user_id", user.id)
        .single();
      return data as any;
    },
    enabled: !!user,
  });

  const toggle = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!user) return;
      if (settings) {
        await supabase
          .from("ai_avatar_profiles" as any)
          .update({ enabled } as any)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("ai_avatar_profiles" as any)
          .insert({ user_id: user.id, enabled } as any);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-avatar-settings"] });
    },
    onError: () => toast.error("Ошибка сохранения"),
  });

  const updateSummary = useMutation({
    mutationFn: async (personality_summary: string) => {
      if (!user) return;
      if (settings) {
        await supabase
          .from("ai_avatar_profiles" as any)
          .update({ personality_summary } as any)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("ai_avatar_profiles" as any)
          .insert({ user_id: user.id, enabled: true, personality_summary } as any);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-avatar-settings"] });
      toast.success("AI-аватар обновлён");
    },
    onError: () => toast.error("Ошибка сохранения"),
  });

  return {
    settings,
    isLoading,
    isEnabled: settings?.enabled ?? true,
    personalitySummary: settings?.personality_summary ?? "",
    toggle,
    updateSummary,
  };
}
