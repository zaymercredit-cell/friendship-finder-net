import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useVipStatus } from "./useVipStatus";

export function useSuperLike() {
  const { user } = useAuth();
  const { data: isVip } = useVipStatus();
  const queryClient = useQueryClient();

  const { data: todaySuperCount = 0 } = useQuery({
    queryKey: ["daily-super-likes", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("from_user_id", user.id)
        .eq("is_super", true)
        .gte("created_at", todayStart.toISOString());
      return count || 0;
    },
    enabled: !!user,
    staleTime: 10_000,
  });

  const limit = isVip ? 5 : 1;
  const canSuperLike = todaySuperCount < limit;

  const sendSuperLike = useMutation({
    mutationFn: async (toUserId: string) => {
      if (!user) throw new Error("Not authenticated");
      await supabase.from("likes").insert({
        from_user_id: user.id,
        to_user_id: toUserId,
        is_super: true,
      } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-super-likes"] });
      queryClient.invalidateQueries({ queryKey: ["daily-likes-count"] });
    },
  });

  return { todaySuperCount, limit, canSuperLike, sendSuperLike, isVip };
}
