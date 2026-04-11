import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { getTrustLabel } from "@/hooks/useTrustScore";

export default function TrustScoreBadge({ score, showLabel = false }: { score: number; showLabel?: boolean }) {
  const { label, color } = getTrustLabel(score);
  const Icon = score >= 80 ? ShieldCheck : score >= 50 ? Shield : ShieldAlert;

  return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${color}`}>
      <Icon className="h-4 w-4" />
      {showLabel ? label : `${score}%`}
    </span>
  );
}
