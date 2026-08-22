/**
 * Site extras — opt-in content blocks (transit, parking notes, info items,
 * flower-decline notice) stored as a single jsonb column. Centralizing the
 * shape here lets server actions, admin UI, and the public site agree.
 */
import { normalizeInstagram } from "@/lib/social/instagram";

export type InfoItem = { title: string; body: string };

// Every section that can appear below the fixed hero (names/date/greeting/
// parents — that block never moves). Order here is the default/fallback.
export const SECTION_KEYS = [
  "calendar",
  "story",
  "gallery",
  "guestbook",
  "instagram",
  "info",
  "extras_info",
  "rsvp",
  "account",
  "profile",
  "sponsor",
  "photo_share",
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

// Which "캘린더에 저장" buttons show on the calendar card. Both default ON
// (unlike sponsor-style opt-ins) since calendar-save is a mainstream
// expected feature, not a niche add-on.
export type CalendarButtons = {
  google?: boolean;
  ics?: boolean;
};

// Invitation body font. Keys match the [data-font] selectors in globals.css
// and the CSS variables declared in app/fonts.ts.
export const FONT_FAMILIES = [
  "pretendard",
  "nanum-myeongjo",
  "gowun-batang",
  "gowun-dodum",
  "nanum-pen",
] as const;
export type FontFamily = (typeof FONT_FAMILIES)[number];

// Which map apps get a 길찾기 button. Multiple can be on at once — Korean
// guests are split across Naver/Kakao/T맵 with no clear majority, so letting
// the couple offer several beats guessing one.
export const MAP_APPS = ["naver", "kakao", "tmap"] as const;
export type MapApp = (typeof MAP_APPS)[number];
export type MapApps = Partial<Record<MapApp, boolean>>;

// Gallery presentation. "grid" is the original 3-column layout — kept as the
// default so existing sites don't change appearance.
export const GALLERY_STYLES = [
  "grid",
  "swipe",
  "masonry",
  "film",
  "sphere",
  "coverflow",
  "polaroid",
] as const;
export type GalleryStyle = (typeof GALLERY_STYLES)[number];

// Direct 전화/문자 buttons for each side. Numbers live here rather than on
// wedding_sites because they're optional contact info, not core site data.
export type ContactInfo = {
  enabled?: boolean;
  groom_phone?: string;
  bride_phone?: string;
};

/**
 * Day-of photo sharing: guests upload the photos they took at the wedding.
 * `open_at_wedding` keeps the uploader hidden until the ceremony actually
 * starts — the point is candid shots from the day, not pre-wedding uploads.
 */
/**
 * The couple's shared Instagram. `username` is stored as a bare handle
 * (normalizeInstagram strips @ and any pasted URL); an empty one hides the
 * section regardless of `enabled`, since there is nothing to link to.
 */
export type Instagram = {
  enabled?: boolean;
  username?: string;
  note?: string;
};

export type PhotoShare = {
  enabled?: boolean;
  open_at_wedding?: boolean;
  note?: string;
};

/** Hard cap on guest uploads per site — a public endpoint needs a ceiling. */
export const MAX_SHARED_PHOTOS = 300;

// How long before the wedding each calendar reminder fires. "" means that
// reminder slot is turned off. Only used by the .ics button — Google
// Calendar's quick-add URL has no equivalent custom-reminder parameter.
export const CALENDAR_REMINDER_OFFSETS = [
  "",
  "10m",
  "30m",
  "1h",
  "3h",
  "6h",
  "12h",
  "1d",
  "2d",
  "1w",
] as const;
export type CalendarReminderOffset = (typeof CALENDAR_REMINDER_OFFSETS)[number];

export type CalendarReminders = {
  first?: CalendarReminderOffset;
  second?: CalendarReminderOffset;
};

function asReminderOffset(v: unknown): CalendarReminderOffset | undefined {
  return (CALENDAR_REMINDER_OFFSETS as readonly string[]).includes(String(v))
    ? (v as CalendarReminderOffset)
    : undefined;
}

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
  calendar_buttons?: CalendarButtons;
  calendar_reminders?: CalendarReminders;
  font_family?: FontFamily;
  map_apps?: MapApps;
  gallery_style?: GalleryStyle;
  contact?: ContactInfo;
  photo_share?: PhotoShare;
  instagram?: Instagram;
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
    calendar_buttons:
      obj.calendar_buttons &&
      typeof obj.calendar_buttons === "object" &&
      !Array.isArray(obj.calendar_buttons)
        ? {
            google: (obj.calendar_buttons as Record<string, unknown>).google === true,
            ics: (obj.calendar_buttons as Record<string, unknown>).ics === true,
          }
        : undefined,
    calendar_reminders:
      obj.calendar_reminders &&
      typeof obj.calendar_reminders === "object" &&
      !Array.isArray(obj.calendar_reminders)
        ? {
            first: asReminderOffset(
              (obj.calendar_reminders as Record<string, unknown>).first,
            ),
            second: asReminderOffset(
              (obj.calendar_reminders as Record<string, unknown>).second,
            ),
          }
        : undefined,
    font_family: (FONT_FAMILIES as readonly string[]).includes(String(obj.font_family))
      ? (obj.font_family as FontFamily)
      : undefined,
    gallery_style: (GALLERY_STYLES as readonly string[]).includes(String(obj.gallery_style))
      ? (obj.gallery_style as GalleryStyle)
      : undefined,
    map_apps:
      obj.map_apps && typeof obj.map_apps === "object" && !Array.isArray(obj.map_apps)
        ? Object.fromEntries(
            MAP_APPS.filter((k) => k in (obj.map_apps as Record<string, unknown>)).map((k) => [
              k,
              (obj.map_apps as Record<string, unknown>)[k] === true,
            ]),
          )
        : undefined,
    contact:
      obj.contact && typeof obj.contact === "object" && !Array.isArray(obj.contact)
        ? {
            enabled: (obj.contact as Record<string, unknown>).enabled === true,
            groom_phone:
              typeof (obj.contact as Record<string, unknown>).groom_phone === "string"
                ? ((obj.contact as Record<string, unknown>).groom_phone as string)
                : undefined,
            bride_phone:
              typeof (obj.contact as Record<string, unknown>).bride_phone === "string"
                ? ((obj.contact as Record<string, unknown>).bride_phone as string)
                : undefined,
          }
        : undefined,
    photo_share:
      obj.photo_share && typeof obj.photo_share === "object" && !Array.isArray(obj.photo_share)
        ? {
            enabled: (obj.photo_share as Record<string, unknown>).enabled === true,
            open_at_wedding:
              (obj.photo_share as Record<string, unknown>).open_at_wedding === true,
            note:
              typeof (obj.photo_share as Record<string, unknown>).note === "string"
                ? ((obj.photo_share as Record<string, unknown>).note as string)
                : undefined,
          }
        : undefined,
    instagram:
      obj.instagram && typeof obj.instagram === "object" && !Array.isArray(obj.instagram)
        ? {
            enabled: (obj.instagram as Record<string, unknown>).enabled === true,
            username:
              typeof (obj.instagram as Record<string, unknown>).username === "string"
                ? ((obj.instagram as Record<string, unknown>).username as string)
                : undefined,
            note:
              typeof (obj.instagram as Record<string, unknown>).note === "string"
                ? ((obj.instagram as Record<string, unknown>).note as string)
                : undefined,
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
/**
 * Saved order wins, but a section added after the couple last dragged their
 * list still has to land somewhere. Appending to the end puts a new section
 * below everything — usually wrong, since SECTION_KEYS already encodes where
 * it belongs. So each unsaved key is inserted after its nearest canonical
 * predecessor that the couple does have, and only falls back to the end when
 * it has none.
 */
export function resolveSectionOrder(extras: SiteExtras): SectionKey[] {
  const saved = (extras.section_order ?? []).filter((k, i, arr) => arr.indexOf(k) === i);
  if (saved.length === 0) return [...SECTION_KEYS];

  const out = [...saved];
  for (const key of SECTION_KEYS) {
    if (out.includes(key)) continue;
    const canonical = SECTION_KEYS.indexOf(key);
    let at = out.length;
    for (let i = canonical - 1; i >= 0; i--) {
      const pos = out.indexOf(SECTION_KEYS[i]);
      if (pos !== -1) {
        at = pos + 1;
        break;
      }
    }
    out.splice(at, 0, key);
  }
  return out;
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

/**
 * Fully-resolved calendar-button visibility. Both default ON — unlike the
 * guestbook's new fields, these aren't niche additions; a couple has to
 * actively opt OUT rather than opt in.
 */
export function resolveCalendarButtons(extras: SiteExtras): Required<CalendarButtons> {
  const f = extras.calendar_buttons ?? {};
  return {
    google: f.google ?? true,
    ics: f.ics ?? true,
  };
}

/**
 * Fully-resolved calendar reminder offsets. Defaults match what shipped
 * before this was made configurable (하루 전 + 6시간 전), so turning the
 * setting on for the first time doesn't silently remove reminders a couple
 * already has.
 */
export function resolveCalendarReminders(extras: SiteExtras): Required<CalendarReminders> {
  const r = extras.calendar_reminders ?? {};
  return {
    first: r.first ?? "1d",
    second: r.second ?? "6h",
  };
}

/** Body font for the invitation. Defaults to the original Pretendard. */
export function resolveFontFamily(extras: SiteExtras): FontFamily {
  return extras.font_family ?? "pretendard";
}

/** Gallery layout. Defaults to the original 3-column grid. */
export function resolveGalleryStyle(extras: SiteExtras): GalleryStyle {
  return extras.gallery_style ?? "grid";
}

/**
 * Which 길찾기 buttons to show. Defaults to Naver + Kakao — that's what the
 * previous single button already did under the hood (Naver app first, Kakao
 * web fallback), just split into two explicit choices.
 */
export function resolveMapApps(extras: SiteExtras): Required<MapApps> {
  const m = extras.map_apps ?? {};
  return {
    naver: m.naver ?? true,
    kakao: m.kakao ?? true,
    tmap: m.tmap ?? false,
  };
}

/**
 * Photo sharing settings. Off by default; when on, it waits for the ceremony
 * unless the couple explicitly opens it early.
 */
export function resolveInstagram(extras: SiteExtras): Required<Instagram> {
  const i = extras.instagram ?? {};
  return {
    enabled: i.enabled ?? false,
    username: normalizeInstagram(i.username ?? ""),
    note: i.note ?? "",
  };
}

export function resolvePhotoShare(extras: SiteExtras): Required<PhotoShare> {
  const p = extras.photo_share ?? {};
  return {
    enabled: p.enabled ?? false,
    open_at_wedding: p.open_at_wedding ?? true,
    note: p.note ?? "",
  };
}

/**
 * Is the uploader open right now? Gated on the wedding start when the couple
 * chose that. Called on both the server (to reject writes) and the client (to
 * hide the button), so it takes the time as an argument rather than reading
 * the clock itself.
 */
export function isPhotoShareOpen(
  share: Required<PhotoShare>,
  weddingAt: string | null,
  now: Date = new Date(),
): boolean {
  if (!share.enabled) return false;
  if (!share.open_at_wedding || !weddingAt) return true;
  const start = new Date(weddingAt).getTime();
  return Number.isFinite(start) ? now.getTime() >= start : true;
}

/** 전화/문자 buttons. Off by default — phone numbers are opt-in. */
export function resolveContact(extras: SiteExtras): Required<ContactInfo> {
  const c = extras.contact ?? {};
  return {
    enabled: c.enabled ?? false,
    groom_phone: c.groom_phone ?? "",
    bride_phone: c.bride_phone ?? "",
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
