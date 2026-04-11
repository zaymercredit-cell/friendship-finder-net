import { useConversationList } from "@/hooks/useConversations";
import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function StaleConversationNudge() {
  const { data: conversations } = useConversationList();

  // Find conversations with no activity in 2+ days
  const staleConvs = useMemo(() => {
    if (!conversations) return [];
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
    return conversations
      .filter(c => c.lastMessageAt && new Date(c.lastMessageAt).getTime() < twoDaysAgo)
      .slice(0, 3);
  }, [conversations]);

  if (staleConvs.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border/60 card-shadow p-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="h-4 w-4 text-primary" />
        <span className="text-[14px] font-semibold text-foreground">Продолжите разговор</span>
      </div>
      <p className="text-[12px] text-muted-foreground mb-3">Похоже, эти диалоги приостановились — напишите первым!</p>
      <div className="space-y-2">
        {staleConvs.map(conv => (
          <Link
            key={conv.id}
            to={`/messages/${conv.id}`}
            className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/40 hover:bg-secondary/70 transition-colors"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={conv.otherUser.avatar_url || ""} alt={conv.otherUser.first_name} />
              <AvatarFallback>{conv.otherUser.first_name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground truncate">{conv.otherUser.first_name} {conv.otherUser.last_name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{conv.lastMessageText}</p>
            </div>
            <Button size="sm" variant="secondary" className="text-[11px] h-7 gap-1 shrink-0">
              <MessageCircle className="h-3 w-3" />Написать
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
