import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { nextMessageCursor } from "./message-query";

describe("history cursor", () => {
  it("uses the oldest persisted message as a stable boundary after live inserts", () => {
    const page = Array.from({ length: 30 }, (_, i) => ({ id: `id-${i}`, created_at: `2026-10-24T00:00:${String(i).padStart(2, "0")}Z` }));
    const boundary = { id: "id-0", created_at: "2026-10-24T00:00:00Z" };
    expect(nextMessageCursor(page)).toEqual(boundary);
    expect(nextMessageCursor([...page, { id: "incoming", created_at: "2026-10-24T00:01:00Z" }])).toEqual(boundary);
  });
  it("ends history when fewer than 30 messages are returned", () => {
    expect(nextMessageCursor(Array.from({ length: 29 }, (_, i) => ({ id: String(i), created_at: "2026-10-24" })))).toBeUndefined();
  });
});