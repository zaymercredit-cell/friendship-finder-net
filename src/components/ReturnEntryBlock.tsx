import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const entries = [
  { label: "Продолжить знакомство", href: "/discover", icon: Sparkles, variant: "default" as const },
  { label: "Продолжить чат", href: "/messages", icon: MessageCircle, variant: "outline" as const },
  { label: "Новые совпадения", href: "/matches", icon: Heart, variant: "outline" as const },
];

export default function ReturnEntryBlock() {
  return (
    <div className="flex flex-col gap-2">
      {entries.map((e) => (
        <Link key={e.href} to={e.href}>
          <Button variant={e.variant} className="w-full justify-between gap-2 h-11 text-[13px] rounded-xl">
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
}
