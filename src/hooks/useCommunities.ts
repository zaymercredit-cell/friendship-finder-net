import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useCommunities() {
  return useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .order("members_count", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCommunityDetail(id: string) {
  return useQuery({
    queryKey: ["community", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("communities").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCommunityMembership(communityId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ["community-membership", communityId, user?.id];
  const query = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.from("community_members").select("id")
        .eq("community_id", communityId).eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
  const toggle = useMutation({
    mutationFn: async (join: boolean) => {
      if (!user) throw new Error("Not authenticated");
      const result = join
        ? await supabase.from("community_members").upsert({ community_id: communityId, user_id: user.id }, { onConflict: "community_id,user_id", ignoreDuplicates: true })
        : await supabase.from("community_members").delete().eq("community_id", communityId).eq("user_id", user.id);
      if (result.error) throw result.error;
    },
    onSuccess: async (_, join) => {
      await qc.invalidateQueries({ queryKey: key });
      toast.success(join ? "Вы вступили в сообщество" : "Вы покинули сообщество");
    },
    onError: () => toast.error("Не удалось изменить участие. Попробуйте ещё раз."),
  });
  return { ...query, toggle };
}
