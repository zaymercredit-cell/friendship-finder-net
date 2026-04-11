import { Crown, Eye, Heart, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";

interface VipPaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

const featureIcons: Record<string, typeof Crown> = {
  likes: Heart,
  views: Eye,
  boost: Zap,
  superlike: Star,
};

export default function VipPaywallModal({ open, onOpenChange, feature = "likes" }: VipPaywallModalProps) {
  const Icon = featureIcons[feature] || Crown;
  
  const titles: Record<string, string> = {
    likes: "Узнайте, кому вы нравитесь",
    views: "Узнайте, кто смотрел ваш профиль",
    boost: "Продвиньте свой профиль",
    superlike: "Отправьте Super Like",
    limit: "Лимит симпатий исчерпан",
  };

  const descriptions: Record<string, string> = {
    likes: "С VIP-подпиской вы увидите всех, кто поставил вам симпатию",
    views: "Получите полный доступ к списку посетителей вашего профиля",
    boost: "Ваш профиль будет показываться чаще в течение 24 часов",
    superlike: "Выделитесь среди других — Super Like привлекает больше внимания",
    limit: "Активируйте VIP для безлимитных симпатий каждый день",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-3 pt-2">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Icon className="h-7 w-7 text-white" />
            </div>
            <DialogTitle className="text-xl">{titles[feature] || "Получите VIP доступ"}</DialogTitle>
            <p className="text-[14px] text-muted-foreground">
              {descriptions[feature] || "Откройте все возможности ВДрузьях"}
            </p>
          </div>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="space-y-2">
            {["Безлимитные симпатии", "Видеть кто лайкнул", "Просмотры профиля", "Boost 1 раз в неделю"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-[13px]">
                <Crown className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
          <Link to="/premium" onClick={() => onOpenChange(false)}>
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2 mt-2">
              <Crown className="h-4 w-4" />
              Стать VIP
            </Button>
          </Link>
          <Button variant="ghost" className="w-full text-muted-foreground text-[13px]" onClick={() => onOpenChange(false)}>
            Не сейчас
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
