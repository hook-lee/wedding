// "home" is always the first bottom tab. "more" is an auto-appended
// catch-all — it only shows when some enabled content didn't make the
// couple's chosen primary set, and its own sub-nav lists whatever's left.
export type PrimaryKey =
  | "story"
  | "gallery"
  | "guestbook"
  | "venue"
  | "rsvp"
  | "account"
  | "profile";
export type TabKey = "home" | PrimaryKey | "more";

export const PRIMARY_KEYS: PrimaryKey[] = [
  "story",
  "gallery",
  "guestbook",
  "venue",
  "rsvp",
  "account",
  "profile",
];

// Bottom bar has 5 physical slots: home + up to this many primary picks + more.
export const MAX_PRIMARY_TABS = 3;

// Icon names map to lib/icons via the Icon component used in TabBar.
export const TAB_LABELS: Record<TabKey, { iconName: string; label: string }> = {
  home: { iconName: "home", label: "홈" },
  story: { iconName: "book", label: "스토리" },
  gallery: { iconName: "image", label: "사진첩" },
  guestbook: { iconName: "chat", label: "방명록" },
  venue: { iconName: "pin", label: "오시는길" },
  rsvp: { iconName: "clipboard", label: "RSVP" },
  account: { iconName: "heart", label: "마음전하기" },
  profile: { iconName: "user", label: "프로필" },
  more: { iconName: "more", label: "더보기" },
};

/** Which primary-tab candidates this site actually has content for. 오시는길 is always on. */
export function enabledPrimaryKeys(sectionsEnabled: Record<string, boolean>): PrimaryKey[] {
  const keys: PrimaryKey[] = ["venue"];
  if (sectionsEnabled.story) keys.push("story");
  if (sectionsEnabled.gallery) keys.push("gallery");
  if (sectionsEnabled.guestbook) keys.push("guestbook");
  if (sectionsEnabled.rsvp) keys.push("rsvp");
  if (sectionsEnabled.account) keys.push("account");
  if (sectionsEnabled.profile) keys.push("profile");
  return keys;
}

/**
 * Resolve the couple's chosen primary-tab set against what's actually
 * enabled: drops unknown/disabled/duplicate keys, caps at MAX_PRIMARY_TABS.
 *
 * `saved === undefined` means "never customized" — falls back to the
 * pre-this-feature default (story/gallery/guestbook) so existing sites see
 * no change until they actively touch the picker. A saved *empty* array is
 * a deliberate choice (admin unchecked everything) and is respected as-is
 * — 더보기 still catches anything enabled, so nothing becomes unreachable.
 */
export function resolvePrimaryTabs(
  saved: string[] | undefined,
  enabled: PrimaryKey[],
): PrimaryKey[] {
  if (saved === undefined) {
    const legacyDefault: PrimaryKey[] = ["story", "gallery", "guestbook"];
    return legacyDefault.filter((k) => enabled.includes(k)).slice(0, MAX_PRIMARY_TABS);
  }
  const valid = saved.filter(
    (k): k is PrimaryKey => (PRIMARY_KEYS as string[]).includes(k) && enabled.includes(k as PrimaryKey),
  );
  return valid.filter((k, i, arr) => arr.indexOf(k) === i).slice(0, MAX_PRIMARY_TABS);
}

export function visibleTabs(
  sectionsEnabled: Record<string, boolean>,
  savedPrimaryTabs: string[] | undefined,
): { tabs: TabKey[]; moreItems: PrimaryKey[] } {
  const enabled = enabledPrimaryKeys(sectionsEnabled);
  const primary = resolvePrimaryTabs(savedPrimaryTabs, enabled);
  const moreItems = enabled.filter((k) => !primary.includes(k));
  const tabs: TabKey[] = ["home", ...primary];
  if (moreItems.length > 0) tabs.push("more");
  return { tabs, moreItems };
}
