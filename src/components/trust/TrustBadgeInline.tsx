import { ShieldCheck, Shield, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  isVerified?: boolean;
  trustScore?: number;
  isOnline?: boolean;
  compact?: boolean;
  className?: string;
}

export default function TrustBadgeInline({ isVerified, trustScore, isOnline, compact, className }: Props) {
  if (!isVerified && (!trustScore || trustScore < 50)) return null;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {isVerified && (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded-full">
          <ShieldCheck className="h-2.5 w-2.5" />
          {!compact && "Verified"}
        </span>
      )}
      {trustScore && trustScore >= 80 && !isVerified && (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
          <Shield className="h-2.5 w-2.5" />
          {!compact && `${trustScore}%`}
        </span>
      )}
    </div>
  );
}
