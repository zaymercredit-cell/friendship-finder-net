import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Heart, Users } from "lucide-react";

export function EmptyConversations() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-[260px]">
        <div className="h-14 w-14 rounded-xl bg-secondary/80 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="h-7 w-7 text-muted-foreground/30" />
        </div>
        <h3 className="text-[15px] font-semibold text-foreground mb-1.5">Нет диалогов</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-5">
          Начните общение с кем-то из знакомств или друзей
        </p>
        <div className="flex flex-col gap-2">
          <Link to="/discover">
            <Button size="sm" className="w-full gap-2 text-[13px] h-9">
              <Heart className="h-3.5 w-3.5" />Знакомства
            </Button>
          </Link>
          <Link to="/people">
            <Button size="sm" variant="outline" className="w-full gap-2 text-[13px] h-9">
              <Users className="h-3.5 w-3.5" />Найти людей
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function NoChatSelected() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background/30">
      <div className="text-center max-w-[280px]">
        <div className="h-16 w-16 rounded-xl bg-secondary/60 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="h-8 w-8 text-muted-foreground/20" />
        </div>
        <h3 className="text-[16px] font-semibold text-foreground mb-1.5">Выберите диалог</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          Выберите существующий диалог или начните новый из профиля или знакомств
        </p>
      </div>
    </div>
  );
}
