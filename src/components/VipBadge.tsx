import { Crown, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VipBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function VipBadge({ className, size = "sm" }: VipBadgeProps) {
  const sizeClasses = {
    sm: "h-[18px] px-1.5 text-[10px] gap-0.5",
    md: "h-[22px] px-2 text-[11px] gap-1",
    lg: "h-[26px] px-2.5 text-[12px] gap-1",
  }[size];

  const iconSize = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5",
  }[size];

  return (
    <span className={cn(
      "inline-flex items-center rounded-md font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm",
      sizeClasses,
      className
    )}>
      <Crown className={iconSize} />
      VIP
    </span>
  );
}

interface VerifiedBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function VerifiedBadge({ className, size = "sm" }: VerifiedBadgeProps) {
  const iconSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];

  return (
    <BadgeCheck className={cn("text-primary fill-primary/10", iconSize, className)} />
  );
}
