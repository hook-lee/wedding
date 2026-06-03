import type { Metadata } from "next";
import { loadSite } from "./_lib/load-site";
import { Splash } from "./_components/Splash";
import { TabShell } from "./_components/TabShell";
import { visibleTabs, type TabKey } from "./_lib/tabs";
import { HomeTab } from "./_components/HomeTab";
import { StoryTab } from "./_components/StoryTab";
import { GalleryTab } from "./_components/GalleryTab";
import { GuestbookTab } from "./_components/GuestbookTab";
import { InfoTab } from "./_components/InfoTab";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const VALID: TabKey[] = ["home", "story", "gallery", "guestbook", "info"];

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const site = await loadSite(slug);
    const title = `${site.groom_name}${site.name_joiner}${site.bride_name} 결혼식`;
    const description = (site.greeting?.slice(0, 80) || "결혼식에 초대합니다") + (site.greeting && site.greeting.length > 80 ? "..." : "");
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: site.main_photo_url ? [site.main_photo_url] : [],
        type: "website",
      },
    };
  } catch {
    return { title: "wedding-zip" };
  }
}

export default async function PublicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string; sub?: string }>;
}) {
  const { slug } = await params;
  const { tab, sub } = await searchParams;
  const site = await loadSite(slug);

  if (!tab) {
    return (
      <Splash
        groomName={site.groom_name}
        brideName={site.bride_name}
        weddingAt={site.wedding_at}
        nameJoiner={site.name_joiner}
        venueName={site.venue_name}
        greeting={site.greeting}
        mainPhotoUrl={site.main_photo_url}
        slug={site.slug}
      />
    );
  }

  const sectionsEnabled =
    (site.sections_enabled as unknown as Record<string, boolean>) ?? {};
  const tabs = visibleTabs(sectionsEnabled);
  const requested = (VALID.includes(tab as TabKey) ? tab : "home") as TabKey;
  const active: TabKey = tabs.includes(requested) ? requested : "home";

  const supabase = await createSupabaseServerClient();
  const { data: initialGuestbook } =
    active === "guestbook"
      ? await supabase
          .from("guestbook")
          .select("*")
          .eq("site_id", site.id)
          .order("created_at", { ascending: false })
          .limit(50)
      : { data: null };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const shareUrl = `${baseUrl}/w/${site.slug}`;
  const shareTitle = `${site.groom_name}${site.name_joiner}${site.bride_name} 결혼식에 초대합니다`;
  const shareDescription = site.wedding_at
    ? new Date(site.wedding_at).toLocaleDateString("ko-KR")
    : "";

  return (
    <TabShell
      slug={site.slug}
      tabs={tabs}
      active={active}
      bgmTracks={
        (site.bgm_tracks as unknown as {
          order: number;
          url: string;
          title: string;
          artist: string | null;
        }[]) ?? []
      }
      shareUrl={shareUrl}
      shareTitle={shareTitle}
      shareDescription={shareDescription}
      shareImage={site.main_photo_url}
    >
      {active === "home" && <HomeTab site={site} />}
      {active === "story" && (
        <StoryTab
          items={
            (site.story_items as unknown as {
              date: string;
              title: string;
              body: string;
            }[]) ?? []
          }
        />
      )}
      {active === "gallery" && (
        <GalleryTab urls={site.gallery_urls ?? []} />
      )}
      {active === "guestbook" && (
        <GuestbookTab
          siteId={site.id}
          initial={initialGuestbook ?? []}
        />
      )}
      {active === "info" && (
        <InfoTab
          site={site}
          sub={
            (sub as "venue" | "rsvp" | "account" | "profile" | undefined) ??
            null
          }
        />
      )}
    </TabShell>
  );
}
