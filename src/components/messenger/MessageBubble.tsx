import { memo } from "react";
import { cn } from "@/lib/utils";
import { Check, CheckCheck, Clock } from "lucide-react";
import SmartImage from "@/components/ui/smart-image";
import type { MessageItem } from "@/hooks/useConversations";

function formatMessageTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function formatDateSeparator(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return "Сегодня";
  if (diff < 172800000) return "Вчера";
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

export function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center justify-center my-4">
      <span className="text-[11px] text-muted-foreground font-medium bg-secondary/80 px-3 py-1 rounded-md">
        {date}
      </span>
    </div>
  );
}

interface Props {
  msg: MessageItem;
  isMine: boolean;
  showDate: string | null;
  /** True if next message belongs to the same author within 2 min — reduces vertical gap. */
  groupedWithNext?: boolean;
  /** Last read time of the OTHER party — used to render "прочитано" tick on my messages. */
  otherLastReadAt?: string | null;
}

function MessageBubbleImpl({ msg, isMine, showDate, groupedWithNext, otherLastReadAt }: Props) {
  if (msg.is_system) {
    return (
      <>
        {showDate && <DateSeparator date={showDate} />}
        <div className="flex justify-center my-3">
          <span className="text-[12px] text-muted-foreground bg-secondary/60 px-4 py-1.5 rounded-md italic">
            {msg.text}
          </span>
        </div>
      </>
    );
  }

  const isOptimistic = msg.id.startsWith("optimistic-");
  const isReadByOther =
    isMine && !isOptimistic && otherLastReadAt
      ? new Date(msg.created_at).getTime() <= new Date(otherLastReadAt).getTime()
      : false;

  return (
    <>
      {showDate && <DateSeparator date={showDate} />}
      <div className={cn(
        "flex",
        groupedWithNext ? "mb-0.5" : "mb-2",
        isMine ? "justify-end" : "justify-start"
      )}>
        <div className={cn(
          "max-w-[70%] px-3.5 py-2.5",
          isMine
            ? "bg-primary text-primary-foreground rounded-[16px] rounded-br-[4px]"
            : "bg-card text-foreground rounded-[16px] rounded-bl-[4px] border border-border/50",
          isOptimistic && "opacity-80"
        )}>
          {msg.media_url && (
            <SmartImage
              src={msg.media_url}
              alt=""
              aspectClass="aspect-[4/3]"
              wrapperClassName="rounded-lg max-w-[260px] mb-1.5 cursor-pointer"
              className="object-cover hover:opacity-95 transition-opacity"
              onClick={() => window.open(msg.media_url!, "_blank")}
            />
          )}
          {msg.text && (
            <p className="text-[14px] leading-[1.5] whitespace-pre-wrap break-words">{msg.text}</p>
          )}
          <p className={cn(
            "text-[10px] mt-1 text-right leading-none flex items-center justify-end gap-1",
            isMine ? "text-primary-foreground/60" : "text-muted-foreground/60"
          )}>
            {formatMessageTime(msg.created_at)}
            {isMine && (
              isOptimistic ? (
                <Clock className="h-3 w-3 opacity-70" aria-label="Отправляется" />
              ) : isReadByOther ? (
                <CheckCheck className="h-3 w-3 text-sky-200" aria-label="Прочитано" />
              ) : (
                <Check className="h-3 w-3 opacity-70" aria-label="Доставлено" />
              )
            )}
          </p>
        </div>
      </div>
    </>
  );
}

const MessageBubble = memo(MessageBubbleImpl, (prev, next) =>
  prev.msg.id === next.msg.id &&
  prev.msg.text === next.msg.text &&
  prev.msg.media_url === next.msg.media_url &&
  prev.msg.created_at === next.msg.created_at &&
  prev.isMine === next.isMine &&
  prev.showDate === next.showDate &&
  prev.groupedWithNext === next.groupedWithNext &&
  // Re-render only if read state actually flipped for this message.
  (function () {
    const prevRead = prev.isMine && prev.otherLastReadAt
      ? new Date(prev.msg.created_at).getTime() <= new Date(prev.otherLastReadAt).getTime() : false;
    const nextRead = next.isMine && next.otherLastReadAt
      ? new Date(next.msg.created_at).getTime() <= new Date(next.otherLastReadAt).getTime() : false;
    return prevRead === nextRead;
  })()
);

export default MessageBubble;
