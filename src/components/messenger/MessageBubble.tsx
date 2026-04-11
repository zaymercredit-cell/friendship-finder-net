import { cn } from "@/lib/utils";
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

function DateSeparator({ date }: { date: string }) {
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
}

export default function MessageBubble({ msg, isMine, showDate }: Props) {
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

  return (
    <>
      {showDate && <DateSeparator date={showDate} />}
      <div className={cn("flex mb-1.5", isMine ? "justify-end" : "justify-start")}>
        <div className={cn(
          "max-w-[70%] px-3.5 py-2.5",
          isMine
            ? "bg-primary text-primary-foreground rounded-[16px] rounded-br-[4px]"
            : "bg-card text-foreground rounded-[16px] rounded-bl-[4px] border border-border/50"
        )}>
          {msg.media_url && (
            <img
              src={msg.media_url}
              alt=""
              className="rounded-lg max-w-full max-h-64 object-cover mb-1.5 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(msg.media_url!, "_blank")}
            />
          )}
          {msg.text && (
            <p className="text-[14px] leading-[1.5] whitespace-pre-wrap">{msg.text}</p>
          )}
          <p className={cn(
            "text-[10px] mt-1 text-right leading-none",
            isMine ? "text-primary-foreground/50" : "text-muted-foreground/60"
          )}>
            {formatMessageTime(msg.created_at)}
          </p>
        </div>
      </div>
    </>
  );
}
