import { forwardRef, memo } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { prefetchRoute } from "@/lib/route-prefetch";

const entries = [
  { label: "Продолжить знакомство", href: "/discover", icon: Sparkles, variant: "default" as const },
  { label: "Продолжить чат", href: "/messages", icon: MessageCircle, variant: "outline" as const },
  { label: "Новые совпадения", href: "/matches", icon: Heart, variant: "outline" as const },
];

/**
 * forwardRef + memo: silences the "Function components cannot be given refs"
 * warning under React 18 strict checks and avoids needless re-renders inside
 * the long FeedPage tree.
 */
const ReturnEntryBlock = memo(
  forwardRef<HTMLDivElement>(function ReturnEntryBlock(_props, ref) {
    return (
      <div ref={ref} className="flex flex-col gap-2">
        {entries.map((e) => (
          <Link
            key={e.href}
            to={e.href}
            onMouseEnter={() => prefetchRoute(e.href)}
            onFocus={() => prefetchRoute(e.href)}
          >
            <Button
              variant={e.variant}
              className="w-full justify-between gap-2 h-11 text-[13px] rounded-xl"
            >
              <span className="flex items-center gap-2">
                <e.icon className="h-4 w-4" />
                {e.label}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ))}
      </div>
    );
  }),
);

export default ReturnEntryBlock;
