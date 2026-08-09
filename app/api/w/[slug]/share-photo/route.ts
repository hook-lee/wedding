import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  readExtras,
  resolvePhotoShare,
  isPhotoShareOpen,
  MAX_SHARED_PHOTOS,
} from "@/lib/extras/types";
import crypto from "node:crypto";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;

// Same allowlist as the admin uploader — image/svg+xml is deliberately absent
// so nobody can stage XSS on the *.supabase.co origin with a scripted SVG.
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

/**
 * Anonymous guest photo upload.
 *
 * This is the only unauthenticated write endpoint in the app, so every
 * precondition is re-checked here rather than trusted from the client:
 * the site must exist and be published, sharing must be enabled and open,
 * the file must pass the type/size allowlist, and the site must be under
 * its total cap. Only then does the service-role client touch storage.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = createSupabaseAdminClient();

  const { data: site } = await supabase
    .from("wedding_sites")
    .select("id, extras, published, wedding_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!site || !site.published) {
    return NextResponse.json({ error: "청첩장을 찾을 수 없습니다." }, { status: 404 });
  }

  const share = resolvePhotoShare(readExtras(site.extras));
  if (!isPhotoShareOpen(share, site.wedding_at)) {
    return NextResponse.json(
      { error: "아직 사진을 받고 있지 않아요." },
      { status: 403 },
    );
  }

  const { count } = await supabase
    .from("shared_photos")
    .select("id", { count: "exact", head: true })
    .eq("site_id", site.id);
  if ((count ?? 0) >= MAX_SHARED_PHOTOS) {
    return NextResponse.json(
      { error: "사진이 너무 많이 모였어요. 신랑신부에게 직접 전달해주세요." },
      { status: 429 },
    );
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const uploader = String(form.get("name") ?? "").trim().slice(0, 30);

  if (!file) return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: "8MB를 넘는 사진은 올릴 수 없어요." }, { status: 400 });
  if (!ALLOWED_IMAGE_TYPES.has(file.type))
    return NextResponse.json(
      { error: "지원하지 않는 형식입니다. (jpg/png/webp/gif/heic만 가능)" },
      { status: 400 },
    );

  // Extension comes from the validated MIME type, never from file.name —
  // a guest-supplied filename could carry a path-traversal payload.
  const ext = EXT_BY_MIME[file.type] ?? "jpg";
  const path = `${site.id}/shared/${crypto.randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from("wedding-photos")
    .upload(path, buf, { contentType: file.type });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data: pub } = supabase.storage.from("wedding-photos").getPublicUrl(path);
  const { error: insErr } = await supabase.from("shared_photos").insert({
    site_id: site.id,
    url: pub.publicUrl,
    uploader_name: uploader || null,
  });
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  return NextResponse.json({ url: pub.publicUrl });
}
