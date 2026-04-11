import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RealPost {
  id: string;
  author_id: string;
  content: string;
  images: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  visibility: string;
  created_at: string;
  author?: {
    first_name: string;
    last_name: string;
    username: string | null;
    avatar_url: string | null;
    is_online: boolean | null;
    city: string | null;
  };
}

export function usePosts(limit = 30) {
  return useQuery({
    queryKey: ["posts", limit],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (!posts || posts.length === 0) return [];

      // Fetch author profiles
      const authorIds = [...new Set(posts.map(p => p.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, username, avatar_url, is_online, city")
        .in("user_id", authorIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return posts.map(post => ({
        ...post,
        images: post.images || [],
        author: profileMap.get(post.author_id) || undefined,
      })) as RealPost[];
    },
  });
}
