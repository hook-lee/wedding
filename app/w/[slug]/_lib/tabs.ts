export type TabKey = "home" | "story" | "gallery" | "guestbook" | "info";

// Icon names map to lib/icons via the Icon component used in TabBar.
export const TAB_LABELS: Record<TabKey, { iconName: string; label: string }> = {
  home: { iconName: "home", label: "홈" },
  story: { iconName: "book", label: "스토리" },
  gallery: { iconName: "image", label: "사진첩" },
  guestbook: { iconName: "chat", label: "일촌평" },
  info: { iconName: "pin", label: "더보기" },
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
