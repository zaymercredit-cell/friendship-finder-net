import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export function useStreak() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    updateStreak(user.id);
  }, [user?.id]);

  return useQuery({
    queryKey: ["user-streak", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });
}

async function updateStreak(userId: string) {
  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!existing) {
    await supabase.from("user_streaks").insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_login_date: today,
    });
    return;
  }

  const lastDate = existing.last_login_date;
  if (lastDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newStreak = 1;
  if (lastDate === yesterdayStr) {
    newStreak = (existing.current_streak || 0) + 1;
  }

  const longest = Math.max(newStreak, existing.longest_streak || 0);

  await supabase
    .from("user_streaks")
    .update({
      current_streak: newStreak,
      longest_streak: longest,
      last_login_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}
