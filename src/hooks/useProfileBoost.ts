import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useVipStatus } from "./useVipStatus";

export function useProfileBoost() {
  const { user } = useAuth();
  const { data: isVip } = useVipStatus();
  const queryClient = useQueryClient();

  const { data: activeBoost } = useQuery({
    queryKey: ["active-boost", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("profile_boosts")
        .select("*")
        .eq("user_id", user.id)
        .gte("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: false })
        .limit(1);
      return data && data.length > 0 ? data[0] : null;
    },
    enabled: !!user,
  });

  const { data: weeklyBoostCount = 0 } = useQuery({
    queryKey: ["weekly-boost-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count } = await supabase
        .from("profile_boosts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("started_at", weekAgo.toISOString());
      return count || 0;
    },
    enabled: !!user,
  });

  const canBoost = isVip && weeklyBoostCount < 1 && !activeBoost;

  const boost = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      await supabase.from("profile_boosts").insert({ user_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-boost"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-boost-count"] });
    },
  });

  return { activeBoost, canBoost, boost, isVip, weeklyBoostCount };
}
