import { describe, it, expect } from "vitest";
import { resolveSectionOrder, SECTION_KEYS } from "./types";

describe("resolveSectionOrder", () => {
  it("falls back to the canonical order when nothing is saved", () => {
    expect(resolveSectionOrder({})).toEqual([...SECTION_KEYS]);
  });

  it("keeps the couple's saved order", () => {
    const saved = [...SECTION_KEYS].reverse();
    expect(resolveSectionOrder({ section_order: saved })).toEqual(saved);
  });

  it("inserts a section added later next to its canonical neighbour, not at the end", () => {
    // The live site's saved order, from before 인스타그램 existed. Appending
    // would bury it under 스폰서/사진공유; it belongs right after 방명록.
    const saved = [
      "calendar", "profile", "story", "info", "extras_info",
      "rsvp", "account", "gallery", "guestbook", "sponsor", "photo_share",
    ] as const;
    const out = resolveSectionOrder({ section_order: [...saved] });
    expect(out[out.indexOf("guestbook") + 1]).toBe("instagram");
    expect(out).toHaveLength(SECTION_KEYS.length);
  });

  it("drops duplicates in a saved order", () => {
    const out = resolveSectionOrder({ section_order: ["story", "story", "calendar"] });
    expect(out.filter((k) => k === "story")).toHaveLength(1);
  });
});
