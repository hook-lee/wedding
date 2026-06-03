"use server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteGuestbookEntry(id: string) {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  // RLS ensures only the site owner can delete
  await supabase.from("guestbook").delete().eq("id", id);
  revalidatePath("/admin/guestbook");
}
