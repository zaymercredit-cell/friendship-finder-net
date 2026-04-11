import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DailyStats {
  profileViews: number;
  likesReceived: number;
  messagesReceived: number;
  newMatches: number;
}

export function useDailyStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["daily-stats", user?.id],
    queryFn: async (): Promise<DailyStats> => {
      if (!user) return { profileViews: 0, likesReceived: 0, messagesReceived: 0, newMatches: 0 };

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayISO = todayStart.toISOString();

      const [views, likes, messages, matches] = await Promise.all([
        supabase
          .from("profile_views")
          .select("*", { count: "exact", head: true })
          .eq("profile_id", user.id)
          .gte("created_at", todayISO),
        supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("to_user_id", user.id)
          .gte("created_at", todayISO),
        supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .neq("sender_id", user.id)
          .gte("created_at", todayISO),
        supabase
          .from("matches")
          .select("*", { count: "exact", head: true })
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .gte("created_at", todayISO),
      ]);

      return {
        profileViews: views.count || 0,
        likesReceived: likes.count || 0,
        messagesReceived: messages.count || 0,
        newMatches: matches.count || 0,
      };
    },
    enabled: !!user,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}
