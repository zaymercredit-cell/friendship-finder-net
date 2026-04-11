import { TrendingUp, Zap, MessageCircle, Clock, Star, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeType = "new" | "trending" | "active_replier" | "popular_today" | "frequent_matcher" | "hot_streak";

interface Props {
  badges: BadgeType[];
  compact?: boolean;
}

const badgeConfig: Record<BadgeType, { icon: any; label: string; color: string; bgColor: string }> = {
  new: { icon: Zap, label: "Новичок", color: "text-emerald-600", bgColor: "bg-emerald-500/8" },
  trending: { icon: TrendingUp, label: "В тренде", color: "text-primary", bgColor: "bg-primary/8" },
  active_replier: { icon: MessageCircle, label: "Быстро отвечает", color: "text-sky-600", bgColor: "bg-sky-500/8" },
  popular_today: { icon: Star, label: "Популярен сегодня", color: "text-amber-600", bgColor: "bg-amber-500/8" },
  frequent_matcher: { icon: Flame, label: "Часто совпадает", color: "text-rose-600", bgColor: "bg-rose-500/8" },
  hot_streak: { icon: Flame, label: "Серия активности", color: "text-orange-600", bgColor: "bg-orange-500/8" },
};

export default function GrowthProofBadges({ badges, compact = false }: Props) {
  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {badges.slice(0, compact ? 2 : 4).map(badge => {
        const cfg = badgeConfig[badge];
        if (!cfg) return null;
        return (
          <span key={badge} className={cn(
            "inline-flex items-center gap-1 font-medium rounded-md transition-colors",
            cfg.bgColor, cfg.color,
            compact ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"
          )}>
            <cfg.icon className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
            {cfg.label}
          </span>
        );
      })}
    </div>
  );
}

// Helper to generate random badges for mock data
export function getRandomGrowthBadges(userId: string): BadgeType[] {
  const hash = userId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const badges: BadgeType[] = [];
  if (hash % 3 === 0) badges.push("trending");
  if (hash % 5 === 0) badges.push("active_replier");
  if (hash % 7 === 0) badges.push("popular_today");
  if (hash % 4 === 0) badges.push("frequent_matcher");
  if (parseInt(userId) > 100) badges.push("new");
  return badges.slice(0, 2);
}
