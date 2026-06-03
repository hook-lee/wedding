import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";

type Track = { order: number; url: string; title: string; artist: string | null };

export async function POST(req: Request) {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);
  const { action, url } = (await req.json()) as { action: "delete"; url: string };

  const supabase = await createSupabaseServerClient();
  const all = (site.bgm_tracks as unknown as Track[]) ?? [];
  const filtered = all.filter((t) => t.url !== url);
  filtered.forEach((t, i) => (t.order = i + 1));

  const path = String(url).split("/wedding-bgm/")[1];
  if (action === "delete" && path) {
    await supabase.storage.from("wedding-bgm").remove([path]);
  }
  await supabase.from("wedding_sites").update({ bgm_tracks: filtered }).eq("id", site.id);
  return NextResponse.json({ ok: true });
}
