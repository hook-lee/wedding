"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function postRsvp(siteId: string, formData: FormData) {
  const guest_name = String(formData.get("name") ?? "").trim();
  const attending = formData.get("attending") === "yes";
  const partyRaw = Number(formData.get("party_size") ?? 1);
  const party_size = Math.max(
    1,
    Math.min(20, Number.isFinite(partyRaw) ? partyRaw : 1),
  );
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const message = String(formData.get("message") ?? "").trim() || null;
  if (!guest_name) return { error: "이름을 입력해주세요." };
  if (guest_name.length > 30)
    return { error: "이름은 30자 이하로 입력해주세요." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("rsvp").insert({
    site_id: siteId,
    guest_name,
    attending,
    party_size,
    phone,
    message,
  });
  if (error) return { error: error.message };
  return { ok: true };
}
