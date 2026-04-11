import { Gift, Heart, Star, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const GIFT_EMOJI: Record<string, string> = {
  rose: "🌹", heart: "❤️", star: "⭐", coffee: "☕",
  cake: "🎂", diamond: "💎", bear: "🧸", fire: "🔥",
};

export default function GiftsPage() {
  const { user } = useAuth();

  const { data: receivedGifts = [] } = useQuery({
    queryKey: ["received-gifts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await (supabase.from("gifts") as any)
        .select("*")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: sentGifts = [] } = useQuery({
    queryKey: ["sent-gifts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await (supabase.from("gifts") as any)
        .select("*")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center pt-4 space-y-2">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 flex items-center justify-center mx-auto">
          <Gift className="h-7 w-7 text-pink-500" />
        </div>
        <h1 className="text-[1.5rem] font-bold text-foreground">Подарки</h1>
        <p className="text-[13px] text-muted-foreground">Отправляйте виртуальные подарки в чатах</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
          <Heart className="h-4 w-4 text-pink-500" />
          Полученные ({receivedGifts.length})
        </h2>
        {receivedGifts.length === 0 ? (
          <div className="premium-card p-8 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-[13px] text-muted-foreground">Пока нет подарков</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {receivedGifts.map((g: any) => (
              <div key={g.id} className="premium-card p-3 text-center">
                <span className="text-3xl">{GIFT_EMOJI[g.gift_type] || "🎁"}</span>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2 pt-2">
          <Star className="h-4 w-4 text-amber-500" />
          Отправленные ({sentGifts.length})
        </h2>
        {sentGifts.length === 0 ? (
          <div className="premium-card p-8 text-center">
            <p className="text-[13px] text-muted-foreground">Вы ещё не отправляли подарки</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {sentGifts.map((g: any) => (
              <div key={g.id} className="premium-card p-3 text-center">
                <span className="text-3xl">{GIFT_EMOJI[g.gift_type] || "🎁"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
