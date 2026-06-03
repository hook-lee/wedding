import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";
import crypto from "node:crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const kind = String(form.get("kind") ?? "gallery");

  if (!file) return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "8MB 초과" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "이미지만" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path =
    kind === "main"
      ? `${site.id}/main.${ext}`
      : `${site.id}/gallery/${crypto.randomUUID()}.${ext}`;

  const buf = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage
    .from("wedding-photos")
    .upload(path, buf, { upsert: kind === "main", contentType: file.type });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data: pub } = supabase.storage.from("wedding-photos").getPublicUrl(path);

  if (kind === "main") {
    await supabase
      .from("wedding_sites")
      .update({ main_photo_url: pub.publicUrl })
      .eq("id", site.id);
  } else {
    const next = [...(site.gallery_urls ?? []), pub.publicUrl];
    await supabase.from("wedding_sites").update({ gallery_urls: next }).eq("id", site.id);
  }

  return NextResponse.json({ url: pub.publicUrl });
}
