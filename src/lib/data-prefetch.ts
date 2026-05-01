import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { prefetchRoute } from "@/lib/route-prefetch";

/**
 * Predictive data prefetch.
 * Call on hover/focus/touchstart of user/conversation links.
 *
 * Strategy:
 *  1. warm the JS chunk via prefetchRoute()
 *  2. populate react-query cache with profile/conversation data so the
 *     destination page renders instantly from cache (stale-while-revalidate
 *     handles freshness in the background).
 *
 * Idle-priority + per-key dedup keeps cost negligible.
 */

const inflight = new Set<string>();

function scheduleIdle(fn: () => void) {
  if (typeof (window as any).requestIdleCallback === "function") {
    (window as any).requestIdleCallback(fn, { timeout: 400 });
  } else {
    setTimeout(fn, 0);
  }
}

export function prefetchProfile(qc: QueryClient, username: string) {
  if (!username) return;
  prefetchRoute(`/profile/${username}`);
  const key = `profile:${username}`;
  if (inflight.has(key)) return;
  inflight.add(key);
  scheduleIdle(async () => {
    try {
      await qc.prefetchQuery({
        queryKey: ["profile", username],
        queryFn: async () => {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("username", username)
            .maybeSingle();
          return data;
        },
        staleTime: 60_000,
      });
    } catch {
      /* swallow — prefetch is best-effort */
    } finally {
      // Allow refresh after 30s.
      setTimeout(() => inflight.delete(key), 30_000);
    }
  });
}

export function prefetchConversation(qc: QueryClient, conversationId: string) {
  if (!conversationId) return;
  prefetchRoute(`/messages/${conversationId}`);
  const key = `conv:${conversationId}`;
  if (inflight.has(key)) return;
  inflight.add(key);
  scheduleIdle(async () => {
    try {
      await qc.prefetchInfiniteQuery({
        queryKey: ["messages", conversationId],
        queryFn: async () => {
          const { data } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: false })
            .range(0, 29);
          return ((data || []) as any[]).reverse();
        },
        initialPageParam: 0,
        getNextPageParam: () => undefined,
        staleTime: 30_000,
      });
    } catch {
      /* swallow */
    } finally {
      setTimeout(() => inflight.delete(key), 30_000);
    }
  });
}
