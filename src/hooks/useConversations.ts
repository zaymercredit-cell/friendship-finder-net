import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useCallback } from "react";

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

      if (pError || !participants?.length) return [];

      const convIds = participants.map(p => p.conversation_id);
      const lastReadMap = new Map(participants.map(p => [p.conversation_id, p.last_read_at]));

      const { data: convos } = await supabase
        .from("conversations")
        .select("*")
        .in("id", convIds)
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (!convos?.length) return [];

      const { data: allParticipants } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .in("conversation_id", convIds)
        .neq("user_id", user.id);

      const otherUserIds = [...new Set((allParticipants || []).map(p => p.user_id))];
      const otherUserMap = new Map((allParticipants || []).map(p => [p.conversation_id, p.user_id]));

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, username, avatar_url, is_online")
        .in("user_id", otherUserIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      const results: ConversationListItem[] = [];
      for (const conv of convos) {
        const otherUserId = otherUserMap.get(conv.id);
        if (!otherUserId) continue;
        const profile = profileMap.get(otherUserId);
        if (!profile) continue;

        const lastRead = lastReadMap.get(conv.id);
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .neq("sender_id", user.id)
          .gt("created_at", lastRead || "1970-01-01");

        results.push({
          id: conv.id,
          lastMessageText: conv.last_message_text,
          lastMessageAt: conv.last_message_at,
          otherUser: profile,
          unreadCount: count || 0,
          lastReadAt: lastRead,
        });
      }

      return results;
    },
    enabled: !!user,
    staleTime: 30_000,
    refetchInterval: 30000,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channelName = `conv-list-${user.id}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "messages",
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["conversations", user.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
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
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .range(from, to);
      
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
        flat: allPages.flat(),
      };
    },
  });

  // Mark messages as read
  useEffect(() => {
    if (!conversationId || !user) return;
    supabase
      .from("conversation_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["conversations", user.id] });
      });
  }, [conversationId, user, query.data?.flat?.length, queryClient]);

  // Realtime for this conversation
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        queryClient.setQueryData(["messages", conversationId], (old: any) => {
          if (!old) return old;
          const newMsg = payload.new as MessageItem;
          // Add to last page
          const pages = [...old.pages];
          const lastPage = [...(pages[pages.length - 1] || [])];
          if (!lastPage.find((m: MessageItem) => m.id === newMsg.id)) {
            lastPage.push(newMsg);
            pages[pages.length - 1] = lastPage;
          }
          return { ...old, pages };
        });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, queryClient]);

  return {
    data: query.data?.flat || [],
    isLoading: query.isLoading,
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
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["messages", vars.conversationId] });
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
