import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";
import crypto from "node:crypto";

export const runtime = "nodejs";
const MAX_TRACKS = 5;

type Track = { order: number; url: string; title: string; artist: string | null };

export async function POST(req: Request) {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);
  const tracks = (site.bgm_tracks as unknown as Track[]) ?? [];
  if (tracks.length >= MAX_TRACKS)
    return NextResponse.json({ error: "최대 5곡" }, { status: 400 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const title = String(form.get("title") ?? "").trim() || "Untitled";
  const artist = String(form.get("artist") ?? "").trim() || null;

  if (!file) return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  if (file.size > 15 * 1024 * 1024)
    return NextResponse.json({ error: "15MB 초과" }, { status: 400 });
  if (!file.type.startsWith("audio/"))
    return NextResponse.json({ error: "오디오만" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const ext = (file.name.split(".").pop() || "mp3").toLowerCase();
  const path = `${site.id}/${crypto.randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from("wedding-bgm")
    .upload(path, buf, { contentType: file.type });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data: pub } = supabase.storage.from("wedding-bgm").getPublicUrl(path);
  const order = tracks.length + 1;
  const next: Track[] = [...tracks, { order, url: pub.publicUrl, title, artist }];

  await supabase.from("wedding_sites").update({ bgm_tracks: next }).eq("id", site.id);
  return NextResponse.json({ ok: true });
}
