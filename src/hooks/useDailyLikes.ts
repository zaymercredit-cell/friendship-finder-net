import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useVipStatus } from "./useVipStatus";

const DAILY_LIMIT = 20;

export function useDailyLikes() {
  const { user } = useAuth();
  const { data: isVip } = useVipStatus();

  const { data: todayCount = 0 } = useQuery({
    queryKey: ["daily-likes-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("from_user_id", user.id)
        .gte("created_at", todayStart.toISOString());
      return count || 0;
    },
    enabled: !!user,
    staleTime: 10_000,
  });

  const remaining = isVip ? Infinity : Math.max(0, DAILY_LIMIT - todayCount);
  const canLike = isVip || todayCount < DAILY_LIMIT;

  return { todayCount, remaining, canLike, limit: DAILY_LIMIT, isVip };
}
