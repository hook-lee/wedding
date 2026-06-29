"use server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateSlug } from "@/lib/slug/validate";
import { isSlugAvailable } from "@/lib/db/wedding-site";
import { kstDateTimeLocalToUtcIso } from "@/lib/date/kst";
import { extractYouTubeVideoId } from "@/lib/youtube/parse-url";
import { revalidatePath } from "next/cache";
import type { ParentsBlock, ParentStatus } from "@/lib/parents/types";
import type { Database } from "@/lib/supabase/types";
import type { InfoItem, SiteExtras } from "@/lib/extras/types";

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

export type SaveResult = { ok?: true; error?: string };

export async function saveAdminForm(
  _prevState: SaveResult | null,
  formData: FormData,
): Promise<SaveResult> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

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

  let story_items: { date: string; title: string; body: string; photo_url?: string }[] = [];
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

  const VALID_THEMES = ["ivory", "sage", "pink", "cobalt", "mocha", "ash"] as const;
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
  };

  const published = formData.get("published") === "on";

  const groom_birth_order = (String(formData.get("groom_birth_order") ?? "").trim()) || "장남";
  const bride_birth_order = (String(formData.get("bride_birth_order") ?? "").trim()) || "장녀";

  // === extras (transit/parking notes, info items, flower decline) ===
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
  const extras: SiteExtras = {
    transit_subway: String(formData.get("transit_subway") ?? "").trim(),
    transit_bus: String(formData.get("transit_bus") ?? "").trim(),
    parking_notes: String(formData.get("parking_notes") ?? "").trim(),
    info_items,
    flower_decline: formData.get("flower_decline") === "on",
    flower_decline_note: String(formData.get("flower_decline_note") ?? "").trim(),
  };

  const v = validateSlug(slug);
  if (!v.ok) return { error: v.reason };
  if (!(await isSlugAvailable(slug, user.id))) {
    return { error: "이미 사용 중인 슬러그입니다." };
  }

  // Treat the datetime-local input as KST regardless of where the server runs.
  // Without this, Vercel (UTC) would misread "2026-10-10T16:00" as UTC and the
  // displayed time would shift by +9 hours.
  //
  // ⚠️ Empty/cleared input must NOT silently overwrite a previously-set date.
  // Browser autofill or Safari quirks have been seen to clear datetime-local
  // values without user intent. If the field comes back empty, leave the DB
  // column alone (omit wedding_at from the update payload).
  const updatePayload: Database["public"]["Tables"]["wedding_sites"]["Update"] = {
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
  if (wedding_at_raw) {
    updatePayload.wedding_at = kstDateTimeLocalToUtcIso(wedding_at_raw);
  }

  const { error } = await supabase
    .from("wedding_sites")
    .update(updatePayload)
    .eq("owner_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}

