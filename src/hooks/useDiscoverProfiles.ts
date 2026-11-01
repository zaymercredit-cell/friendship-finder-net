import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/lib/mock-data";
import type { Tables } from "@/integrations/supabase/types";

export function asDiscoverUser(p: Tables<"profiles">): User {
  return { id: p.user_id, name: `${p.first_name} ${p.last_name}`.trim(), username: p.username || p.user_id,
    avatar: p.avatar_url || "", city: p.city || "", age: p.age ?? undefined,
    gender: p.gender === "male" || p.gender === "female" ? p.gender : undefined,
    interests: p.interests || [], about: p.about || "", communicationGoals: p.communication_goals || [],
    friendsCount: 0, followersCount: 0, postsCount: 0, communitiesCount: 0,
    isOnline: !!p.is_online, readyForMeetings: !!p.ready_for_meetings, readyForChat: !!p.ready_for_chat,
    showInDiscover: p.show_in_discover !== false };
}

export function useDiscoverProfiles() {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: ["discover-real", user?.id], enabled: !!user,
    initialPageParam: 0,
    queryFn: async ({ pageParam, signal }) => {
      if (!user) return [];
      const { data, error } = await supabase.from("profiles").select("*")
        .neq("user_id", user.id).eq("show_in_discover", true)
        .eq("privacy_profile_visible", "everyone").or("is_banned.is.null,is_banned.eq.false")
        .order("user_id").range(pageParam * 48, pageParam * 48 + 47).abortSignal(signal);
      if (error) throw error;
      const [{ data: blocks, error: blockError }, { data: likes, error: likeError }, { data: passes, error: passError }] = await Promise.all([
        supabase.from("blocks").select("blocked_user_id").eq("user_id", user.id),
        supabase.from("likes").select("to_user_id").eq("from_user_id", user.id),
        supabase.from("passes").select("to_user_id").eq("from_user_id", user.id),
      ]);
      if (blockError || likeError || passError) throw blockError || likeError || passError;
      const excluded = new Set([...(blocks || []).map(b => b.blocked_user_id), ...(likes || []).map(l => l.to_user_id), ...(passes || []).map(p => p.to_user_id)]);
      return (data || []).map(p => ({ profile: asDiscoverUser(p), excluded: excluded.has(p.user_id) }));
    },
    getNextPageParam: (page, pages) => page.length === 48 ? pages.length : undefined,
  });
}