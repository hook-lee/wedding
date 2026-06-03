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

export async function saveAdminForm(formData: FormData) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const slug = String(formData.get("slug") ?? "").trim();
  const groom_name = String(formData.get("groom_name") ?? "").trim();
  const bride_name = String(formData.get("bride_name") ?? "").trim();
  const wedding_at_raw = String(formData.get("wedding_at") ?? "");
  const name_joiner = String(formData.get("name_joiner") ?? " ♡ ");
  const parents = readParentsFromForm(formData);

  const v = validateSlug(slug);
  if (!v.ok) return { error: v.reason };
  if (!(await isSlugAvailable(slug, user.id))) {
    return { error: "이미 사용 중인 슬러그입니다." };
  }

  const wedding_at = wedding_at_raw ? new Date(wedding_at_raw).toISOString() : null;

  const { error } = await supabase
    .from("wedding_sites")
    .update({ slug, groom_name, bride_name, wedding_at, name_joiner, parents } as never)
    .eq("owner_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}
