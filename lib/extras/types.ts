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
  "sponsor",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export type SponsorTitle = "sponsored_by" | "supported_by" | "none";
// scale: relative display size, 50–150 (%), default 100 — logos from
// different companies rarely have consistent internal padding, so a couple
// can nudge one up/down to visually match the rest of the row.
export type SponsorLogo = { url: string; scale?: number };

// Which RSVP questions this site asks guests. 이름 is never included here —
// it's the one field every response needs to be identifiable, so it always
// shows and isn't user-togglable.
export type RsvpFields = {
  attending?: boolean;
  phone?: boolean;
  party_size?: boolean;
  message?: boolean;
  meal?: boolean;
  side?: boolean;
  parking?: boolean;
};

// Which extra questions the guestbook asks a guest, beyond 이름 and 축하
// 메시지 (never included here — those two are what makes an entry an
// entry, so they always show and aren't user-togglable). Mirrors RsvpFields.
export type GuestbookFields = {
  phone?: boolean;
  guest_side?: boolean;
  relationship?: boolean;
};

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
  guestbook_fields?: GuestbookFields;
  // Which content types are pinned to the bottom tab bar (up to
  // MAX_PRIMARY_TABS, from app/w/[slug]/_lib/tabs.ts PRIMARY_KEYS), and in
  // what order. Anything enabled-but-not-chosen falls into the "더보기" tab.
  primary_tabs?: string[];
  // Per-section "show inline on the home scroll" toggle — independent from
  // sections_enabled (which controls whether the section exists at all) and
  // from primary_tabs (which controls bottom-bar shortcuts). Missing key =
  // visible (existing sites are unaffected until they touch this).
  home_visible?: Partial<Record<SectionKey, boolean>>;
  // Show a "참석 의사 전달" prompt modal right after the splash entrance,
  // nudging guests toward the RSVP section. Off by default.
  rsvp_prompt_enabled?: boolean;
  // Sponsor/supporter logo strip — entirely optional, most weddings won't
  // use it (gated by sections_enabled.sponsor, default off).
  sponsor_title?: SponsorTitle;
  sponsor_logos?: SponsorLogo[];
  sponsor_slogan?: string;
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
            attending: (obj.rsvp_fields as Record<string, unknown>).attending === true,
            phone: (obj.rsvp_fields as Record<string, unknown>).phone === true,
            party_size: (obj.rsvp_fields as Record<string, unknown>).party_size === true,
            message: (obj.rsvp_fields as Record<string, unknown>).message === true,
            meal: (obj.rsvp_fields as Record<string, unknown>).meal === true,
            side: (obj.rsvp_fields as Record<string, unknown>).side === true,
            parking: (obj.rsvp_fields as Record<string, unknown>).parking === true,
          }
        : undefined,
    guestbook_fields:
      obj.guestbook_fields &&
      typeof obj.guestbook_fields === "object" &&
      !Array.isArray(obj.guestbook_fields)
        ? {
            phone: (obj.guestbook_fields as Record<string, unknown>).phone === true,
            guest_side: (obj.guestbook_fields as Record<string, unknown>).guest_side === true,
            relationship:
              (obj.guestbook_fields as Record<string, unknown>).relationship === true,
          }
        : undefined,
    primary_tabs: Array.isArray(obj.primary_tabs)
      ? (obj.primary_tabs as unknown[]).map((k) => String(k))
      : undefined,
    home_visible:
      obj.home_visible && typeof obj.home_visible === "object" && !Array.isArray(obj.home_visible)
        ? Object.fromEntries(
            SECTION_KEYS.filter((k) => k in (obj.home_visible as Record<string, unknown>)).map(
              (k) => [k, (obj.home_visible as Record<string, unknown>)[k] === true],
            ),
          )
        : undefined,
    rsvp_prompt_enabled:
      typeof obj.rsvp_prompt_enabled === "boolean" ? obj.rsvp_prompt_enabled : undefined,
    sponsor_title:
      obj.sponsor_title === "sponsored_by" ||
      obj.sponsor_title === "supported_by" ||
      obj.sponsor_title === "none"
        ? obj.sponsor_title
        : undefined,
    // Accepts both the current { url, scale } shape and plain strings from
    // before per-logo sizing existed, so nothing already saved gets dropped.
    sponsor_logos: Array.isArray(obj.sponsor_logos)
      ? (obj.sponsor_logos as unknown[])
          .map((item): SponsorLogo | null => {
            if (typeof item === "string") return { url: item, scale: 100 };
            if (item && typeof item === "object" && typeof (item as Record<string, unknown>).url === "string") {
              const r = item as Record<string, unknown>;
              const scaleRaw = typeof r.scale === "number" ? r.scale : 100;
              return { url: r.url as string, scale: Math.min(150, Math.max(50, scaleRaw)) };
            }
            return null;
          })
          .filter((x): x is SponsorLogo => x !== null)
      : undefined,
    sponsor_slogan:
      typeof obj.sponsor_slogan === "string" ? obj.sponsor_slogan : undefined,
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

/**
 * Fully-resolved RSVP field visibility. Fields that existed before this
 * toggle system was added (attending/phone/party_size/message) default to
 * ON so existing sites' forms don't silently lose fields; the newer
 * meal/side/parking additions default OFF as before.
 */
export function resolveRsvpFields(extras: SiteExtras): Required<RsvpFields> {
  const f = extras.rsvp_fields ?? {};
  return {
    attending: f.attending ?? true,
    phone: f.phone ?? true,
    party_size: f.party_size ?? true,
    message: f.message ?? true,
    meal: f.meal ?? false,
    side: f.side ?? false,
    parking: f.parking ?? false,
  };
}

/**
 * Fully-resolved guestbook field visibility. All three are new additions
 * with no prior default, so — unlike RsvpFields' legacy fields — they all
 * default OFF until a couple opts in.
 */
export function resolveGuestbookFields(extras: SiteExtras): Required<GuestbookFields> {
  const f = extras.guestbook_fields ?? {};
  return {
    phone: f.phone ?? false,
    guest_side: f.guest_side ?? false,
    relationship: f.relationship ?? false,
  };
}

// "profile" defaults to hidden-on-home once a couple can tap a name in the
// hero (ParentsLine) to open that person's profile in a popup instead —
// the standalone section is redundant unless they explicitly turn it back on.
const DEFAULT_HIDDEN_ON_HOME: readonly SectionKey[] = ["profile"];

/** Should this section render inline on the home scroll? Defaults to true, except DEFAULT_HIDDEN_ON_HOME. */
export function isHomeVisible(extras: SiteExtras, key: SectionKey): boolean {
  const saved = extras.home_visible?.[key];
  if (saved !== undefined) return saved;
  return !DEFAULT_HIDDEN_ON_HOME.includes(key);
}

export function flowerDeclineNoteOrDefault(extras: SiteExtras): string {
  const v = (extras.flower_decline_note ?? "").trim();
  return v || DEFAULT_DECLINE_NOTE;
}

export function shareTitleSuffixOrDefault(extras: SiteExtras): string {
  const v = (extras.share_title_suffix ?? "").trim();
  return v || DEFAULT_SHARE_TITLE_SUFFIX;
}

export const SPONSOR_TITLE_LABELS: Record<SponsorTitle, string> = {
  sponsored_by: "Sponsored by",
  supported_by: "Supported by",
  none: "",
};

export function sponsorTitleLabel(extras: SiteExtras): string {
  return SPONSOR_TITLE_LABELS[extras.sponsor_title ?? "sponsored_by"];
}
