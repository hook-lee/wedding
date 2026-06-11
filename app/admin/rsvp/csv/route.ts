import { requireUser } from "@/lib/auth/require-user";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatKstDateTime } from "@/lib/date/kst";

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

  const header = ["이름","참석","인원","연락처","메시지","응답시각"].map(escape).join(",");
  const rows = (data ?? []).map((r) => [
    r.guest_name,
    r.attending ? "참석" : "불참",
    String(r.party_size),
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
