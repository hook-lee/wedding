import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";
import { extractYouTubeVideoId } from "@/lib/youtube/parse-url";

type Track = {
  order: number;
  title: string;
  artist: string | null;
  kind?: "audio" | "youtube";
  url?: string;
  videoId?: string;
};

const MAX_TRACKS = 5;

export async function POST(req: Request) {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);
  const body = (await req.json()) as {
    action: "delete" | "add-youtube" | "add-audio";
    url?: string;
    videoId?: string;
    title?: string;
    artist?: string;
    path?: string;
  };

  const supabase = await createSupabaseServerClient();
  const all = (site.bgm_tracks as unknown as Track[]) ?? [];

  if (body.action === "add-audio") {
    if (all.length >= MAX_TRACKS)
      return NextResponse.json({ error: "최대 5곡" }, { status: 400 });
    const path = String(body.path ?? "").trim();
    // Defense-in-depth: the path came from our own signed-upload-url
    // response, but double-check it's scoped to this site before trusting
    // it enough to derive a public URL and persist it.
    if (!path.startsWith(`${site.id}/`))
      return NextResponse.json({ error: "잘못된 경로입니다." }, { status: 400 });

    const { data: pub } = supabase.storage.from("wedding-bgm").getPublicUrl(path);
    const title = String(body.title ?? "").trim() || "Untitled";
    const artist = String(body.artist ?? "").trim() || null;
    const order = all.length + 1;
    const next: Track[] = [
      ...all,
      { order, title, artist, kind: "audio", url: pub.publicUrl },
    ];
    await supabase
      .from("wedding_sites")
      .update({ bgm_tracks: next })
      .eq("id", site.id);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "add-youtube") {
    if (all.length >= MAX_TRACKS)
      return NextResponse.json({ error: "최대 5곡" }, { status: 400 });
    const raw = String(body.url ?? "").trim();
    const videoId = extractYouTubeVideoId(raw);
    if (!videoId)
      return NextResponse.json(
        { error: "유효한 YouTube 링크가 아닙니다" },
        { status: 400 },
      );

    const title = String(body.title ?? "").trim() || "Untitled";
    const artist = String(body.artist ?? "").trim() || null;
    const order = all.length + 1;
    const next: Track[] = [
      ...all,
      { order, title, artist, kind: "youtube", videoId },
    ];
    await supabase
      .from("wedding_sites")
      .update({ bgm_tracks: next })
      .eq("id", site.id);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "delete") {
    const url = String(body.url ?? "");
    const videoId = String(body.videoId ?? "");
    const filtered = all.filter((t) => {
      if (videoId && t.kind === "youtube") return t.videoId !== videoId;
      if (url && (!t.kind || t.kind === "audio")) return t.url !== url;
      return true;
    });
    filtered.forEach((t, i) => (t.order = i + 1));

    // remove storage file for audio tracks only
    if (url) {
      const path = url.split("/wedding-bgm/")[1];
      if (path) await supabase.storage.from("wedding-bgm").remove([path]);
    }
    await supabase
      .from("wedding_sites")
      .update({ bgm_tracks: filtered })
      .eq("id", site.id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
