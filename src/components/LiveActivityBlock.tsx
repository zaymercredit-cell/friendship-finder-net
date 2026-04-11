import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockUsers } from "@/lib/mock-data";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Users, CalendarDays, MessageCircle, Heart, Sparkles, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface ActivityItem {
  id: string;
  type: "join" | "match" | "event" | "community" | "message";
  user: { name: string; avatar: string; username: string };
  text: string;
  timeAgo: string;
  icon: React.ElementType;
  color: string;
}

export default function LiveActivityBlock() {
  const activities: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = [];
    const types = [
      { type: "join" as const, texts: ["присоединился к платформе", "создал профиль", "обновил фото"], icon: UserPlus, color: "text-success" },
      { type: "match" as const, texts: ["нашёл совпадение", "получил взаимную симпатию"], icon: Heart, color: "text-primary" },
      { type: "event" as const, texts: ["создал событие", "присоединился к встрече"], icon: CalendarDays, color: "text-warning" },
      { type: "community" as const, texts: ["вступил в сообщество", "создал обсуждение"], icon: Users, color: "text-accent" },
    ];

    mockUsers.slice(0, 8).forEach((u, i) => {
      const t = types[i % types.length];
      items.push({
        id: `act-${u.id}`,
        type: t.type,
        user: { name: u.name.split(" ")[0], avatar: u.avatar, username: u.username },
        text: t.texts[Math.floor(Math.random() * t.texts.length)],
        timeAgo: `${Math.floor(Math.random() * 55 + 1)} мин`,
        icon: t.icon,
        color: t.color,
      });
    });
    return items;
  }, []);

  return (
    <div className="premium-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full bg-success pulse-dot" />
        <span className="text-[14px] font-semibold text-foreground">Что происходит сейчас</span>
        <span className="text-[11px] text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded-md">Live</span>
      </div>
      <div className="space-y-2.5 max-h-[280px] overflow-y-auto scrollbar-hide">
        {activities.map((act) => (
          <Link
            key={act.id}
            to={`/profile/${act.user.username}`}
            className="flex items-center gap-3 py-1.5 hover:bg-secondary/40 rounded-lg px-2 -mx-2 transition-colors"
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={act.user.avatar} className="object-cover" />
              <AvatarFallback className="text-[11px]">{act.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-foreground">
                <span className="font-medium">{act.user.name}</span>{" "}
                <span className="text-muted-foreground">{act.text}</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <act.icon className={`h-3 w-3 ${act.color}`} />
              <span className="text-[10px] text-muted-foreground">{act.timeAgo}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
