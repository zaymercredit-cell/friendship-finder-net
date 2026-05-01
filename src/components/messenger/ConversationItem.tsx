import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ConversationListItem } from "@/hooks/useConversations";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, memo } from "react";
import { prefetchConversation } from "@/lib/data-prefetch";

function formatTime(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  if (diff < 172800000) return "Вчера";
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

interface Props {
  conv: ConversationListItem;
  isActive: boolean;
  onClick: () => void;
}

function ConversationItem({ conv, isActive, onClick }: Props) {
  const name = `${conv.otherUser.first_name} ${conv.otherUser.last_name}`.trim();
  const hasUnread = conv.unreadCount > 0;
  const qc = useQueryClient();
  const warm = useCallback(() => prefetchConversation(qc, conv.id), [qc, conv.id]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={warm}
      onFocus={warm}
      onTouchStart={warm}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 text-left group relative",
        isActive
          ? "bg-primary/[0.06]"
          : "hover:bg-secondary/50",
        hasUnread && !isActive && "bg-primary/[0.02]"
      )}
    >
      {isActive && <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-primary" />}

      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar className="h-11 w-11 ring-1 ring-border/30">
          <AvatarImage src={conv.otherUser.avatar_url || ""} alt={name} className="object-cover" />
          <AvatarFallback className="text-[13px] font-medium bg-secondary">{name[0]}</AvatarFallback>
        </Avatar>
        {conv.otherUser.is_online && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-card" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            "text-[14px] truncate",
            hasUnread ? "font-semibold text-foreground" : "font-medium text-foreground"
          )}>{name}</span>
          <span className={cn(
            "text-[11px] shrink-0 tabular-nums",
            hasUnread ? "text-primary font-medium" : "text-muted-foreground/70"
          )}>{formatTime(conv.lastMessageAt)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={cn(
            "text-[13px] truncate leading-snug",
            hasUnread ? "text-foreground/80 font-medium" : "text-muted-foreground"
          )}>
            {conv.lastMessageText || "Начните общение"}
          </p>
          {hasUnread && (
            <span className="h-[18px] min-w-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center px-1 shrink-0">
              {conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default memo(ConversationItem);

