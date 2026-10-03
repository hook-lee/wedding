import { describe, it, expect } from "vitest";
import { parseAdminFormFields } from "./parse-form";
import { readExtras, resolvePopup } from "@/lib/extras/types";

/** The admin form always posts these; the popup fields ride along with them. */
function formWith(fields: Record<string, string>): FormData {
  const fd = new FormData();
  fd.set("slug", "test-site");
  fd.set("groom_name", "신랑");
  fd.set("bride_name", "신부");
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

function popupFrom(fd: FormData) {
  return resolvePopup(readExtras(parseAdminFormFields(fd).extras));
}

describe("admin form → popup settings", () => {
  it("saves a parking notice with a link button", () => {
    const p = popupFrom(
      formWith({
        popup_enabled: "on",
        popup_title: "주차 안내",
        popup_body: "지하주차장을 이용해주세요.",
        popup_image_url: "https://example.com/map.jpg",
        popup_action: "link",
        popup_link_target: "info",
        popup_link_label: "길 보기",
      }),
    );
    expect(p).toMatchObject({
      enabled: true,
      title: "주차 안내",
      body: "지하주차장을 이용해주세요.",
      image_url: "https://example.com/map.jpg",
      action: "link",
      link_target: "info",
      link_label: "길 보기",
    });
  });

  it("treats an unchecked switch as off", () => {
    expect(popupFrom(formWith({ popup_title: "주차 안내" })).enabled).toBe(false);
  });

  it("falls back to safe values when the selects carry junk", () => {
    const p = popupFrom(
      formWith({ popup_enabled: "on", popup_action: "drop table", popup_link_target: "../etc" }),
    );
    expect(p.action).toBe("none");
    expect(p.link_target).toBe("info");
  });

  it("writes a popup object, so the legacy RSVP flag stops being consulted", () => {
    const extras = readExtras(parseAdminFormFields(formWith({ popup_enabled: "on" })).extras);
    expect(extras.popup).toBeDefined();
    expect(extras.rsvp_prompt_enabled).toBeUndefined();
  });
});

describe("popup video", () => {
  it("stores only the id from any YouTube URL shape", () => {
    for (const url of [
      "https://youtu.be/dQw4w9WgXcQ",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "dQw4w9WgXcQ",
    ]) {
      expect(popupFrom(formWith({ popup_enabled: "on", popup_video_url: url })).video_id).toBe(
        "dQw4w9WgXcQ",
      );
    }
  });

  it("stays empty when the field is blank or not a YouTube link", () => {
    expect(popupFrom(formWith({ popup_video_url: "" })).video_id).toBe("");
    expect(popupFrom(formWith({ popup_video_url: "https://vimeo.com/123" })).video_id).toBe("");
  });

  it("counts a video-only popup as having content", async () => {
    const { hasPopupContent } = await import("@/lib/extras/types");
    const p = popupFrom(formWith({ popup_enabled: "on", popup_video_url: "https://youtu.be/dQw4w9WgXcQ" }));
    expect(hasPopupContent(p)).toBe(true);
  });
});
