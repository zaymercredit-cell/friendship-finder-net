import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useConversationList, useMessages,
  type MessageItem,
} from "@/hooks/useConversations";

import ConversationItem from "@/components/messenger/ConversationItem";
import ChatHeader from "@/components/messenger/ChatHeader";
import MessageBubble, { formatDateSeparator } from "@/components/messenger/MessageBubble";
import ChatInput from "@/components/messenger/ChatInput";
import { EmptyConversations, NoChatSelected } from "@/components/messenger/EmptyStates";
import AiSuggestMessageButton from "@/components/ai/AiSuggestMessageButton";
import AiTopicsCard from "@/components/ai/AiTopicsCard";
import DatePlannerModal from "@/components/messenger/DatePlannerModal";
import AiCoachMessengerPanel from "@/components/ai/AiCoachMessengerPanel";
import ChatSafetyAlert from "@/components/trust/ChatSafetyAlert";
import AiConversationStarters from "@/components/ai/AiConversationStarters";
import AiSmartReplies from "@/components/ai/AiSmartReplies";

export default function MessagesPage() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: conversations, isLoading } = useConversationList();
  const [selectedId, setSelectedId] = useState<string | null>(routeId || null);
  const selectedConv = conversations?.find(c => c.id === selectedId);
  const { data: messages, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages(selectedId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [aiText, setAiText] = useState("");
  const [initialScroll, setInitialScroll] = useState(false);
  const [datePlannerOpen, setDatePlannerOpen] = useState(false);

  useEffect(() => {
    if (routeId && routeId !== selectedId) {
      setSelectedId(routeId);
      setInitialScroll(false);
    }
  }, [routeId]);

  // Auto-scroll to bottom on initial load or new messages
  useEffect(() => {
    if (messages && messages.length > 0 && !initialScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      setInitialScroll(true);
    } else if (messages && initialScroll) {
      // Only auto-scroll for new messages if already at bottom
      const container = messagesContainerRef.current;
      if (container) {
        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        if (isAtBottom) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }, [messages?.length, initialScroll]);

  // Load older messages on scroll to top
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || !hasNextPage || isFetchingNextPage) return;
    if (container.scrollTop < 80) {
      const prevHeight = container.scrollHeight;
      fetchNextPage().then(() => {
        // Maintain scroll position
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight - prevHeight;
        });
      });
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const selectConv = (id: string) => {
    setSelectedId(id);
    setInitialScroll(false);
    navigate(`/messages/${id}`, { replace: true });
  };

  const goBack = () => {
    setSelectedId(null);
    navigate("/messages", { replace: true });
  };

  const filteredConvs = (conversations || []).filter(c => {
    if (!search.trim()) return true;
    const name = `${c.otherUser.first_name} ${c.otherUser.last_name}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const getDateForMessage = (msg: MessageItem, idx: number, msgs: MessageItem[]) => {
    const thisDate = new Date(msg.created_at).toDateString();
    if (idx === 0) return formatDateSeparator(msg.created_at);
    const prevDate = new Date(msgs[idx - 1].created_at).toDateString();
    return thisDate !== prevDate ? formatDateSeparator(msg.created_at) : null;
  };

  return (
    <div className="max-w-5xl mx-auto px-0 md:px-4">
      <div
        className="bg-card rounded-none md:rounded-xl md:card-shadow md:border border-border/60 overflow-hidden flex"
        style={{ height: "calc(100dvh - 4.5rem)" }}
      >
        {/* ── Left: Conversation List ── */}
        <div className={cn(
          "w-full md:w-[340px] lg:w-[360px] md:border-r border-border flex flex-col shrink-0 bg-card",
          selectedId && "hidden md:flex"
        )}>
          <div className="px-4 pt-4 pb-3">
            <h1 className="text-[18px] font-bold text-foreground tracking-tight">Сообщения</h1>
          </div>

          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                placeholder="Поиск диалогов…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-secondary/60 border-0 text-[13px] rounded-lg focus-visible:ring-primary/30"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4">
                    <div className="h-12 w-12 rounded-full bg-secondary animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-secondary animate-pulse rounded w-2/3" />
                      <div className="h-3 bg-secondary animate-pulse rounded w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConvs.length > 0 ? (
              filteredConvs.map(conv => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  isActive={conv.id === selectedId}
                  onClick={() => selectConv(conv.id)}
                />
              ))
            ) : (
              <EmptyConversations />
            )}
          </div>
        </div>

        {/* ── Right: Chat Area ── */}
        <div className={cn(
          "flex-1 flex flex-col min-w-0 bg-background/40",
          !selectedId && "hidden md:flex"
        )}>
          {selectedConv ? (
            <>
              <ChatHeader conv={selectedConv} onBack={goBack} />

              <ChatSafetyAlert
                otherUserVerified={(selectedConv.otherUser as any).is_verified}
                otherUserTrustScore={(selectedConv.otherUser as any).trust_score}
                isNewConversation={!messages || messages.length <= 2}
              />

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-4 md:px-6 py-3"
                onScroll={handleScroll}
              >
                {isFetchingNextPage && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                {(messages || []).map((msg, idx, arr) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isMine={msg.sender_id === user?.id}
                    showDate={getDateForMessage(msg, idx, arr)}
                  />
                ))}
                {messages?.length === 0 && selectedConv && (
                  <div className="flex flex-col items-center justify-center h-full gap-4 px-2">
                    <p className="text-[13.5px] text-muted-foreground/70">
                      Напишите первое сообщение, чтобы начать общение
                    </p>
                    <AiConversationStarters
                      targetUserId={selectedConv.otherUser.user_id}
                      targetName={selectedConv.otherUser.first_name}
                      onSelectStarter={(text) => setAiText(text)}
                      className="w-full max-w-sm"
                    />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* AI Coach Panel */}
              {selectedConv && (
                <AiCoachMessengerPanel
                  targetUserId={selectedConv.otherUser.user_id}
                  targetName={selectedConv.otherUser.first_name}
                  lastMessages={(messages || []).slice(-6).map(m => ({
                    text: m.text || "",
                    isMine: m.sender_id === user?.id,
                  }))}
                  onSelect={(text) => setAiText(text)}
                />
              )}

              {/* Smart replies */}
              {selectedConv && messages && messages.length > 2 && (
                <div className="px-3 py-1 border-t border-border/20">
                  <AiSmartReplies
                    targetUserId={selectedConv.otherUser.user_id}
                    lastMessages={(messages || []).slice(-6).map(m => ({
                      text: m.text || "",
                      isMine: m.sender_id === user?.id,
                    }))}
                    onSelect={(text) => setAiText(text)}
                  />
                </div>
              )}

              {/* Quick actions */}
              {selectedConv && (
                <div className="flex items-center gap-1 px-3 py-1 border-t border-border/30 bg-card/30">
                  <AiSuggestMessageButton
                    targetUserId={selectedConv.otherUser.user_id}
                    lastMessages={(messages || []).slice(-6).map(m => ({
                      text: m.text || "",
                      isMine: m.sender_id === user?.id,
                    }))}
                    onSelect={(text) => setAiText(text)}
                  />
                  <AiTopicsCard
                    targetUserId={selectedConv.otherUser.user_id}
                    onSelectTopic={(q) => setAiText(q)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10.5px] gap-1 text-muted-foreground hover:text-primary h-7 px-2"
                    onClick={() => setDatePlannerOpen(true)}
                  >
                    <Calendar className="h-3 w-3" />
                    Встреча
                  </Button>
                </div>
              )}

              <ChatInput conversationId={selectedConv.id} prefillText={aiText} onPrefillUsed={() => setAiText("")} />

              {datePlannerOpen && selectedConv && (
                <DatePlannerModal
                  targetUserId={selectedConv.otherUser.user_id}
                  targetName={selectedConv.otherUser.first_name}
                  conversationId={selectedConv.id}
                  onClose={() => setDatePlannerOpen(false)}
                />
              )}
            </>
          ) : (
            <NoChatSelected />
          )}
        </div>
      </div>
    </div>
  );
}
