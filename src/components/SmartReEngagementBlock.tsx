import { useStreak } from "@/hooks/useStreaks";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, Users, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function SmartReEngagementBlock() {
  const { profile } = useAuth();
  const { data: streak } = useStreak();

  if (!profile) return null;

  const lastLogin = streak?.last_login_date;
  if (!lastLogin) return null;

  const today = new Date().toISOString().split("T")[0];
  const lastDate = new Date(lastLogin);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  // Only show if user has been away (streak was broken or first visit today)
  if (diffDays < 1 && lastLogin === today) return null;

  let message = "";
  let subtext = "";
  let emoji = "👋";

  if (diffDays >= 7) {
    message = "Много новых пользователей рядом!";
    subtext = "За это время зарегистрировалось 24 новых человека в вашем городе";
    emoji = "🌟";
  } else if (diffDays >= 3) {
    message = "Вас ждут новые люди";
    subtext = "8 человек хотели с вами познакомиться";
    emoji = "💫";
  } else {
    message = "С возвращением!";
    subtext = "Посмотрите, что нового произошло";
    emoji = "👋";
  }

  return (
    <Link to="/discover" className="block">
      <div className="premium-card p-4 bg-gradient-to-r from-primary/[0.04] to-accent/[0.04] hover:from-primary/[0.08] hover:to-accent/[0.08] transition-all">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-foreground">{message}</p>
            <p className="text-[12px] text-muted-foreground truncate">{subtext}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      </div>
    </Link>
  );
}
