import { kstDateTimeLocalToUtcIso } from "@/lib/date/kst";
import { extractYouTubeVideoId } from "@/lib/youtube/parse-url";
import type { ParentsBlock, ParentStatus } from "@/lib/parents/types";
import { SECTION_KEYS, type InfoItem, type SectionKey, type SiteExtras } from "@/lib/extras/types";
import type { Database, Tables } from "@/lib/supabase/types";

const VALID_THEMES = ["ivory", "sage", "pink", "cobalt", "mocha", "ash"] as const;

function readParentsFromForm(formData: FormData): ParentsBlock {
  const sides = ["groom", "bride"] as const;
  const roles = ["father", "mother"] as const;
  const out: ParentsBlock = {};
  for (const side of sides) {
    for (const role of roles) {
      const name = String(formData.get(`${side}_${role}_name`) ?? "").trim();
      const status = String(formData.get(`${side}_${role}_status`) ?? "alive") as ParentStatus;
      if (name) {
        const key = `${side}_${role}` as keyof ParentsBlock;
        out[key] = { name, status };
      }
    }
  }
  return out;
}

function readAccount(formData: FormData, prefix: string) {
  const bank = String(formData.get(`${prefix}_bank`) ?? "").trim();
  const account = String(formData.get(`${prefix}_account`) ?? "").trim();
  const holder = String(formData.get(`${prefix}_holder`) ?? "").trim();
  if (!bank && !account && !holder) return null;
  return { bank, account, holder };
}

export type ParsedAdminFields = Database["public"]["Tables"]["wedding_sites"]["Update"];

/**
 * Pure field extraction from the admin form's FormData. Shared by the save
 * server action and the live preview pane — keeping one copy guarantees the
 * preview always matches exactly what saving would persist (same reads,
 * same defaults, same JSON parsing).
 *
 * Deliberately excludes anything that needs a DB round-trip (slug
 * availability) or auth context — those stay in the server action.
 */
export function parseAdminFormFields(formData: FormData): ParsedAdminFields {
  const slug = String(formData.get("slug") ?? "").trim();
  const groom_name = String(formData.get("groom_name") ?? "").trim();
  const bride_name = String(formData.get("bride_name") ?? "").trim();
  const wedding_at_raw = String(formData.get("wedding_at") ?? "");
  const name_joiner = String(formData.get("name_joiner") ?? " ♡ ");
  const parents = readParentsFromForm(formData);

  const venue_name = String(formData.get("venue_name") ?? "").trim();
  const venue_address = String(formData.get("venue_address") ?? "").trim();
  const venueLatStr = String(formData.get("venue_lat") ?? "");
  const venueLngStr = String(formData.get("venue_lng") ?? "");
  const venue_lat = venueLatStr ? Number(venueLatStr) : null;
  const venue_lng = venueLngStr ? Number(venueLngStr) : null;

  const parking_name = String(formData.get("parking_name") ?? "").trim();
  const parking_address = String(formData.get("parking_address") ?? "").trim();
  const parkingLatStr = String(formData.get("parking_lat") ?? "");
  const parkingLngStr = String(formData.get("parking_lng") ?? "");
  const parking_lat = parkingLatStr ? Number(parkingLatStr) : null;
  const parking_lng = parkingLngStr ? Number(parkingLngStr) : null;

  const greeting = String(formData.get("greeting") ?? "").trim();
  const greeting_video_url = String(formData.get("greeting_video_url") ?? "").trim();
  const greeting_video_id = greeting_video_url
    ? (extractYouTubeVideoId(greeting_video_url) ?? "")
    : "";

  const groom_profile = {
    mbti: String(formData.get("groom_mbti") ?? "").trim() || undefined,
    intro: String(formData.get("groom_intro") ?? "").trim() || undefined,
  };
  const bride_profile = {
    mbti: String(formData.get("bride_mbti") ?? "").trim() || undefined,
    intro: String(formData.get("bride_intro") ?? "").trim() || undefined,
  };

  let story_items: {
    date: string;
    title: string;
    body: string;
    photo_url?: string;
    photo_position?: { x: number; y: number };
  }[] = [];
  try {
    const raw = String(formData.get("story_items_json") ?? "[]");
    story_items = JSON.parse(raw);
  } catch {
    story_items = [];
  }
  story_items = story_items.filter((s) => s.date || s.title || s.body || s.photo_url);

  const account_info = {
    groom: {
      self: readAccount(formData, "acc_groom_self"),
      father: readAccount(formData, "acc_groom_father"),
      mother: readAccount(formData, "acc_groom_mother"),
    },
    bride: {
      self: readAccount(formData, "acc_bride_self"),
      father: readAccount(formData, "acc_bride_father"),
      mother: readAccount(formData, "acc_bride_mother"),
    },
  };

  const themeRaw = String(formData.get("theme") ?? "ivory");
  const theme = (VALID_THEMES as readonly string[]).includes(themeRaw)
    ? (themeRaw as (typeof VALID_THEMES)[number])
    : "ivory";

  const sections_enabled = {
    story: formData.get("section_story") === "on",
    gallery: formData.get("section_gallery") === "on",
    guestbook: formData.get("section_guestbook") === "on",
    rsvp: formData.get("section_rsvp") === "on",
    account: formData.get("section_account") === "on",
    profile: formData.get("section_profile") === "on",
    sponsor: formData.get("section_sponsor") === "on",
  };

  const published = formData.get("published") === "on";

  const groom_birth_order = (String(formData.get("groom_birth_order") ?? "").trim()) || "장남";
  const bride_birth_order = (String(formData.get("bride_birth_order") ?? "").trim()) || "장녀";

  let info_items: InfoItem[] = [];
  try {
    const raw = String(formData.get("info_items_json") ?? "[]");
    const parsed = JSON.parse(raw) as InfoItem[];
    info_items = parsed
      .map((it) => ({
        title: String(it.title ?? "").trim(),
        body: String(it.body ?? "").trim(),
      }))
      .filter((it) => it.title || it.body);
  } catch {
    info_items = [];
  }
  let section_order: SectionKey[] | undefined;
  try {
    const raw = String(formData.get("section_order_json") ?? "");
    if (raw) {
      const parsed = JSON.parse(raw) as unknown[];
      const cleaned = parsed
        .map((k) => String(k))
        .filter((k): k is SectionKey => (SECTION_KEYS as readonly string[]).includes(k));
      if (cleaned.length) section_order = cleaned;
    }
  } catch {
    section_order = undefined;
  }

  let primary_tabs: string[] | undefined;
  try {
    const raw = String(formData.get("primary_tabs_json") ?? "");
    if (raw) {
      const parsed = JSON.parse(raw) as unknown[];
      primary_tabs = parsed.map((k) => String(k));
    }
  } catch {
    primary_tabs = undefined;
  }

  let home_visible: Partial<Record<SectionKey, boolean>> | undefined;
  try {
    const raw = String(formData.get("section_home_visible_json") ?? "");
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      home_visible = Object.fromEntries(
        (SECTION_KEYS as readonly string[])
          .filter((k) => k in parsed)
          .map((k) => [k, parsed[k] === true]),
      );
    }
  } catch {
    home_visible = undefined;
  }

  let sponsor_logos: string[] = [];
  try {
    const raw = String(formData.get("sponsor_logos_json") ?? "[]");
    const parsed = JSON.parse(raw) as unknown[];
    sponsor_logos = parsed.filter((u): u is string => typeof u === "string");
  } catch {
    sponsor_logos = [];
  }
  const sponsorTitleRaw = String(formData.get("sponsor_title") ?? "sponsored_by");
  const sponsor_title =
    sponsorTitleRaw === "supported_by" ? "supported_by" : "sponsored_by";

  const extras: SiteExtras = {
    transit_subway: String(formData.get("transit_subway") ?? "").trim(),
    transit_bus: String(formData.get("transit_bus") ?? "").trim(),
    parking_notes: String(formData.get("parking_notes") ?? "").trim(),
    info_items,
    flower_decline: formData.get("flower_decline") === "on",
    flower_decline_note: String(formData.get("flower_decline_note") ?? "").trim(),
    share_title_suffix: String(formData.get("share_title_suffix") ?? "").trim(),
    section_order,
    rsvp_fields: {
      attending: formData.get("rsvp_field_attending") === "on",
      phone: formData.get("rsvp_field_phone") === "on",
      party_size: formData.get("rsvp_field_party_size") === "on",
      message: formData.get("rsvp_field_message") === "on",
      meal: formData.get("rsvp_field_meal") === "on",
      side: formData.get("rsvp_field_side") === "on",
      parking: formData.get("rsvp_field_parking") === "on",
    },
    primary_tabs,
    home_visible,
    rsvp_prompt_enabled: formData.get("rsvp_prompt_enabled") === "on",
    sponsor_title,
    sponsor_logos,
    sponsor_slogan: String(formData.get("sponsor_slogan") ?? "").trim(),
  };

  const fields: ParsedAdminFields = {
    slug,
    groom_name,
    bride_name,
    name_joiner,
    parents,
    venue_name,
    venue_address,
    venue_lat,
    venue_lng,
    parking_name,
    parking_address,
    parking_lat,
    parking_lng,
    greeting,
    greeting_video_id,
    groom_profile,
    bride_profile,
    story_items,
    account_info,
    theme,
    sections_enabled,
    groom_birth_order,
    bride_birth_order,
    published,
    extras,
  };

  // Same "don't clobber a saved date with an accidentally-cleared field"
  // guard as the save action — see saveAdminForm for the full rationale.
  if (wedding_at_raw) {
    fields.wedding_at = kstDateTimeLocalToUtcIso(wedding_at_raw);
  }

  return fields;
}

/**
 * Merge live form values onto the last-saved site row, for the admin's
 * real-time preview pane. Never touches the DB — purely client-side.
 */
export function buildDraftSite(
  base: Tables<"wedding_sites">,
  formData: FormData,
): Tables<"wedding_sites"> {
  return { ...base, ...parseAdminFormFields(formData) };
}
