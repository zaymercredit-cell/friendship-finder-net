import { TrendingUp, Eye, Heart, Star, MessageCircle, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDailyStats } from "@/hooks/useDailyStats";
import { useStreak } from "@/hooks/useStreaks";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

function getLevel(score: number): { level: number; title: string; color: string } {
  if (score >= 90) return { level: 5, title: "Звезда", color: "text-amber-500" };
  if (score >= 70) return { level: 4, title: "Популярный", color: "text-primary" };
  if (score >= 50) return { level: 3, title: "Активный", color: "text-emerald-500" };
  if (score >= 30) return { level: 2, title: "Растущий", color: "text-blue-500" };
  return { level: 1, title: "Новичок", color: "text-muted-foreground" };
}

export default function ProfileEvolutionBlock() {
  const { profile } = useAuth();
  const { data: stats } = useDailyStats();
  const { data: streak } = useStreak();

  if (!profile) return null;

  // Calculate profile score
  let score = 0;
  if (profile.avatar_url) score += 20;
  if (profile.about && profile.about.length > 10) score += 15;
  if (profile.interests && profile.interests.length >= 3) score += 15;
  if (profile.city) score += 10;
  if (profile.age) score += 5;
  if (profile.communication_goals && profile.communication_goals.length > 0) score += 10;
  if ((streak?.current_streak || 0) >= 3) score += 10;
  if ((stats?.profileViews || 0) > 0) score += 5;
  if ((stats?.likesReceived || 0) > 0) score += 5;
  if ((stats?.newMatches || 0) > 0) score += 5;
  score = Math.min(score, 100);

  const { level, title, color } = getLevel(score);

  const metrics = [
    { icon: Eye, label: "Просмотры", value: stats?.profileViews || 0, color: "text-blue-500" },
    { icon: Heart, label: "Симпатии", value: stats?.likesReceived || 0, color: "text-rose-500" },
    { icon: Star, label: "Совпадения", value: stats?.newMatches || 0, color: "text-amber-500" },
    { icon: MessageCircle, label: "Сообщения", value: stats?.messagesReceived || 0, color: "text-violet-500" },
  ];

  return (
    <div className="premium-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-foreground">Уровень профиля</p>
            <p className={cn("text-[12px] font-semibold", color)}>Lv.{level} — {title}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-foreground">{score}</span>
          <span className="text-[11px] text-muted-foreground">/100</span>
        </div>
      </div>

      <Progress value={score} className="h-2.5" />

      <div className="grid grid-cols-4 gap-2">
        {metrics.map(m => (
          <div key={m.label} className="text-center p-2 rounded-xl bg-secondary/30">
            <m.icon className={cn("h-4 w-4 mx-auto mb-1", m.color)} />
            <p className="text-[14px] font-bold text-foreground">{m.value}</p>
            <p className="text-[10px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {score < 70 && (
        <Link to="/settings" className="block">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors">
            <Zap className="h-4 w-4 text-primary shrink-0" />
            <p className="text-[12px] text-foreground">
              Улучшите профиль, чтобы получать больше совпадений
            </p>
          </div>
        </Link>
      )}
    </div>
  );
}
