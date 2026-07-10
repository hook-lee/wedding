import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";
import crypto from "node:crypto";

const MAX_TRACKS = 5;
// Vercel serverless functions cap request bodies at 4.5MB — a proxied upload
// silently 413s before our own 15MB check ever runs, which is why BGM
// uploads used to fail for any real song (most MP3s clear 4.5MB alone).
// Issuing a signed URL and uploading straight from the browser to Supabase
// Storage bypasses Vercel's body limit entirely, so we can allow a size
// close to Supabase's own per-file ceiling.
const MAX_BGM_BYTES = 20 * 1024 * 1024;

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
  const tracks = (site.bgm_tracks as unknown as { order: number }[]) ?? [];
  if (tracks.length >= MAX_TRACKS)
    return NextResponse.json({ error: "최대 5곡" }, { status: 400 });

  const { mimeType, size } = (await req.json()) as {
    mimeType?: string;
    size?: number;
  };
  const ext = ALLOWED_AUDIO_TYPES[String(mimeType)];
  if (!ext)
    return NextResponse.json(
      { error: "지원하지 않는 오디오 형식입니다." },
      { status: 400 },
    );
  if (typeof size !== "number" || size <= 0 || size > MAX_BGM_BYTES)
    return NextResponse.json({ error: "20MB 초과" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const path = `${site.id}/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await supabase.storage
    .from("wedding-bgm")
    .createSignedUploadUrl(path);
  if (error || !data)
    return NextResponse.json(
      { error: error?.message ?? "업로드 URL 발급 실패" },
      { status: 500 },
    );

  return NextResponse.json({ path, token: data.token });
}
