import { Crown, Heart, Eye, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useVipStatus } from "@/hooks/useVipStatus";

export default function VipPromoBanner() {
  const { data: isVip } = useVipStatus();
  if (isVip) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/[0.08] via-orange-500/[0.06] to-amber-500/[0.08] border border-amber-500/15 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
          <Crown className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-foreground">Попробуйте VIP</p>
          <p className="text-[12px] text-muted-foreground">Узнайте, кому вы нравитесь</p>
        </div>
        <Link to="/premium">
          <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-1.5 text-[12px]">
            <Crown className="h-3.5 w-3.5" />VIP
          </Button>
        </Link>
      </div>
    </div>
  );
}
