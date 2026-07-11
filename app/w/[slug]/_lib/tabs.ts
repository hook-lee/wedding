export type TabKey = "home" | "story" | "gallery" | "guestbook" | "info";

export const TAB_KEYS: TabKey[] = ["home", "story", "gallery", "guestbook", "info"];

// Icon names map to lib/icons via the Icon component used in TabBar.
export const TAB_LABELS: Record<TabKey, { iconName: string; label: string }> = {
  home: { iconName: "home", label: "홈" },
  story: { iconName: "book", label: "스토리" },
  gallery: { iconName: "image", label: "사진첩" },
  guestbook: { iconName: "chat", label: "일촌평" },
  info: { iconName: "pin", label: "더보기" },
};

/**
 * Full, valid tab order: starts from the saved order (if any), drops
 * unknown/duplicate keys, then appends any canonical keys missing from it —
 * same pattern as resolveSectionOrder, so a partial/stale save never
 * produces a broken tab bar.
 */
export function resolveTabOrder(saved: string[] | undefined): TabKey[] {
  const valid = (saved ?? []).filter((k): k is TabKey =>
    (TAB_KEYS as string[]).includes(k),
  );
  const deduped = valid.filter((k, i, arr) => arr.indexOf(k) === i);
  const missing = TAB_KEYS.filter((k) => !deduped.includes(k));
  return [...deduped, ...missing];
}

// info(오시는길) is required (always shown). Others are gated by sections_enabled.
// tabOrder (from admin drag-reorder) controls left-to-right placement.
export function visibleTabs(
  sectionsEnabled: Record<string, boolean>,
  tabOrder?: string[],
): TabKey[] {
  const enabled = new Set<TabKey>(["home", "info"]);
  if (sectionsEnabled.story) enabled.add("story");
  if (sectionsEnabled.gallery) enabled.add("gallery");
  if (sectionsEnabled.guestbook) enabled.add("guestbook");
  return resolveTabOrder(tabOrder).filter((k) => enabled.has(k));
}
