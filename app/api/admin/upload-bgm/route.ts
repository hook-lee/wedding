import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";
import crypto from "node:crypto";

export const runtime = "nodejs";
const MAX_TRACKS = 5;

type Track = { order: number; url: string; title: string; artist: string | null };

const ALLOWED_AUDIO_TYPES: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/mp4": "m4a",
  "audio/aac": "aac",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/webm": "webm",
};

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
  if (!ALLOWED_AUDIO_TYPES[file.type])
    return NextResponse.json(
      { error: "지원하지 않는 오디오 형식입니다." },
      { status: 400 },
    );

  const supabase = await createSupabaseServerClient();
  // Derive extension from MIME — never from user-supplied filename.
  const ext = ALLOWED_AUDIO_TYPES[file.type];
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
