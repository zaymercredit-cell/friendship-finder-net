import { useVipStatus } from "@/hooks/useVipStatus";

interface AdPlaceholderProps {
  className?: string;
}

export default function AdPlaceholder({ className = "" }: AdPlaceholderProps) {
  const { data: isVip } = useVipStatus();
  if (isVip) return null;

  return (
    <div className={`bg-secondary/40 border border-border/40 rounded-xl p-4 text-center ${className}`}>
      <p className="text-[11px] text-muted-foreground/50 uppercase tracking-wider">Реклама</p>
      <div className="h-16 flex items-center justify-center">
        <p className="text-[13px] text-muted-foreground">Рекламное место</p>
      </div>
    </div>
  );
}
