"use server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";
import { revalidatePath } from "next/cache";

export async function deleteSharedPhoto(id: string) {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);
  const supabase = await createSupabaseServerClient();
  // Scope by site_id as well as id — the owner may only remove photos from
  // their own invitation, never another couple's by guessing a row id.
  await supabase.from("shared_photos").delete().eq("id", id).eq("site_id", site.id);
  revalidatePath("/admin/photos");
}
