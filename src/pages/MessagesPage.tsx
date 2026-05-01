import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useConversationList, useMessages,
  type MessageItem,
} from "@/hooks/useConversations";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";

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

// Big virtual offset → lets us prepend (older) pages to the front without
// shifting visible items (Virtuoso anchors via firstItemIndex).
const START_INDEX = 100_000;

interface PreparedMessage {
  msg: MessageItem;
  showDate: string | null;
  groupedWithNext: boolean;
}

export default function MessagesPage() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: conversations, isLoading } = useConversationList();
  const [selectedId, setSelectedId] = useState<string | null>(routeId || null);
  const selectedConv = conversations?.find(c => c.id === selectedId);
  const { data: messages, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages(selectedId);
  const [search, setSearch] = useState("");
  const [aiText, setAiText] = useState("");
  const [datePlannerOpen, setDatePlannerOpen] = useState(false);

  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const firstItemIndexRef = useRef(START_INDEX);
  const prevLengthRef = useRef(0);
  const prevConvRef = useRef<string | null>(null);
  const atBottomRef = useRef(true);

  const { isAnyoneTyping, notifyTyping, stopTyping } = useTypingIndicator(selectedId);

  useEffect(() => {
    if (routeId && routeId !== selectedId) {
      setSelectedId(routeId);
    }
  }, [routeId]);

  // Reset virtual indices when switching conversations.
  useEffect(() => {
    if (selectedId !== prevConvRef.current) {
      firstItemIndexRef.current = START_INDEX;
      prevLengthRef.current = 0;
      atBottomRef.current = true;
      prevConvRef.current = selectedId;
    }
  }, [selectedId]);

  // Maintain firstItemIndex when older messages are prepended.
  useEffect(() => {
    const len = messages?.length || 0;
    const prev = prevLengthRef.current;
    if (len > prev && prev > 0) {
      // Detect prepend: if the first id changed and last id stayed, items were added at the front.
      // Heuristic: when length grows without bottom growth, treat the diff as a prepend.
      // We check by comparing the position of the previous tail.
      const added = len - prev;
      // If the new last message id is the same as the previous last id → all added at front.
      // (Safe to compute from current messages.)
      const currLastId = messages![len - 1].id;
      // Without storing tail explicitly, infer prepend when not at bottom & fetching previous.
      // Simpler: if user is not at bottom, treat growth as prepend.
      if (!atBottomRef.current) {
        firstItemIndexRef.current = Math.max(0, firstItemIndexRef.current - added);
      } else {
        // Growth at the bottom (incoming/sent message) → keep firstItemIndex,
        // Virtuoso will autoscroll via followOutput.
        void currLastId;
      }
    }
    prevLengthRef.current = len;
  }, [messages]);

  const prepared: PreparedMessage[] = useMemo(() => {
    const arr = messages || [];
    return arr.map((msg, idx) => {
      const thisDate = new Date(msg.created_at).toDateString();
      const prevDate = idx > 0 ? new Date(arr[idx - 1].created_at).toDateString() : null;
      const showDate = idx === 0 || thisDate !== prevDate ? formatDateSeparator(msg.created_at) : null;
      const next = arr[idx + 1];
      const groupedWithNext = !!next
        && !next.is_system && !msg.is_system
        && next.sender_id === msg.sender_id
        && new Date(next.created_at).getTime() - new Date(msg.created_at).getTime() < 2 * 60 * 1000;
      return { msg, showDate, groupedWithNext };
    });
  }, [messages]);

  const handleStartReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const selectConv = (id: string) => {
    setSelectedId(id);
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

          <div className="flex-1 overflow-hidden">
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
              <Virtuoso
                data={filteredConvs}
                style={{ height: "100%" }}
                itemContent={(_, conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    isActive={conv.id === selectedId}
                    onClick={() => selectConv(conv.id)}
                  />
                )}
              />
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
              <ChatHeader conv={selectedConv} onBack={goBack} isTyping={isAnyoneTyping} />

              <ChatSafetyAlert
                otherUserVerified={(selectedConv.otherUser as any).is_verified}
                otherUserTrustScore={(selectedConv.otherUser as any).trust_score}
                isNewConversation={!messages || messages.length <= 2}
              />

              {/* Virtualized messages */}
              <div className="flex-1 min-h-0 relative">
                {isFetchingNextPage && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1 border border-border/50 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                {prepared.length > 0 ? (
                  <Virtuoso
                    ref={virtuosoRef}
                    data={prepared}
                    firstItemIndex={firstItemIndexRef.current}
                    initialTopMostItemIndex={prepared.length - 1}
                    startReached={handleStartReached}
                    followOutput={(isAtBottom) => (isAtBottom ? "smooth" : false)}
                    atBottomStateChange={(at) => { atBottomRef.current = at; }}
                    increaseViewportBy={{ top: 600, bottom: 600 }}
                    className="px-4 md:px-6 py-3"
                    itemContent={(_, item) => (
                      <MessageBubble
                        msg={item.msg}
                        isMine={item.msg.sender_id === user?.id}
                        showDate={item.showDate}
                        groupedWithNext={item.groupedWithNext}
                        otherLastReadAt={selectedConv.otherLastReadAt}
                      />
                    )}
                  />
                ) : (
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

              <ChatInput
                conversationId={selectedConv.id}
                prefillText={aiText}
                onPrefillUsed={() => setAiText("")}
                otherUserId={selectedConv.otherUser.user_id}
                onTyping={notifyTyping}
                onStopTyping={stopTyping}
              />

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
