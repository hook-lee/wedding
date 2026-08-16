"use server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateSlug } from "@/lib/slug/validate";
import { isSlugAvailable, resolveAdminSite } from "@/lib/db/wedding-site";
import { revalidatePath } from "next/cache";
import { parseAdminFormFields } from "@/lib/admin/parse-form";

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
