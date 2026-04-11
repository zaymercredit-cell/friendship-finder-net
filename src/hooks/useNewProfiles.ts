import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useNewProfiles(limit = 8) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return useQuery({
    queryKey: ["new-profiles", limit],
    queryFn: async () => {
      // Get recently created profiles (last 7 days for more results)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, username, avatar_url, is_online, age, city")
        .gte("created_at", weekAgo)
        .not("avatar_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },
  });
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      const [profilesRes, likesRes, matchesRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("likes").select("id", { count: "exact", head: true }).gte("created_at", todayStr),
        supabase.from("matches").select("id", { count: "exact", head: true }),
      ]);

      return {
        totalUsers: profilesRes.count || 0,
        todayLikes: likesRes.count || 0,
        totalMatches: matchesRes.count || 0,
      };
    },
    staleTime: 60000,
  });
}
