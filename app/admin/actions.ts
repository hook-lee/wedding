"use server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateSlug } from "@/lib/slug/validate";
import { isSlugAvailable, resolveAdminSite } from "@/lib/db/wedding-site";
import { revalidatePath } from "next/cache";
import { parseAdminFormFields } from "@/lib/admin/parse-form";
import { isUnreadableYouTubeInput } from "@/lib/youtube/parse-url";

export type SaveResult = { ok?: true; error?: string };

export async function saveAdminForm(
  _prevState: SaveResult | null,
  formData: FormData,
): Promise<SaveResult> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const fields = parseAdminFormFields(formData);
  const slug = String(fields.slug ?? "").trim();

  const v = validateSlug(slug);
  if (!v.ok) return { error: v.reason };

  // Refuse rather than quietly blanking the field, which is how an
  // unsupported URL shape used to present itself: the link "disappeared".
  for (const [field, label] of [
    ["popup_video_url", "팝업 영상"],
    ["greeting_video_url", "인사말 영상"],
  ] as const) {
    if (isUnreadableYouTubeInput(String(formData.get(field) ?? ""))) {
      return {
        error: `${label} 주소를 알아보지 못했어요. 유튜브 주소가 맞는지 확인해주세요. (예: https://youtu.be/... )`,
      };
    }
  }

  // Target the resolved site rather than owner_id — an invited partner edits
  // a site they don't own, and matching on owner_id would silently update
  // zero rows for them.
  const site = await resolveAdminSite(user.id);
  if (!(await isSlugAvailable(slug, site.id))) {
    return { error: "이미 사용 중인 슬러그입니다." };
  }

  const { error } = await supabase
    .from("wedding_sites")
    .update(fields)
    .eq("id", site.id);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}
