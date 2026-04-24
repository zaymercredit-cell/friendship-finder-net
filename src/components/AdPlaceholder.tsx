import { forwardRef, memo } from "react";
import { useVipStatus } from "@/hooks/useVipStatus";

interface AdPlaceholderProps {
  className?: string;
}

/**
 * forwardRef + memo: prevents React's "Function components cannot be given refs"
 * warning when this component is mounted by parents that forward refs (e.g. some
 * map render slots), and avoids unnecessary re-renders when surrounding
 * lists update.
 */
const AdPlaceholder = memo(
  forwardRef<HTMLDivElement, AdPlaceholderProps>(function AdPlaceholder(
    { className = "" },
    ref,
  ) {
    const { data: isVip } = useVipStatus();
    if (isVip) return null;

    return (
      <div
        ref={ref}
        className={`bg-secondary/40 border border-border/40 rounded-xl p-4 text-center ${className}`}
      >
        <p className="text-[11px] text-muted-foreground/50 uppercase tracking-wider">Реклама</p>
        <div className="h-16 flex items-center justify-center">
          <p className="text-[13px] text-muted-foreground">Рекламное место</p>
        </div>
      </div>
    );
  }),
);

export default AdPlaceholder;
