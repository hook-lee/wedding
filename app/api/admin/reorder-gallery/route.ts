import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";

/**
 * Save a new ordering of the gallery. The client sends the full URL array in
 * its desired display order. We validate it against what's currently in the
 * DB (same URLs, just reshuffled) so a stale client can't accidentally drop
 * photos by sending a truncated list.
 */
export async function POST(req: Request) {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);
  const { urls } = (await req.json()) as { urls: unknown };

  if (!Array.isArray(urls) || urls.some((u) => typeof u !== "string")) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const current = site.gallery_urls ?? [];
  const next = urls as string[];

  // Must be a pure reordering — same set, possibly different order.
  // (Deletes go through delete-photo; uploads through upload-photo.)
  if (next.length !== current.length) {
    return NextResponse.json({ error: "length mismatch" }, { status: 400 });
  }
  const a = new Set(current);
  const b = new Set(next);
  if (a.size !== b.size || [...a].some((u) => !b.has(u))) {
    return NextResponse.json({ error: "set mismatch" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("wedding_sites")
    .update({ gallery_urls: next })
    .eq("id", site.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
