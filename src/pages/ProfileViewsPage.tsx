import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMyProfileViews } from "@/hooks/useProfileViews";
import { useVipStatus } from "@/hooks/useVipStatus";
import { useStartConversation } from "@/hooks/useConversations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import VipBadge from "@/components/VipBadge";
import {
  Eye, Crown, Lock, MessageCircle, ExternalLink, Circle, Loader2, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  return `${days} дн назад`;
}

export default function ProfileViewsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useMyProfileViews();
  const { data: isVip, isLoading: vipLoading } = useVipStatus();
  const startConversation = useStartConversation();

  if (isLoading || vipLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalViews = data?.count || 0;
  const viewers = data?.viewers || [];

  const handleActivateVip = async () => {
    if (!user) return;
    // Demo: activate VIP for 30 days
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("subscriptions" as any).insert({
      user_id: user.id,
      type: "vip",
      status: "active",
      expires_at: expiresAt,
    });
    await supabase.from("profiles").update({ is_vip: true } as any).eq("user_id", user.id);
    toast.success("🎉 VIP активирован на 30 дней!");
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Eye className="h-6 w-6 text-primary" />
          Кто посмотрел профиль
        </h1>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {totalViews} просмотров
        </Badge>
      </div>

      {/* VIP upgrade banner for non-VIP */}
      {!isVip && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-[15px] font-semibold text-foreground">
                Узнайте, кто смотрел ваш профиль
              </h3>
              <p className="text-[13px] text-muted-foreground mt-1">
                С VIP-подпиской вы увидите имена, фото и возможность написать каждому, кто заходил на вашу страницу.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="text-[11px] border-amber-500/30 text-amber-700">
                  <Eye className="h-3 w-3 mr-1" />Полный список просмотров
                </Badge>
                <Badge variant="outline" className="text-[11px] border-amber-500/30 text-amber-700">
                  <Sparkles className="h-3 w-3 mr-1" />Приоритет в выдаче
                </Badge>
                <Badge variant="outline" className="text-[11px] border-amber-500/30 text-amber-700">
                  <Crown className="h-3 w-3 mr-1" />Значок VIP
                </Badge>
              </div>
              <Button
                onClick={handleActivateVip}
                className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2"
              >
                <Crown className="h-4 w-4" />
                Активировать VIP
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Viewers list */}
      {viewers.length === 0 ? (
        <div className="bg-card rounded-lg border border-border shadow-sm p-8 text-center">
          <Eye className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-[14px]">Пока никто не смотрел ваш профиль</p>
          <p className="text-muted-foreground/60 text-[13px] mt-1">Заполните профиль и будьте активны — люди начнут заходить!</p>
          <Link to="/discover">
            <Button variant="outline" size="sm" className="mt-4">Перейти к знакомствам</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {viewers.map((viewer: any, i: number) => {
            const p = viewer.profile;
            if (!p) return null;

            const isBlurred = !isVip && i >= 2; // Show first 2 unblurred as teaser

            return (
              <div
                key={viewer.id}
                className="bg-card rounded-lg border border-border shadow-sm p-4 flex items-center gap-4 hover:border-primary/20 transition-colors"
              >
                <div className="relative">
                  <Avatar className={`h-14 w-14 ${isBlurred ? "blur-md" : ""}`}>
                    <AvatarImage src={p.avatar_url || ""} alt={p.first_name} />
                    <AvatarFallback className="bg-secondary">{p.first_name?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  {p.is_online && !isBlurred && (
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-success border-2 border-card" />
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
                      <p className="text-[12px] text-muted-foreground/60">Активируйте VIP чтобы увидеть</p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-medium text-foreground truncate">
                          {p.first_name} {p.last_name}
                        </p>
                        {p.age && <span className="text-[13px] text-muted-foreground">{p.age}</span>}
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                        {p.city && <span>{p.city}</span>}
                        {p.is_online && (
                          <span className="flex items-center gap-1 text-success">
                            <Circle className="h-1.5 w-1.5 fill-current" />онлайн
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground/60 mt-0.5">{timeAgo(viewer.created_at)}</p>
                    </>
                  )}
                </div>

                {!isBlurred && (
                  <div className="flex gap-2 shrink-0">
                    <Link to={`/profile/${p.username || p.user_id}`}>
                      <Button size="sm" variant="outline" className="text-[12px] h-8 gap-1">
                        <ExternalLink className="h-3 w-3" />Профиль
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-[12px] h-8 gap-1"
                      onClick={async () => {
                        try {
                          const convId = await startConversation.mutateAsync(p.user_id);
                          navigate(`/messages/${convId}`);
                        } catch {
                          toast.error("Не удалось начать диалог");
                        }
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
    </div>
  );
}
