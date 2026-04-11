import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const ACHIEVEMENT_TYPES = {
  first_match: { label: "Первый матч", icon: "💕", desc: "Получите первое совпадение" },
  ten_messages: { label: "10 сообщений", icon: "💬", desc: "Отправьте 10 сообщений" },
  five_friends: { label: "5 друзей", icon: "👥", desc: "Добавьте 5 друзей" },
  three_events: { label: "3 события", icon: "🎉", desc: "Посетите 3 события" },
  profile_complete: { label: "Полный профиль", icon: "✨", desc: "Заполните все поля профиля" },
  first_like: { label: "Первая симпатия", icon: "❤️", desc: "Поставьте первую симпатию" },
  streak_7: { label: "7 дней подряд", icon: "🔥", desc: "Заходите 7 дней подряд" },
  streak_30: { label: "30 дней подряд", icon: "⚡", desc: "Заходите 30 дней подряд" },
  first_invite: { label: "Первое приглашение", icon: "🎁", desc: "Пригласите друга" },
  ten_likes: { label: "10 симпатий", icon: "💖", desc: "Получите 10 симпатий" },
} as const;

export function useAchievements() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["achievements", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("achievements" as any)
        .select("*")
        .eq("user_id", user.id);
      return (data || []) as any[];
    },
    enabled: !!user,
  });
}

export async function grantAchievement(userId: string, type: string) {
  await supabase.from("achievements" as any).insert({ user_id: userId, type }).then(() => {});
}
