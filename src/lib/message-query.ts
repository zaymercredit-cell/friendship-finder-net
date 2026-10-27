import { supabase } from "@/integrations/supabase/client";
import type { HistoryMessage } from "@/lib/message-history";

export interface MessageCursor { created_at: string; id: string }
export const MESSAGE_PAGE_SIZE = 30;

export function nextMessageCursor<T extends HistoryMessage>(page: T[]): MessageCursor | undefined {
  if (page.length < MESSAGE_PAGE_SIZE) return undefined;
  const first = page.find(message => !message.id.startsWith("optimistic-"));
  return first ? { created_at: first.created_at, id: first.id } : undefined;
}

export async function fetchMessagePage(conversationId: string, cursor: MessageCursor | null, signal?: AbortSignal) {
  let request = supabase.from("messages").select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(MESSAGE_PAGE_SIZE);
  if (cursor) {
    request = request.or(`created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`);
  }
  if (signal) request = request.abortSignal(signal);
  const { data, error } = await request;
  if (error) throw error;
  return (data || []).reverse();
}