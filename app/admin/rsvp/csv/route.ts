import { requireUser } from "@/lib/auth/require-user";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatKstDateTime } from "@/lib/date/kst";
import { readExtras } from "@/lib/extras/types";

// CSV cell escape — also neutralizes Excel/Sheets formula injection by prefixing
// values that start with =, +, -, @, tab, or CR with a single quote (Excel
// treats the resulting cell as text rather than a formula).
function escape(s: string): string {
  const v = (s ?? "").toString();
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET() {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("rsvp").select("*").eq("site_id", site.id)
    .order("created_at", { ascending: true });

  const rsvpFields = readExtras(site.extras).rsvp_fields ?? {};
  const header = [
    "이름", "참석", "인원",
    ...(rsvpFields.side ? ["구분"] : []),
    ...(rsvpFields.meal ? ["식사"] : []),
    ...(rsvpFields.parking ? ["주차"] : []),
    "연락처", "메시지", "응답시각",
  ].map(escape).join(",");
  const rows = (data ?? []).map((r) => [
    r.guest_name,
    r.attending ? "참석" : "불참",
    String(r.party_size),
    ...(rsvpFields.side
      ? [r.guest_side === "groom" ? "신랑측" : r.guest_side === "bride" ? "신부측" : ""]
      : []),
    ...(rsvpFields.meal
      ? [r.meal_attending === true ? "식사함" : r.meal_attending === false ? "안 함" : ""]
      : []),
    ...(rsvpFields.parking
      ? [r.parking_needed === true ? "필요" : r.parking_needed === false ? "불필요" : ""]
      : []),
    r.phone ?? "",
    r.message ?? "",
    formatKstDateTime(r.created_at),
  ].map(escape).join(",")).join("\n");

  // UTF-8 BOM so Excel auto-detects encoding for Korean
  const csv = "﻿" + header + "\n" + rows;

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="rsvp-${site.slug}.csv"`,
    },
  });
}
