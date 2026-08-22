import { describe, it, expect } from "vitest";
import { normalizeInstagram, instagramLinks } from "./instagram";

describe("normalizeInstagram", () => {
  it("keeps a bare handle as-is", () => {
    expect(normalizeInstagram("our_wedding")).toBe("our_wedding");
  });
  it("strips a leading @", () => {
    expect(normalizeInstagram("@our_wedding")).toBe("our_wedding");
  });
  it("strips a pasted profile URL, with or without www and protocol", () => {
    expect(normalizeInstagram("https://www.instagram.com/our_wedding/")).toBe("our_wedding");
    expect(normalizeInstagram("instagram.com/our_wedding")).toBe("our_wedding");
  });
  it("drops query strings that come along with a shared link", () => {
    expect(normalizeInstagram("https://instagram.com/our_wedding?igshid=abc")).toBe("our_wedding");
  });
  it("returns empty for blank input", () => {
    expect(normalizeInstagram("   ")).toBe("");
  });
});

describe("instagramLinks", () => {
  it("builds an app scheme and a web fallback from any accepted form", () => {
    expect(instagramLinks("@our_wedding")).toEqual({
      app: "instagram://user?username=our_wedding",
      web: "https://www.instagram.com/our_wedding/",
    });
  });
});
