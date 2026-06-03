import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";

export async function POST(req: Request) {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);
  const { url, kind } = (await req.json()) as { url: string; kind: "main" | "gallery" };
  const supabase = await createSupabaseServerClient();

  const path = String(url).split("/wedding-photos/")[1];
  if (path) await supabase.storage.from("wedding-photos").remove([path]);

  if (kind === "main") {
    await supabase
      .from("wedding_sites")
      .update({ main_photo_url: null })
      .eq("id", site.id);
  } else {
    const next = (site.gallery_urls ?? []).filter((u: string) => u !== url);
    await supabase.from("wedding_sites").update({ gallery_urls: next }).eq("id", site.id);
  }
  return NextResponse.json({ ok: true });
}
