"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function readOptionalYesNo(formData: FormData, key: string): boolean | null {
  const v = formData.get(key);
  if (v === "yes") return true;
  if (v === "no") return false;
  return null;
}

export async function postRsvp(siteId: string, formData: FormData) {
  const guest_name = String(formData.get("name") ?? "").trim();
  // If the site turned this question off, the radio group isn't rendered at
  // all — formData.get returns null. Default to "attending" rather than
  // false, since submitting the form at all implies intent to come.
  const attendingRaw = formData.get("attending");
  const attending = attendingRaw === null ? true : attendingRaw === "yes";
  const partyRaw = Number(formData.get("party_size") ?? 1);
  const party_size = Math.max(
    1,
    Math.min(20, Number.isFinite(partyRaw) ? partyRaw : 1),
  );
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const message = String(formData.get("message") ?? "").trim() || null;
  const meal_attending = readOptionalYesNo(formData, "meal_attending");
  const parking_needed = readOptionalYesNo(formData, "parking_needed");
  const sideRaw = String(formData.get("guest_side") ?? "");
  const guest_side = sideRaw === "groom" || sideRaw === "bride" ? sideRaw : null;
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
    meal_attending,
    guest_side,
    parking_needed,
  });
  if (error) return { error: error.message };
  return { ok: true };
}
