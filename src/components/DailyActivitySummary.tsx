import { useDailyStats } from "@/hooks/useDailyStats";
import { Eye, Heart, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function DailyActivitySummary() {
  const { data: stats } = useDailyStats();
  if (!stats) return null;

  const total = stats.profileViews + stats.likesReceived + stats.messagesReceived + stats.newMatches;
  if (total === 0) return null;

  const items = [
    { icon: Eye, label: "просмотров", value: stats.profileViews, href: "/profile-views", color: "text-primary" },
    { icon: Heart, label: "симпатий", value: stats.likesReceived, href: "/likes-you", color: "text-destructive" },
    { icon: MessageCircle, label: "сообщений", value: stats.messagesReceived, href: "/messages", color: "text-accent" },
    { icon: Sparkles, label: "совпадений", value: stats.newMatches, href: "/matches", color: "text-warning" },
  ].filter(i => i.value > 0);

  return (
    <div className="bg-card rounded-xl border border-border/60 card-shadow p-4">
      <p className="text-[14px] font-semibold text-foreground mb-3">Сегодня</p>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <Link key={item.label} to={item.href} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-secondary/40 hover:bg-secondary/70 transition-colors">
            <item.icon className={`h-4 w-4 ${item.color}`} />
            <div>
              <span className="text-[15px] font-semibold text-foreground">{item.value}</span>
              <span className="text-[12px] text-muted-foreground ml-1">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
