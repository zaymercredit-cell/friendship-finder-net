import { ReactNode } from "react";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { PageSkeleton } from "@/components/ui/content-skeleton";
import { ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminGuardProps {
  children: ReactNode;
}

/** Wraps any admin page with role check + premium loading state. */
export function AdminGuard({ children }: AdminGuardProps) {
  const { data: isAdmin, isLoading } = useAdminCheck();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <PageSkeleton />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-3 animate-fade-in">
          <div className="inline-flex p-3 rounded-2xl bg-destructive/10 text-destructive">
            <ShieldOff className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Доступ запрещён</h2>
          <p className="text-sm text-muted-foreground">У вас нет прав для просмотра этой страницы.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

interface AdminHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function AdminHeader({ icon: Icon, title, subtitle, actions }: AdminHeaderProps) {
  return (
    <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Skeleton rows that match the admin table layout. */
export function AdminTableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden animate-fade-in">
      <div className="grid border-b border-border/60 bg-muted/30 px-4 py-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 w-24 rounded bg-muted/70 animate-pulse" />
        ))}
      </div>
      <div className="divide-y divide-border/40">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="grid items-center px-4 py-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="flex items-center gap-2 pr-3">
                {c === 0 && <div className="h-9 w-9 rounded-full bg-muted/70 animate-pulse shrink-0" />}
                <div className={cn("h-3 rounded bg-muted/70 animate-pulse", c === 0 ? "w-2/3" : "w-3/4")} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: ReactNode;
  tone?: "default" | "danger" | "warning" | "success";
}

export function FilterChip({ active, onClick, count, children, tone = "default" }: FilterChipProps) {
  const tones = {
    default: active ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-secondary border-border/60 text-foreground",
    danger: active ? "bg-destructive text-destructive-foreground border-destructive" : "bg-card hover:bg-destructive/10 border-border/60 text-foreground hover:text-destructive",
    warning: active ? "bg-orange-500 text-white border-orange-500" : "bg-card hover:bg-orange-500/10 border-border/60 text-foreground hover:text-orange-600",
    success: active ? "bg-green-600 text-white border-green-600" : "bg-card hover:bg-green-500/10 border-border/60 text-foreground hover:text-green-600",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-xs font-medium transition-all duration-150 active:scale-[0.97]",
        tones[tone],
      )}
    >
      {children}
      {typeof count === "number" && (
        <span className={cn("min-w-[1.25rem] px-1 text-[10px] rounded-full", active ? "bg-white/20" : "bg-muted text-muted-foreground")}>
          {count}
        </span>
      )}
    </button>
  );
}
