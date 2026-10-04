import { describe, it, expect } from "vitest";
import { extractYouTubeVideoId, isUnreadableYouTubeInput } from "./parse-url";

describe("extractYouTubeVideoId", () => {
  it("parses standard watch URL", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("parses youtu.be short URL", () => {
    expect(extractYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("parses embed URL", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("parses URL with extra query params", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s")).toBe("dQw4w9WgXcQ");
  });
  it("accepts bare 11-char ID", () => {
    expect(extractYouTubeVideoId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("returns null for invalid input", () => {
    expect(extractYouTubeVideoId("")).toBeNull();
    expect(extractYouTubeVideoId("not a url")).toBeNull();
    expect(extractYouTubeVideoId("https://example.com")).toBeNull();
  });
});

describe("share-sheet URL shapes", () => {
  const ID = "dQw4w9WgXcQ";
  it("reads a Shorts link, which is what the mobile app shares", () => {
    expect(extractYouTubeVideoId(`https://www.youtube.com/shorts/${ID}`)).toBe(ID);
    expect(extractYouTubeVideoId(`https://youtube.com/shorts/${ID}?feature=share`)).toBe(ID);
  });
  it("reads a /live/ link", () => {
    expect(extractYouTubeVideoId(`https://www.youtube.com/live/${ID}`)).toBe(ID);
  });
  it("still reads the older shapes", () => {
    for (const u of [
      `https://youtu.be/${ID}`,
      `https://youtu.be/${ID}?si=AbCdEfGhIjKl`,
      `https://www.youtube.com/watch?v=${ID}`,
      `https://m.youtube.com/watch?v=${ID}`,
      `https://www.youtube.com/embed/${ID}`,
      ID,
    ]) {
      expect(extractYouTubeVideoId(u)).toBe(ID);
    }
  });
});

describe("isUnreadableYouTubeInput", () => {
  it("is false for an empty field — nothing to complain about", () => {
    expect(isUnreadableYouTubeInput("")).toBe(false);
    expect(isUnreadableYouTubeInput("   ")).toBe(false);
  });
  it("is true for a link we cannot turn into an id, so the save stops", () => {
    expect(isUnreadableYouTubeInput("https://vimeo.com/123456")).toBe(true);
    expect(isUnreadableYouTubeInput("https://www.youtube.com/@somechannel")).toBe(true);
  });
  it("is false for anything we can read", () => {
    expect(isUnreadableYouTubeInput("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(false);
  });
});
