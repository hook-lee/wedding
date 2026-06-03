import { describe, it, expect } from "vitest";
import { daysUntil } from "./dday";

describe("daysUntil", () => {
  it("returns positive count for future date", () => {
    const future = new Date(Date.now() + 5 * 86400_000);
    expect(daysUntil(future.toISOString())).toBe(5);
  });
  it("returns 0 on the same day", () => {
    expect(daysUntil(new Date().toISOString())).toBe(0);
  });
  it("returns negative for past", () => {
    const past = new Date(Date.now() - 3 * 86400_000);
    expect(daysUntil(past.toISOString())).toBe(-3);
  });
});
