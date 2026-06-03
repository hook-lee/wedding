export type TabKey = "home" | "story" | "gallery" | "guestbook" | "info";

export const TAB_LABELS: Record<TabKey, { icon: string; label: string }> = {
  home: { icon: "🏠", label: "홈" },
  story: { icon: "📖", label: "스토리" },
  gallery: { icon: "📷", label: "사진첩" },
  guestbook: { icon: "💬", label: "일촌평" },
  info: { icon: "📍", label: "더보기" },
};

// info(오시는길) is required (always shown). Others are gated by sections_enabled.
export function visibleTabs(sectionsEnabled: Record<string, boolean>): TabKey[] {
  const tabs: TabKey[] = ["home"];
  if (sectionsEnabled.story) tabs.push("story");
  if (sectionsEnabled.gallery) tabs.push("gallery");
  if (sectionsEnabled.guestbook) tabs.push("guestbook");
  tabs.push("info");
  return tabs;
}
