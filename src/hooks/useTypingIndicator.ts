import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Premium typing indicator over Supabase Realtime broadcast channel.
 *  - per-conversation channel
 *  - debounced "start" emits (max 1 / 1.5s)
 *  - explicit "stop" on idle (1.8s without keystrokes)
 *  - auto-clear remote indicator after 4s without refresh
 *  - zero DB writes — pure broadcast (cheap, no RLS impact)
 */
export function useTypingIndicator(conversationId: string | null) {
  const { user } = useAuth();
  const [remoteTyping, setRemoteTyping] = useState<Record<string, number>>({});
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastSentRef = useRef(0);
  const idleTimerRef = useRef<number | null>(null);
  const sweepTimerRef = useRef<number | null>(null);

  // Subscribe to channel
  useEffect(() => {
    if (!conversationId || !user) return;
    const ch = supabase.channel(`typing:${conversationId}`, {
      config: { broadcast: { self: false } },
    });
    ch.on("broadcast", { event: "typing" }, (payload) => {
      const uid = (payload.payload as any)?.userId as string | undefined;
      const action = (payload.payload as any)?.action as "start" | "stop" | undefined;
      if (!uid || uid === user.id) return;
      setRemoteTyping((prev) => {
        const next = { ...prev };
        if (action === "stop") delete next[uid];
        else next[uid] = Date.now();
        return next;
      });
    });
    ch.subscribe();
    channelRef.current = ch;

    // Sweep stale indicators every 1s.
    sweepTimerRef.current = window.setInterval(() => {
      setRemoteTyping((prev) => {
        const now = Date.now();
        let changed = false;
        const next: Record<string, number> = {};
        for (const [k, ts] of Object.entries(prev)) {
          if (now - ts < 4000) next[k] = ts;
          else changed = true;
        }
        return changed ? next : prev;
      });
    }, 1000);

    return () => {
      if (sweepTimerRef.current) clearInterval(sweepTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      supabase.removeChannel(ch);
      channelRef.current = null;
    };
  }, [conversationId, user?.id]);

  const send = useCallback((action: "start" | "stop") => {
    const ch = channelRef.current;
    if (!ch || !user) return;
    ch.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: user.id, action },
    });
  }, [user?.id]);

  /** Call on every keystroke. Debounced internally. */
  const notifyTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastSentRef.current > 1500) {
      lastSentRef.current = now;
      send("start");
    }
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => {
      send("stop");
      lastSentRef.current = 0;
    }, 1800);
  }, [send]);

  /** Force-stop (e.g. on send). */
  const stopTyping = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (lastSentRef.current) {
      send("stop");
      lastSentRef.current = 0;
    }
  }, [send]);

  const isAnyoneTyping = Object.keys(remoteTyping).length > 0;
  return { isAnyoneTyping, notifyTyping, stopTyping };
}
