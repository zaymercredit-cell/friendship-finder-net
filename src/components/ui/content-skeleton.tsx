import { cn } from "@/lib/utils";

/**
 * Premium, layout-stable loading placeholders.
 * Lightweight (no shimmer animation chains) — used as fallback for Suspense
 * boundaries and async data sections to eliminate full-screen spinners.
 */

interface SkelProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SkeletonLine({ className, ...rest }: SkelProps) {
  return (
    <div
      className={cn("h-3 rounded-md bg-muted/70 animate-pulse", className)}
      {...rest}
    />
  );
}

export function SkeletonBlock({ className, ...rest }: SkelProps) {
  return (
    <div
      className={cn("rounded-xl bg-muted/60 animate-pulse", className)}
      {...rest}
    />
  );
}

/** Generic page loader: header + a few content rows. */
export function PageSkeleton() {
  return (
    <div className="space-y-4 py-2" aria-busy="true" aria-live="polite">
      <SkeletonLine className="h-7 w-1/3" />
      <SkeletonLine className="h-3 w-1/2 opacity-70" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/** Card-shaped skeleton — matches premium-card spacing. */
export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
      <SkeletonBlock className="h-40 rounded-none" />
      <div className="p-4 space-y-2.5">
        <SkeletonLine className="h-4 w-3/4" />
        <SkeletonLine className="h-3 w-full opacity-70" />
        <SkeletonLine className="h-3 w-2/3 opacity-70" />
      </div>
    </div>
  );
}

/** Compact list-row skeleton — for messages, notifications, friends. */
export function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl">
      <SkeletonBlock className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="h-3 w-1/3" />
        <SkeletonLine className="h-3 w-2/3 opacity-70" />
      </div>
    </div>
  );
}
