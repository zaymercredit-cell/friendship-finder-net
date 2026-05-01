import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, MoreHorizontal, User, Flag, Ban, EyeOff, Sparkles, Heart, ShieldCheck } from "lucide-react";
import type { ConversationListItem } from "@/hooks/useConversations";

interface Props {
  conv: ConversationListItem;
  onBack: () => void;
  isTyping?: boolean;
}

export default function ChatHeader({ conv, onBack, isTyping }: Props) {
  const name = `${conv.otherUser.first_name} ${conv.otherUser.last_name}`.trim();
  const profileUrl = `/profile/${conv.otherUser.username || conv.otherUser.user_id}`;

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-card/95 backdrop-blur-md">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <Link to={profileUrl} className="flex items-center gap-3 flex-1 min-w-0 group">
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10 ring-2 ring-border/30 shadow-sm">
            <AvatarImage src={conv.otherUser.avatar_url || ""} alt={name} className="object-cover" />
            <AvatarFallback className="text-sm font-medium bg-secondary">{name[0]}</AvatarFallback>
          </Avatar>
          {conv.otherUser.is_online && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-[2.5px] border-card shadow-sm" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[14.5px] font-semibold text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
            {name}
            {(conv.otherUser as any).is_verified && <ShieldCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />}
          </p>
          <p className="text-[11.5px] text-muted-foreground leading-none mt-0.5 flex items-center gap-1">
            {conv.otherUser.is_online ? (
              <><span className="h-1.5 w-1.5 rounded-full bg-success" />в сети</>
            ) : "был(а) недавно"}
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-1">
        <Link to={profileUrl}>
          <Button variant="ghost" size="sm" className="h-8 text-[11px] gap-1 text-muted-foreground hover:text-primary rounded-lg hidden sm:flex">
            <User className="h-3.5 w-3.5" />
            Профиль
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem asChild>
              <Link to={profileUrl} className="gap-2"><User className="h-4 w-4" />Открыть профиль</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-muted-foreground"><EyeOff className="h-4 w-4" />Скрыть диалог</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-muted-foreground"><Flag className="h-4 w-4" />Пожаловаться</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-destructive"><Ban className="h-4 w-4" />Заблокировать</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
