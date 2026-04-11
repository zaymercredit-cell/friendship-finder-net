import { Users, Calendar, MessageCircle, Heart, UserPlus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

const mockActivityFeed = [
  { type: "register", text: "Анна присоединилась к платформе", icon: UserPlus, time: new Date(Date.now() - 120000), color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { type: "match", text: "Дмитрий и Ольга — новое совпадение!", icon: Heart, time: new Date(Date.now() - 300000), color: "text-rose-500", bg: "bg-rose-500/10" },
  { type: "community", text: "Михаил вступил в «Путешественники»", icon: Users, time: new Date(Date.now() - 600000), color: "text-blue-500", bg: "bg-blue-500/10" },
  { type: "event", text: "Создано событие «Кофе у реки»", icon: Calendar, time: new Date(Date.now() - 900000), color: "text-violet-500", bg: "bg-violet-500/10" },
  { type: "chat", text: "12 новых диалогов начато за час", icon: MessageCircle, time: new Date(Date.now() - 1200000), color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { type: "register", text: "Елена присоединилась к платформе", icon: UserPlus, time: new Date(Date.now() - 1800000), color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

export default function ActivityFeedBlock() {
  return (
    <div className="premium-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-foreground">Жизнь платформы</h3>
          <p className="text-[11px] text-muted-foreground">Что происходит прямо сейчас</p>
        </div>
        <span className="ml-auto flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-[11px] text-success font-medium">Live</span>
        </span>
      </div>
      <div className="space-y-1.5">
        {mockActivityFeed.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/30 transition-colors"
          >
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", item.bg)}>
              <item.icon className={cn("h-4 w-4", item.color)} />
            </div>
            <p className="flex-1 text-[13px] text-foreground leading-snug">{item.text}</p>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {formatDistanceToNow(item.time, { addSuffix: false, locale: ru })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
