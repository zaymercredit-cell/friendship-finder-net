import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useBlocks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["blocks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("blocks")
        .select("*")
        .eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });
}

export function useBlockUser() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (blockedUserId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("blocks").insert({
        user_id: user.id,
        blocked_user_id: blockedUserId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blocks"] });
      toast.success("Пользователь заблокирован");
    },
    onError: () => toast.error("Ошибка блокировки"),
  });
}

export function useUnblockUser() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (blockedUserId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("blocks")
        .delete()
        .eq("user_id", user.id)
        .eq("blocked_user_id", blockedUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blocks"] });
      toast.success("Пользователь разблокирован");
    },
    onError: () => toast.error("Ошибка разблокировки"),
  });
}

export function useIsBlocked(targetUserId?: string) {
  const { data: blocks } = useBlocks();
  if (!targetUserId || !blocks) return false;
  return blocks.some((b: any) => b.blocked_user_id === targetUserId);
}
