"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function postGuestbook(siteId: string, formData: FormData) {
  const guest_name = String(formData.get("name") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!guest_name || !message)
    return { error: "이름과 메시지를 입력해주세요." };
  if (guest_name.length > 30) return { error: "이름은 30자 이하로 입력해주세요." };
  if (message.length > 200) return { error: "메시지는 200자 이하로 입력해주세요." };

  const phone = String(formData.get("phone") ?? "").trim() || null;
  const relationship = String(formData.get("relationship") ?? "").trim().slice(0, 20) || null;
  const guestSideRaw = String(formData.get("guest_side") ?? "");
  const guest_side = guestSideRaw === "groom" || guestSideRaw === "bride" ? guestSideRaw : null;

  const supabase = await createSupabaseServerClient();
  // Only send phone/guest_side/relationship when actually provided — these
  // columns are new, and always including the keys (even as null) makes
  // PostgREST reject the insert on any site that hasn't run the migration
  // yet. Same class of bug as the earlier rsvp.guest_side incident.
  const { error } = await supabase.from("guestbook").insert({
    site_id: siteId,
    guest_name,
    message,
    ...(phone ? { phone } : {}),
    ...(guest_side ? { guest_side } : {}),
    ...(relationship ? { relationship } : {}),
  });
  if (error) return { error: error.message };
  return { ok: true };
}
