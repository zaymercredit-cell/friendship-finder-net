import { useAuth } from "@/contexts/AuthContext";
import { useStreak } from "@/hooks/useStreaks";
import { useDailyLikes } from "@/hooks/useDailyLikes";
import { useProfileBoost } from "@/hooks/useProfileBoost";
import { useVipStatus } from "@/hooks/useVipStatus";
import { useDailyStats } from "@/hooks/useDailyStats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flame, Heart, Zap, Crown, TrendingUp, Gift, Trophy, Users, Sparkles, Eye, MessageCircle, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import VipBadge from "@/components/VipBadge";
import ProfileEvolutionBlock from "@/components/ProfileEvolutionBlock";
import ActivityFeedBlock from "@/components/ActivityFeedBlock";

export default function ActivityPage() {
  const { profile } = useAuth();
  const { data: streak } = useStreak();
  const { todayCount, remaining, limit, isVip } = useDailyLikes();
  const { activeBoost, canBoost, boost } = useProfileBoost();
  const { data: vipStatus } = useVipStatus();
  const { data: dailyStats } = useDailyStats();

  const handleBoost = () => {
    boost.mutate(undefined, {
      onSuccess: () => toast.success("🚀 Профиль продвинут на 24 часа!"),
      onError: () => toast.error("Не удалось активировать буст"),
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Активность</h1>
        {vipStatus && <VipBadge />}
      </div>

      {/* Today's Stats */}
      {dailyStats && (dailyStats.profileViews + dailyStats.likesReceived + dailyStats.messagesReceived + dailyStats.newMatches > 0) && (
        <div className="bg-card rounded-xl border border-border/60 card-shadow p-5">
          <p className="text-[14px] font-semibold text-foreground mb-3">Ваш день</p>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/profile-views" className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 hover:bg-secondary/70 transition-colors">
              <Eye className="h-5 w-5 text-primary" />
              <div>
                <p className="text-lg font-bold text-foreground">{dailyStats.profileViews}</p>
                <p className="text-[11px] text-muted-foreground">просмотров</p>
              </div>
            </Link>
            <Link to="/likes-you" className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 hover:bg-secondary/70 transition-colors">
              <Heart className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-lg font-bold text-foreground">{dailyStats.likesReceived}</p>
                <p className="text-[11px] text-muted-foreground">симпатий</p>
              </div>
            </Link>
            <Link to="/messages" className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 hover:bg-secondary/70 transition-colors">
              <MessageCircle className="h-5 w-5 text-accent" />
              <div>
                <p className="text-lg font-bold text-foreground">{dailyStats.messagesReceived}</p>
                <p className="text-[11px] text-muted-foreground">сообщений</p>
              </div>
            </Link>
            <Link to="/matches" className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 hover:bg-secondary/70 transition-colors">
              <Star className="h-5 w-5 text-warning" />
              <div>
                <p className="text-lg font-bold text-foreground">{dailyStats.newMatches}</p>
                <p className="text-[11px] text-muted-foreground">совпадений</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Streak */}
      <div className="bg-card rounded-xl border border-border/60 card-shadow p-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Flame className="h-6 w-6 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              {(streak as any)?.current_streak || 0} {((streak as any)?.current_streak || 0) === 1 ? "день" : "дней"} подряд
            </p>
            <p className="text-xs text-muted-foreground">
              Рекорд: {(streak as any)?.longest_streak || 0} дней
            </p>
          </div>
          <div className="text-3xl">🔥</div>
        </div>
      </div>

      {/* Daily likes */}
      <div className="bg-card rounded-xl border border-border/60 card-shadow p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Симпатии сегодня</span>
          </div>
          {isVip ? (
            <Badge variant="default" className="text-[10px] gap-1"><Crown className="h-3 w-3" />Безлимит</Badge>
          ) : (
            <span className="text-xs text-muted-foreground">{todayCount}/{limit}</span>
          )}
        </div>
        {!isVip && (
          <>
            <Progress value={(todayCount / limit) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">Осталось: {remaining} симпатий</p>
            {remaining === 0 && (
              <div className="bg-primary/5 rounded-lg p-3 text-center">
                <p className="text-xs text-foreground font-medium">Лимит исчерпан</p>
                <Link to="/premium">
                  <Button size="sm" className="mt-2 gap-1.5 text-xs">
                    <Crown className="h-3.5 w-3.5" />
                    Активировать VIP
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Profile Boost */}
      <div className="bg-card rounded-xl border border-border/60 card-shadow p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-warning" />
            <span className="text-sm font-semibold text-foreground">Буст профиля</span>
          </div>
          {activeBoost && (
            <Badge variant="default" className="text-[10px] gap-1 bg-warning text-warning-foreground">Активен</Badge>
          )}
        </div>
        {activeBoost ? (
          <p className="text-xs text-muted-foreground">
            Ваш профиль показывается чаще до {new Date((activeBoost as any).expires_at).toLocaleString("ru")}
          </p>
        ) : canBoost ? (
          <Button size="sm" className="gap-1.5" onClick={handleBoost} disabled={boost.isPending}>
            <Zap className="h-3.5 w-3.5" />
            Активировать буст (1 в неделю)
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            {isVip ? "Буст уже использован на этой неделе" : "Доступно только для VIP-пользователей"}
          </p>
        )}
      </div>

      {/* Profile Evolution */}
      <ProfileEvolutionBlock />

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/achievements" className="bg-card rounded-xl border border-border/60 card-shadow p-4 text-center hover:border-primary/30 transition-colors">
          <Trophy className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xs font-semibold text-foreground">Достижения</p>
        </Link>
        <Link to="/invite" className="bg-card rounded-xl border border-border/60 card-shadow p-4 text-center hover:border-primary/30 transition-colors">
          <Gift className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xs font-semibold text-foreground">Пригласить друзей</p>
        </Link>
        <Link to="/profile-views" className="bg-card rounded-xl border border-border/60 card-shadow p-4 text-center hover:border-primary/30 transition-colors">
          <Eye className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xs font-semibold text-foreground">Просмотры профиля</p>
        </Link>
        <Link to="/discover" className="bg-card rounded-xl border border-border/60 card-shadow p-4 text-center hover:border-primary/30 transition-colors">
          <Sparkles className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xs font-semibold text-foreground">Знакомства</p>
        </Link>
      </div>

      {/* Activity Feed */}
      <ActivityFeedBlock />
    </div>
  );
}
