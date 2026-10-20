import { describe, expect, it } from "vitest";
import { chronological, reconcileMessage, prependedCount } from "./message-history";
const message = (id: string, created_at = id) => ({ id, created_at });
describe("message history reconciliation", () => {
  it("adds incoming messages to newest page, not oldest", () => {
    const result = reconcileMessage({ pages: [[message("3")], [message("1")]], pageParams: [null, "cursor"] }, message("4"));
    expect(result.pages.map(p => p.map(m => m.id))).toEqual([["3", "4"], ["1"]]);
  });
  it("reconciles server response after realtime without duplicates", () => {
    const result = reconcileMessage({ pages: [[message("optimistic-a"), message("4")]], pageParams: [null] }, message("4"), "optimistic-a");
    expect(result.pages[0].map(m => m.id)).toEqual(["4"]);
  });
  it("orders and deduplicates overlapping pages", () => {
    expect(chronological([message("3"), message("1"), message("3")]).map(m => m.id)).toEqual(["1", "3"]);
  });
  it("does not treat appended messages as prepended history", () => {
    expect(prependedCount("2", [message("2"), message("3"), message("4")])).toBe(0);
    expect(prependedCount("2", [message("0"), message("1"), message("2"), message("4")])).toBe(2);
  });
});