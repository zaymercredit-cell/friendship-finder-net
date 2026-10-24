import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useCallback } from "react";
import { chronological, reconcileMessage, type MessagePages } from "@/lib/message-history";

export interface ConversationListItem {
  id: string;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  otherUser: {
    user_id: string;
    first_name: string;
    last_name: string;
    username: string | null;
    avatar_url: string | null;
    is_online: boolean | null;
  };
  unreadCount: number;
  lastReadAt: string | null;
  /** When the OTHER participant last read the conversation — drives "прочитано" ticks. */
  otherLastReadAt: string | null;
}

export interface MessageItem {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string | null;
  media_url: string | null;
  media_type: string | null;
  is_system: boolean;
  created_at: string;
  read_at: string | null;
}

const MESSAGES_PAGE_SIZE = 30;

export function useConversationList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: participants, error: pError } = await supabase
        .from("conversation_participants")
        .select("conversation_id, last_read_at")
        .eq("user_id", user.id)
        .is("hidden_at", null);

      if (pError) throw pError;
      if (!participants?.length) return [];

      const convIds = participants.map(p => p.conversation_id);
      const lastReadMap = new Map(participants.map(p => [p.conversation_id, p.last_read_at]));

      const { data: convos, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .in("id", convIds)
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (convError) throw convError;
      if (!convos?.length) return [];

      const { data: allParticipants, error: participantsError } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id, last_read_at")
        .in("conversation_id", convIds)
        .neq("user_id", user.id);
      if (participantsError) throw participantsError;

      const otherUserIds = [...new Set((allParticipants || []).map(p => p.user_id))];
      const otherUserMap = new Map((allParticipants || []).map(p => [p.conversation_id, p.user_id]));
      const otherLastReadMap = new Map((allParticipants || []).map(p => [p.conversation_id, p.last_read_at]));

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, username, avatar_url, is_online")
        .in("user_id", otherUserIds);
      if (profilesError) throw profilesError;

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      // Exact counts must not be truncated by a global message limit.
      const unreadMap = new Map<string, number>();
      await Promise.all(participants.map(async participant => {
        const { count, error } = await supabase.from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", participant.conversation_id)
          .neq("sender_id", user.id)
          .gt("created_at", participant.last_read_at || "1970-01-01T00:00:00Z");
        if (error) throw error;
        unreadMap.set(participant.conversation_id, count || 0);
      }));

      const results: ConversationListItem[] = [];
      for (const conv of convos) {
        const otherUserId = otherUserMap.get(conv.id);
        if (!otherUserId) continue;
        const profile = profileMap.get(otherUserId);
        if (!profile) continue;
        results.push({
          id: conv.id,
          lastMessageText: conv.last_message_text,
          lastMessageAt: conv.last_message_at,
          otherUser: profile,
          unreadCount: unreadMap.get(conv.id) || 0,
          lastReadAt: lastReadMap.get(conv.id),
          otherLastReadAt: otherLastReadMap.get(conv.id) ?? null,
        });
      }

      return results;
    },
    enabled: !!user,
    staleTime: 30_000,
    refetchInterval: 30000,
  });

  // Realtime subscription — both messages (new/last text) and read receipts.
  useEffect(() => {
    if (!user) return;
    const channelName = `conv-list-${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["conversations", user.id] });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "conversation_participants" },
        () => {
          // Other party read the chat — refresh ticks.
          queryClient.invalidateQueries({ queryKey: ["conversations", user.id] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return query;
}

export function useMessages(conversationId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      if (!conversationId) return [];
      const from = pageParam * MESSAGES_PAGE_SIZE;
      const to = from + MESSAGES_PAGE_SIZE - 1;
      
      // We fetch in descending order then reverse for display
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      
      return ((data || []) as MessageItem[]).reverse();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < MESSAGES_PAGE_SIZE) return undefined;
      return allPages.length;
    },
    enabled: !!conversationId,
    staleTime: 60_000,
    select: (data) => {
      // Flatten pages in chronological order: oldest pages first
      const allPages = [...data.pages].reverse();
      return {
        ...data,
        flat: chronological(allPages.flat()),
      };
    },
  });

  // Mark messages as read
  useEffect(() => {
    if (!conversationId || !user || !query.isSuccess || query.isFetching) return;
    const latestReceived = query.data?.flat.filter(m => m.sender_id !== user.id && !m.id.startsWith("optimistic-")).at(-1);
    if (!latestReceived) return;
    const markRead = () => {
      if (document.visibilityState !== "visible") return;
      supabase
      .from("conversation_participants")
      .update({ last_read_at: latestReceived.created_at })
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)
      .or(`last_read_at.is.null,last_read_at.lt.${latestReceived.created_at}`)
      .then(({ error }) => {
        if (!error) queryClient.invalidateQueries({ queryKey: ["conversations", user.id] });
      });
    };
    markRead();
    document.addEventListener("visibilitychange", markRead);
    return () => document.removeEventListener("visibilitychange", markRead);
  }, [conversationId, user, query.isSuccess, query.isFetching, query.data, queryClient]);

  // Realtime for this conversation
  useEffect(() => {
    if (!conversationId) return;
    const channelName = `messages-${conversationId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        queryClient.setQueryData(["messages", conversationId], (old: any) => {
          if (!old) return old;
          const newMsg = payload.new as MessageItem;
          // Only the mutation response owns optimistic reconciliation; matching by
          // text could consume a different, concurrent identical send.
          return reconcileMessage(old, newMsg);
        });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      })
      .subscribe(status => {
        if (status === "SUBSCRIBED") queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      });
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, queryClient]);

  return {
    data: query.data?.flat || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}

export function useSendMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, text, mediaUrl }: { conversationId: string; text?: string; mediaUrl?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          text: text || null,
          media_url: mediaUrl || null,
          media_type: mediaUrl ? "image" : null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    // Optimistic update — message appears in chat instantly, before network roundtrip.
    onMutate: async ({ conversationId, text, mediaUrl }) => {
      if (!user) return;
      await queryClient.cancelQueries({ queryKey: ["messages", conversationId] });
      const tempId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const optimisticMsg: MessageItem = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: user.id,
        text: text || null,
        media_url: mediaUrl || null,
        media_type: mediaUrl ? "image" : null,
        is_system: false,
        created_at: new Date().toISOString(),
        read_at: null,
      };
      queryClient.setQueryData(["messages", conversationId], (old: any) => {
        return reconcileMessage(old, optimisticMsg);
      });
      return { tempId };
    },
    onError: (_err, vars, ctx) => {
      queryClient.setQueryData<MessagePages<MessageItem>>(["messages", vars.conversationId], old => old && ({
        ...old, pages: old.pages.map(page => page.filter(m => m.id !== ctx?.tempId)),
      }));
    },
    onSuccess: (data, vars, ctx) => {
      // Replace optimistic msg with the real one (same id from realtime might also arrive).
      queryClient.setQueryData(["messages", vars.conversationId], (old: any) => {
        return reconcileMessage(old, data as MessageItem, ctx?.tempId);
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (otherUserId: string) => {
      const { data, error } = await supabase.rpc("find_or_create_conversation", {
        other_user_id: otherUserId,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useTotalUnread() {
  const { data: conversations } = useConversationList();
  return (conversations || []).reduce((sum, c) => sum + c.unreadCount, 0);
}
