import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";

export async function POST(req: Request) {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);
  const { url, kind } = (await req.json()) as {
    url: string;
    kind: "main" | "gallery";
  };
  const supabase = await createSupabaseServerClient();

  const path = String(url).split("/wedding-photos/")[1] ?? "";

  // Defense-in-depth: ensure the URL's storage path is under the caller's
  // own site folder. Storage RLS would block a cross-tenant delete, but if
  // that policy ever loosens this check prevents data loss directly.
  if (!path.startsWith(`${site.id}/`)) {
    return NextResponse.json(
      { error: "이 사이트에 속한 파일이 아닙니다." },
      { status: 400 },
    );
  }

  await supabase.storage.from("wedding-photos").remove([path]);

  if (kind === "main") {
    await supabase
      .from("wedding_sites")
      .update({ main_photo_url: null })
      .eq("id", site.id);
  } else {
    // Match by storage path, not exact URL string — protects against query
    // strings, double slashes, or other harmless URL drift between how the
    // file was originally registered vs. what the client sends back now.
    const next = (site.gallery_urls ?? []).filter((u: string) => {
      const p = String(u).split("/wedding-photos/")[1] ?? "";
      return p !== path;
    });
    await supabase
      .from("wedding_sites")
      .update({ gallery_urls: next })
      .eq("id", site.id);
  }
  return NextResponse.json({ ok: true });
}
