import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useRecordProfileView() {
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (profileUserId: string) => {
      if (!user || user.id === profileUserId) return;
      // Check anonymous browsing
      if (profile?.anonymous_browsing) return;

      // 30-min dedup: check last view
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { data: recent } = await supabase
        .from("profile_views" as any)
        .select("id")
        .eq("viewer_id", user.id)
        .eq("profile_id", profileUserId)
        .gte("created_at", thirtyMinAgo)
        .limit(1);

      if (recent && recent.length > 0) return;

      await supabase.from("profile_views" as any).insert({
        viewer_id: user.id,
        profile_id: profileUserId,
      });
    },
  });
}

export function useMyProfileViews() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile-views", user?.id],
    queryFn: async () => {
      if (!user) return { count: 0, viewers: [] };

      // Get count
      const { count } = await supabase
        .from("profile_views" as any)
        .select("*", { count: "exact", head: true })
        .eq("profile_id", user.id);

      // Get recent viewers with profiles
      const { data: views } = await supabase
        .from("profile_views" as any)
        .select("id, viewer_id, created_at")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!views || views.length === 0) return { count: count || 0, viewers: [] };

      // Deduplicate by viewer_id (keep latest)
      const seen = new Set<string>();
      const uniqueViews = views.filter((v: any) => {
        if (seen.has(v.viewer_id)) return false;
        seen.add(v.viewer_id);
        return true;
      });

      // Fetch profiles
      const viewerIds = uniqueViews.map((v: any) => v.viewer_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, username, avatar_url, age, city, is_online")
        .in("user_id", viewerIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      const viewers = uniqueViews.map((v: any) => ({
        ...v,
        profile: profileMap.get(v.viewer_id) || null,
      }));

      return { count: count || 0, viewers };
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}
