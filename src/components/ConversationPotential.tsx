import { MessageCircle, Zap, Heart, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  score: number; // 0-100
  compact?: boolean;
  className?: string;
}

export default function ConversationPotential({ score, compact = false, className }: Props) {
  const level = score >= 80 ? "high" : score >= 55 ? "medium" : "low";
  const config = {
    high: { label: "Легко общаться", icon: Zap, color: "text-success", bg: "bg-success/10", border: "border-success/20" },
    medium: { label: "Хороший потенциал", icon: MessageCircle, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
    low: { label: "Стоит попробовать", icon: Heart, color: "text-muted-foreground", bg: "bg-secondary", border: "border-border/50" },
  }[level];

  const Icon = config.icon;

  if (compact) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium rounded-md px-1.5 py-0.5", config.bg, config.color, className)}>
        <Icon className="h-2.5 w-2.5" />
        {score}%
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-1.5", config.bg, config.border, className)}>
      <Icon className={cn("h-3.5 w-3.5", config.color)} />
      <div>
        <p className={cn("text-[11px] font-semibold", config.color)}>{config.label}</p>
        <p className="text-[10px] text-muted-foreground">Потенциал общения {score}%</p>
      </div>
    </div>
  );
}
