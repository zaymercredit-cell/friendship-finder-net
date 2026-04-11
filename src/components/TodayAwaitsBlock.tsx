import { Eye, Heart, Users, Calendar, MessageCircle, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useDailyStats } from "@/hooks/useDailyStats";
import { cn } from "@/lib/utils";

const awaitsItems = [
  { icon: Eye, label: "просмотров профиля", mockValue: 12, href: "/profile-views", gradient: "from-blue-500/10 to-blue-600/10", iconColor: "text-blue-500" },
  { icon: Heart, label: "новых симпатий", mockValue: 4, href: "/likes-you", gradient: "from-rose-500/10 to-pink-500/10", iconColor: "text-rose-500" },
  { icon: Sparkles, label: "совпадений", mockValue: 2, href: "/matches", gradient: "from-amber-500/10 to-orange-500/10", iconColor: "text-amber-500" },
  { icon: Users, label: "людей рядом", mockValue: 8, href: "/people-nearby", gradient: "from-emerald-500/10 to-green-500/10", iconColor: "text-emerald-500" },
  { icon: Calendar, label: "событий сегодня", mockValue: 3, href: "/events", gradient: "from-violet-500/10 to-purple-500/10", iconColor: "text-violet-500" },
  { icon: MessageCircle, label: "непрочитанных", mockValue: 5, href: "/messages", gradient: "from-cyan-500/10 to-sky-500/10", iconColor: "text-cyan-500" },
];

export default function TodayAwaitsBlock() {
  const { data: stats } = useDailyStats();

  const items = awaitsItems.map((item, i) => {
    let value = item.mockValue;
    if (stats) {
      if (i === 0) value = stats.profileViews || item.mockValue;
      if (i === 1) value = stats.likesReceived || item.mockValue;
      if (i === 2) value = stats.newMatches || item.mockValue;
      if (i === 5) value = stats.messagesReceived || item.mockValue;
    }
    return { ...item, value };
  }).filter(i => i.value > 0);

  if (items.length === 0) return null;

  return (
    <div className="premium-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-[15px] font-bold text-foreground">Сегодня вас ждёт</h3>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.slice(0, 6).map(item => (
          <Link key={item.label} to={item.href} className={cn(
            "flex items-center gap-2.5 p-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
            `bg-gradient-to-r ${item.gradient}`
          )}>
            <item.icon className={cn("h-4.5 w-4.5 shrink-0", item.iconColor)} />
            <div className="min-w-0">
              <span className="text-[16px] font-bold text-foreground">{item.value}</span>
              <p className="text-[11px] text-muted-foreground leading-tight truncate">{item.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
