/**
 * Site extras — opt-in content blocks (transit, parking notes, info items,
 * flower-decline notice) stored as a single jsonb column. Centralizing the
 * shape here lets server actions, admin UI, and the public site agree.
 */

export type InfoItem = { title: string; body: string };

// Every section that can appear below the fixed hero (names/date/greeting/
// parents — that block never moves). Order here is the default/fallback.
export const SECTION_KEYS = [
  "calendar",
  "story",
  "gallery",
  "guestbook",
  "info",
  "extras_info",
  "rsvp",
  "account",
  "profile",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

// Which optional RSVP questions this site asks guests. All default to off —
// existing sites keep the original 5-field form until the couple opts in.
export type RsvpFields = { meal?: boolean; side?: boolean; parking?: boolean };

export type SiteExtras = {
  transit_subway?: string;
  transit_bus?: string;
  parking_notes?: string;
  info_items?: InfoItem[];
  flower_decline?: boolean;
  flower_decline_note?: string;
  share_title_suffix?: string;
  section_order?: SectionKey[];
  rsvp_fields?: RsvpFields;
};

const DEFAULT_DECLINE_NOTE = "화환은 정중히 사양하겠습니다.";
const DEFAULT_SHARE_TITLE_SUFFIX = "결혼합니다";

export function readExtras(raw: unknown): SiteExtras {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const obj = raw as Record<string, unknown>;
  const items = Array.isArray(obj.info_items)
    ? (obj.info_items as unknown[])
        .map((it) => {
          if (!it || typeof it !== "object") return null;
          const r = it as Record<string, unknown>;
          const title = typeof r.title === "string" ? r.title.trim() : "";
          const body = typeof r.body === "string" ? r.body.trim() : "";
          if (!title && !body) return null;
          return { title, body } as InfoItem;
        })
        .filter((x): x is InfoItem => x !== null)
    : undefined;

  return {
    transit_subway:
      typeof obj.transit_subway === "string" ? obj.transit_subway : undefined,
    transit_bus:
      typeof obj.transit_bus === "string" ? obj.transit_bus : undefined,
    parking_notes:
      typeof obj.parking_notes === "string" ? obj.parking_notes : undefined,
    info_items: items,
    flower_decline:
      typeof obj.flower_decline === "boolean" ? obj.flower_decline : undefined,
    flower_decline_note:
      typeof obj.flower_decline_note === "string"
        ? obj.flower_decline_note
        : undefined,
    share_title_suffix:
      typeof obj.share_title_suffix === "string" ? obj.share_title_suffix : undefined,
    section_order: Array.isArray(obj.section_order)
      ? (obj.section_order as unknown[]).filter((k): k is SectionKey =>
          (SECTION_KEYS as readonly string[]).includes(String(k)),
        )
      : undefined,
    rsvp_fields:
      obj.rsvp_fields && typeof obj.rsvp_fields === "object" && !Array.isArray(obj.rsvp_fields)
        ? {
            meal: (obj.rsvp_fields as Record<string, unknown>).meal === true,
            side: (obj.rsvp_fields as Record<string, unknown>).side === true,
            parking: (obj.rsvp_fields as Record<string, unknown>).parking === true,
          }
        : undefined,
  };
}

/**
 * Full, valid section order: starts from the saved order (if any), drops
 * unknown keys, then appends any canonical keys missing from it (covers new
 * sections added after a site was first saved, and malformed/partial data).
 */
export function resolveSectionOrder(extras: SiteExtras): SectionKey[] {
  const saved = (extras.section_order ?? []).filter((k, i, arr) => arr.indexOf(k) === i);
  const missing = SECTION_KEYS.filter((k) => !saved.includes(k));
  return [...saved, ...missing];
}

export function flowerDeclineNoteOrDefault(extras: SiteExtras): string {
  const v = (extras.flower_decline_note ?? "").trim();
  return v || DEFAULT_DECLINE_NOTE;
}

export function shareTitleSuffixOrDefault(extras: SiteExtras): string {
  const v = (extras.share_title_suffix ?? "").trim();
  return v || DEFAULT_SHARE_TITLE_SUFFIX;
}
