import { useAuth } from "@/contexts/AuthContext";
import { useVipStatus } from "@/hooks/useVipStatus";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import VipPaywallModal from "@/components/VipPaywallModal";
import { Heart, Lock, Crown, Loader2, Star, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useStartConversation } from "@/hooks/useConversations";
import { toast } from "sonner";
import { useState } from "react";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} дн назад`;
}

export default function LikesYouPage() {
  const { user } = useAuth();
  const { data: isVip, isLoading: vipLoading } = useVipStatus();
  const navigate = useNavigate();
  const startConversation = useStartConversation();
  const [showPaywall, setShowPaywall] = useState(false);

  const { data: likes = [], isLoading } = useQuery({
    queryKey: ["likes-you", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("likes")
        .select("id, from_user_id, created_at, is_super")
        .eq("to_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (!data || data.length === 0) return [];

      const userIds = data.map((l: any) => l.from_user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, avatar_url, age, city, is_online, username")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      return data.map((l: any) => ({ ...l, profile: profileMap.get(l.from_user_id) }));
    },
    enabled: !!user,
  });

  if (isLoading || vipLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          Кому вы нравитесь
        </h1>
        <Badge variant="secondary" className="text-sm px-3 py-1">{likes.length} симпатий</Badge>
      </div>

      {!isVip && likes.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-[15px] font-semibold text-foreground">
                {likes.length} человек поставили вам симпатию
              </h3>
              <p className="text-[13px] text-muted-foreground mt-1">
                Активируйте VIP, чтобы увидеть кто именно
              </p>
              <Link to="/premium">
                <Button className="mt-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2" size="sm">
                  <Crown className="h-4 w-4" />Стать VIP
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {likes.length === 0 ? (
        <div className="bg-card rounded-xl border border-border/60 card-shadow p-8 text-center">
          <Heart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-[14px]">Пока нет симпатий</p>
          <p className="text-muted-foreground/60 text-[13px] mt-1">Будьте активны и заполните профиль!</p>
          <Link to="/discover"><Button variant="outline" size="sm" className="mt-4">Перейти к знакомствам</Button></Link>
        </div>
      ) : (
        <div className="space-y-2">
          {likes.map((like: any, i: number) => {
            const p = like.profile;
            if (!p) return null;
            const isBlurred = !isVip && i >= 1;

            return (
              <div key={like.id} className="bg-card rounded-xl border border-border/60 card-shadow p-4 flex items-center gap-4 hover:border-primary/20 transition-colors">
                <div className="relative">
                  <Avatar className={`h-14 w-14 ${isBlurred ? "blur-md" : ""}`}>
                    <AvatarImage src={p.avatar_url || ""} alt={p.first_name} />
                    <AvatarFallback className="bg-secondary">{p.first_name?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  {like.is_super && !isBlurred && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center">
                      <Star className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {isBlurred && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {isBlurred ? (
                    <>
                      <p className="text-[14px] font-medium text-muted-foreground">Скрытый пользователь</p>
                      <p className="text-[12px] text-muted-foreground/60 cursor-pointer hover:text-amber-600" onClick={() => setShowPaywall(true)}>
                        Активируйте VIP чтобы увидеть
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-medium text-foreground truncate">{p.first_name} {p.last_name}</p>
                        {p.age && <span className="text-[13px] text-muted-foreground">{p.age}</span>}
                        {like.is_super && <Badge className="bg-amber-500/10 text-amber-600 text-[10px] border-0">Super Like</Badge>}
                      </div>
                      <p className="text-[12px] text-muted-foreground">{p.city}</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-0.5">{timeAgo(like.created_at)}</p>
                    </>
                  )}
                </div>
                {!isBlurred && (
                  <div className="flex gap-2 shrink-0">
                    <Link to={`/profile/${p.username || p.user_id}`}>
                      <Button size="sm" variant="outline" className="text-[12px] h-8">Профиль</Button>
                    </Link>
                    <Button
                      size="sm" variant="secondary" className="text-[12px] h-8 gap-1"
                      onClick={async () => {
                        try {
                          const convId = await startConversation.mutateAsync(p.user_id);
                          navigate(`/messages/${convId}`);
                        } catch { toast.error("Не удалось начать диалог"); }
                      }}
                    >
                      <MessageCircle className="h-3 w-3" />Написать
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <VipPaywallModal open={showPaywall} onOpenChange={setShowPaywall} feature="likes" />
    </div>
  );
}
