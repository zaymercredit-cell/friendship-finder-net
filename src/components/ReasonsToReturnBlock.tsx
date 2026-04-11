import { Heart, Eye, CalendarDays, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useDailyStats } from "@/hooks/useDailyStats";

export default function ReasonsToReturnBlock() {
  const { data: stats } = useDailyStats();

  const reasons = [
    { cond: (stats?.newMatches || 0) > 0, text: `${stats?.newMatches || 3} новых человека хотят познакомиться`, icon: Heart, href: "/matches", color: "text-rose-500" },
    { cond: (stats?.messagesReceived || 0) > 0, text: "Вам написали — ответьте сейчас", icon: Star, href: "/messages", color: "text-amber-500" },
    { cond: true, text: "Сегодня рядом интересное событие", icon: CalendarDays, href: "/events", color: "text-violet-500" },
    { cond: (stats?.profileViews || 0) > 0, text: `${stats?.profileViews || 5} человек посмотрели ваш профиль`, icon: Eye, href: "/profile-views", color: "text-blue-500" },
  ].filter(r => r.cond).slice(0, 3);

  if (reasons.length === 0) return null;

  return (
    <div className="premium-card p-4 space-y-2.5">
      <h3 className="text-[14px] font-bold text-foreground flex items-center gap-2">
        <span className="text-lg">💡</span> Причины заглянуть
      </h3>
      {reasons.map((r, i) => (
        <Link
          key={i}
          to={r.href}
          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/40 transition-colors"
        >
          <r.icon className={`h-4.5 w-4.5 shrink-0 ${r.color}`} />
          <p className="flex-1 text-[13px] text-foreground">{r.text}</p>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
      ))}
    </div>
  );
}
