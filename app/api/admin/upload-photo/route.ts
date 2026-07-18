import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";
import crypto from "node:crypto";

export const runtime = "nodejs";

const MAX_GALLERY = 20;

// Explicit allowlist — bars image/svg+xml which would let attackers stage XSS
// against the *.supabase.co origin by uploading a script-containing SVG.
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
};

export async function POST(req: Request) {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const kind = String(form.get("kind") ?? "gallery");

  if (!file) return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  if (file.size > 8 * 1024 * 1024)
    return NextResponse.json({ error: "8MB 초과" }, { status: 400 });
  if (!ALLOWED_IMAGE_TYPES.has(file.type))
    return NextResponse.json(
      { error: "지원하지 않는 형식입니다. (jpg/png/webp/gif/heic만 가능)" },
      { status: 400 },
    );

  if (kind === "gallery" && (site.gallery_urls?.length ?? 0) >= MAX_GALLERY) {
    return NextResponse.json(
      { error: `갤러리는 최대 ${MAX_GALLERY}장까지 업로드할 수 있습니다.` },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  // Derive extension from MIME (whitelisted above) — never from user-supplied filename
  // to avoid path-traversal payloads in file.name.
  const ext = EXT_BY_MIME[file.type] ?? "jpg";
  let path: string;
  if (kind === "main") path = `${site.id}/main.${ext}`;
  else if (kind === "story") path = `${site.id}/story/${crypto.randomUUID()}.${ext}`;
  else if (kind === "sponsor") path = `${site.id}/sponsor/${crypto.randomUUID()}.${ext}`;
  else path = `${site.id}/gallery/${crypto.randomUUID()}.${ext}`;

  const buf = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage
    .from("wedding-photos")
    .upload(path, buf, { upsert: kind === "main", contentType: file.type });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data: pub } = supabase.storage.from("wedding-photos").getPublicUrl(path);

  // main → update column. gallery → append to array. story → just return URL
  // (URL gets stored inside the story_items JSONB on the next form save).
  if (kind === "main") {
    await supabase
      .from("wedding_sites")
      .update({ main_photo_url: pub.publicUrl })
      .eq("id", site.id);
  } else if (kind === "gallery") {
    const next = [...(site.gallery_urls ?? []), pub.publicUrl];
    await supabase.from("wedding_sites").update({ gallery_urls: next }).eq("id", site.id);
  }

  return NextResponse.json({ url: pub.publicUrl });
}
