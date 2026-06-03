"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function postGuestbook(siteId: string, formData: FormData) {
  const guest_name = String(formData.get("name") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!guest_name || !message)
    return { error: "이름과 메시지를 입력해주세요." };
  if (guest_name.length > 30) return { error: "이름은 30자 이하로 입력해주세요." };
  if (message.length > 200) return { error: "메시지는 200자 이하로 입력해주세요." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("guestbook")
    .insert({ site_id: siteId, guest_name, message });
  if (error) return { error: error.message };
  return { ok: true };
}
