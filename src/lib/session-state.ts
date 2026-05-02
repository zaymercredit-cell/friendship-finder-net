import { useEffect, useRef, useState } from "react";

/**
 * useSessionState — persist UI state (filters, scroll, etc.) across in-app
 * navigation via sessionStorage. Survives back/forward navigation, cleared on
 * tab close. Lightweight: write debounced to next microtask, read once.
 */
export function useSessionState<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const storageKey = `vd:state:${key}`;
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw == null) return initial;
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  });

  const writeRef = useRef<number | null>(null);
  useEffect(() => {
    if (writeRef.current != null) cancelAnimationFrame(writeRef.current);
    writeRef.current = requestAnimationFrame(() => {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(value));
      } catch {
        /* quota / serialization — ignore */
      }
    });
    return () => {
      if (writeRef.current != null) cancelAnimationFrame(writeRef.current);
    };
  }, [storageKey, value]);

  return [value, setValue];
}

/** Read once and forget — useful for restoring scroll on mount. */
export function readSessionState<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(`vd:state:${key}`);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeSessionState<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`vd:state:${key}`, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}
