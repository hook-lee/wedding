import { describe, it, expect } from "vitest";
import { resolvePopup, hasPopupContent } from "./types";

describe("resolvePopup — migrating the old RSVP prompt", () => {
  it("keeps a live RSVP popup alive for sites saved before popups were configurable", () => {
    // The production site's state at migration time: no `popup`, prompt on.
    const p = resolvePopup({ rsvp_prompt_enabled: true });
    expect(p.enabled).toBe(true);
    expect(p.action).toBe("rsvp");
    expect(p.title).toBe("참석 의사 전달");
    expect(hasPopupContent(p)).toBe(true);
  });

  it("stays off when the old prompt was off", () => {
    expect(resolvePopup({ rsvp_prompt_enabled: false }).enabled).toBe(false);
    expect(resolvePopup({}).enabled).toBe(false);
  });

  it("stops consulting the legacy flag once a popup has been saved", () => {
    const p = resolvePopup({
      rsvp_prompt_enabled: true,
      popup: { enabled: false },
    });
    expect(p.enabled).toBe(false);
    expect(p.action).toBe("none");
  });

  it("reads a configured popup back as saved", () => {
    const p = resolvePopup({
      popup: {
        enabled: true,
        title: "주차 안내",
        body: "지하주차장을 이용해주세요.",
        action: "link",
        link_target: "info",
      },
    });
    expect(p).toMatchObject({
      enabled: true,
      title: "주차 안내",
      action: "link",
      link_target: "info",
    });
  });
});

describe("hasPopupContent", () => {
  it("treats an enabled but empty popup as nothing to show", () => {
    expect(hasPopupContent(resolvePopup({ popup: { enabled: true } }))).toBe(false);
  });
  it("counts an image-only popup as content", () => {
    expect(
      hasPopupContent(resolvePopup({ popup: { enabled: true, image_url: "https://x/y.jpg" } })),
    ).toBe(true);
  });
  it("ignores whitespace-only text", () => {
    expect(
      hasPopupContent(resolvePopup({ popup: { enabled: true, title: "   ", body: "\n" } })),
    ).toBe(false);
  });
});
