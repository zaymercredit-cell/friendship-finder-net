import { Eye, Heart, MessageCircle, Users, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useDailyStats } from "@/hooks/useDailyStats";
import { cn } from "@/lib/utils";

const fomoItems = [
  {
    icon: Users,
    getText: (n: number) => `${n} человек были онлайн, пока вас не было`,
    href: "/people-nearby",
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-500",
    fallback: 14,
  },
  {
    icon: Heart,
    getText: (n: number) => `${n} совпадений уже ждут ответа`,
    href: "/matches",
    gradient: "from-rose-500/10 to-pink-500/10",
    iconColor: "text-rose-500",
    fallback: 3,
  },
  {
    icon: Eye,
    getText: (n: number) => `${n} человек посмотрели ваш профиль`,
    href: "/profile-views",
    gradient: "from-blue-500/10 to-indigo-500/10",
    iconColor: "text-blue-500",
    fallback: 7,
  },
  {
    icon: MessageCircle,
    getText: (n: number) => `${n} новых сообщений ждут вас`,
    href: "/messages",
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-500",
    fallback: 4,
  },
];

export default function FomoBlock() {
  const { data: stats } = useDailyStats();

  const items = fomoItems.map((item, i) => {
    let value = item.fallback;
    if (stats) {
      if (i === 0) value = Math.max(stats.profileViews || 0, item.fallback);
      if (i === 1) value = stats.newMatches || item.fallback;
      if (i === 2) value = stats.profileViews || item.fallback;
      if (i === 3) value = stats.messagesReceived || item.fallback;
    }
    return { ...item, value };
  }).filter(i => i.value > 0).slice(0, 3);

  if (items.length === 0) return null;

  return (
    <div className="premium-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center">
          <Clock className="h-4 w-4 text-amber-500" />
        </div>
        <h3 className="text-[15px] font-bold text-foreground">Пока вас не было</h3>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <Link
            key={idx}
            to={item.href}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]",
              `bg-gradient-to-r ${item.gradient}`
            )}
          >
            <item.icon className={cn("h-5 w-5 shrink-0", item.iconColor)} />
            <p className="flex-1 text-[13px] text-foreground font-medium">
              {item.getText(item.value)}
            </p>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
