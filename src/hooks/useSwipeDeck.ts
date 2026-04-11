import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDailyLikes } from "./useDailyLikes";
import { toast } from "sonner";

export interface SwipeProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  username: string | null;
  avatar_url: string | null;
  age: number | null;
  city: string | null;
  interests: string[];
  communication_goals: string[];
  about: string | null;
  is_online: boolean | null;
  gender: string | null;
  is_verified: boolean | null;
  is_vip: boolean | null;
  score: number;
}

export function useSwipeDeck() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const { canLike, remaining } = useDailyLikes();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchedProfile, setMatchedProfile] = useState<SwipeProfile | null>(null);

  const { data: deck = [], isLoading } = useQuery({
    queryKey: ["swipe-deck", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get already-interacted user IDs
      const [{ data: liked }, { data: passed }] = await Promise.all([
        supabase.from("likes").select("to_user_id").eq("from_user_id", user.id),
        supabase.from("passes").select("to_user_id").eq("from_user_id", user.id),
      ]);
      const seen = new Set([
        ...(liked?.map(l => l.to_user_id) || []),
        ...(passed?.map(p => p.to_user_id) || []),
        user.id,
      ]);

      // Fetch candidates
      const { data: candidates } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, username, avatar_url, age, city, interests, communication_goals, about, is_online, gender, is_verified, is_vip")
        .eq("show_in_discover", true)
        .limit(200);

      if (!candidates) return [];

      const myInterests = new Set(profile?.interests || []);
      const myGoals = new Set(profile?.communication_goals || []);
      const myCity = profile?.city;

      return candidates
        .filter(c => !seen.has(c.user_id))
        .map(c => {
          let score = 40;
          const theirInterests = c.interests || [];
          const theirGoals = c.communication_goals || [];
          score += Math.min(theirInterests.filter(i => myInterests.has(i)).length * 8, 30);
          score += Math.min(theirGoals.filter(g => myGoals.has(g)).length * 10, 20);
          if (myCity && c.city === myCity) score += 10;
          if (c.is_online) score += 5;
          return { ...c, interests: theirInterests, communication_goals: theirGoals, score: Math.min(score, 99) } as SwipeProfile;
        })
        .sort((a, b) => b.score - a.score);
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  const likeMutation = useMutation({
    mutationFn: async ({ targetId, isSuper }: { targetId: string; isSuper: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("likes").insert({ from_user_id: user.id, to_user_id: targetId, is_super: isSuper });
      if (error) throw error;

      // Check if mutual
      const { data: mutual } = await supabase.from("matches")
        .select("id")
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${targetId}),and(user1_id.eq.${targetId},user2_id.eq.${user.id})`)
        .maybeSingle();
      return { isMatch: !!mutual };
    },
    onSuccess: (result, vars) => {
      queryClient.invalidateQueries({ queryKey: ["daily-likes-count"] });
      if (result.isMatch) {
        const matched = deck.find(p => p.user_id === vars.targetId);
        if (matched) setMatchedProfile(matched);
      }
    },
  });

  const passMutation = useMutation({
    mutationFn: async (targetId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("passes").insert({ from_user_id: user.id, to_user_id: targetId });
      if (error) throw error;
    },
  });

  const currentCard = deck[currentIndex] || null;
  const hasMore = currentIndex < deck.length;

  const advance = useCallback(() => setCurrentIndex(i => i + 1), []);

  const swipeLike = useCallback(async (isSuper = false) => {
    if (!currentCard) return;
    if (!canLike) { toast("Лимит свайпов на сегодня исчерпан"); return; }
    advance();
    await likeMutation.mutateAsync({ targetId: currentCard.user_id, isSuper });
    if (!isSuper) toast("❤️ Симпатия!");
    else toast("⭐ Супер симпатия!");
  }, [currentCard, canLike, advance, likeMutation]);

  const swipePass = useCallback(async () => {
    if (!currentCard) return;
    advance();
    await passMutation.mutateAsync(currentCard.user_id);
  }, [currentCard, advance, passMutation]);

  const dismissMatch = useCallback(() => setMatchedProfile(null), []);

  return {
    currentCard,
    nextCard: deck[currentIndex + 1] || null,
    hasMore,
    isLoading,
    remaining,
    canLike,
    swipeLike,
    swipePass,
    matchedProfile,
    dismissMatch,
    totalCards: deck.length,
    currentIndex,
  };
}
