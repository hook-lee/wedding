"use server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateSlug } from "@/lib/slug/validate";
import { isSlugAvailable } from "@/lib/db/wedding-site";
import { revalidatePath } from "next/cache";
import type { ParentsBlock, ParentStatus } from "@/lib/parents/types";

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

export async function saveAdminForm(formData: FormData) {
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
  const latStr = String(formData.get("venue_lat") ?? "");
  const lngStr = String(formData.get("venue_lng") ?? "");
  const venue_lat = latStr ? Number(latStr) : null;
  const venue_lng = lngStr ? Number(lngStr) : null;

  const greeting = String(formData.get("greeting") ?? "").trim();

  const groom_profile = {
    mbti: String(formData.get("groom_mbti") ?? "").trim() || undefined,
    intro: String(formData.get("groom_intro") ?? "").trim() || undefined,
  };
  const bride_profile = {
    mbti: String(formData.get("bride_mbti") ?? "").trim() || undefined,
    intro: String(formData.get("bride_intro") ?? "").trim() || undefined,
  };

  let story_items: { date: string; title: string; body: string }[] = [];
  try {
    const raw = String(formData.get("story_items_json") ?? "[]");
    story_items = JSON.parse(raw);
  } catch {
    story_items = [];
  }
  story_items = story_items.filter((s) => s.date || s.title || s.body);

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

  const v = validateSlug(slug);
  if (!v.ok) return { error: v.reason };
  if (!(await isSlugAvailable(slug, user.id))) {
    return { error: "이미 사용 중인 슬러그입니다." };
  }

  const wedding_at = wedding_at_raw ? new Date(wedding_at_raw).toISOString() : null;

  const { error } = await supabase
    .from("wedding_sites")
    .update({
      slug,
      groom_name,
      bride_name,
      wedding_at,
      name_joiner,
      parents,
      venue_name,
      venue_address,
      venue_lat,
      venue_lng,
      greeting,
      groom_profile,
      bride_profile,
      story_items,
      account_info,
      theme,
      sections_enabled,
      published,
    })
    .eq("owner_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}
