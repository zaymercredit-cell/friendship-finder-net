import { Sparkles } from "lucide-react";

interface InterestMatchBadgeProps {
  commonInterests: string[];
  compact?: boolean;
  className?: string;
}

export default function InterestMatchBadge({ commonInterests, compact, className }: InterestMatchBadgeProps) {
  if (commonInterests.length === 0) return null;

  if (compact) {
    return (
      <div className={`flex items-center gap-1 text-[10px] text-primary font-medium ${className || ""}`}>
        <Sparkles className="h-2.5 w-2.5" />
        {commonInterests.length} общих
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className || ""}`}>
      <Sparkles className="h-3 w-3 text-primary shrink-0" />
      {commonInterests.slice(0, 3).map(interest => (
        <span
          key={interest}
          className="text-[10px] font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-md"
        >
          {interest}
        </span>
      ))}
      {commonInterests.length > 3 && (
        <span className="text-[10px] text-primary/60">+{commonInterests.length - 3}</span>
      )}
    </div>
  );
}
