import type { Metadata } from "next";
import { loadSite } from "./_lib/load-site";
import { SplashOverlay } from "./_components/SplashOverlay";
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
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const site = await loadSite(slug);
    const title = `${site.groom_name}${site.name_joiner}${site.bride_name} 결혼식`;
    const description =
      (site.greeting?.slice(0, 80) || "결혼식에 초대합니다") +
      (site.greeting && site.greeting.length > 80 ? "..." : "");
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

  const sectionsEnabled =
    (site.sections_enabled as unknown as Record<string, boolean>) ?? {};
  const tabs = visibleTabs(sectionsEnabled);
  const requested = (VALID.includes(tab as TabKey) ? tab : "home") as TabKey;
  const active: TabKey = tabs.includes(requested) ? requested : "home";

  const supabase = await createSupabaseServerClient();
  const needsGuestbook = active === "home" || active === "guestbook";
  const { data: initialGuestbook } = needsGuestbook
    ? await supabase
        .from("guestbook")
        .select("*")
        .eq("site_id", site.id)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: null };

  // Splash only shows on the entry view (no ?tab=). For direct deep links to a
  // specific tab (카톡 공유 등), skip the entrance.
  const showSplash = !tab;

  return (
    <>
      <TabShell
        slug={site.slug}
        tabs={tabs}
        active={active}
        bgmTracks={
          (site.bgm_tracks as unknown as Parameters<typeof TabShell>[0]["bgmTracks"]) ??
          []
        }
      >
        {active === "home" && (
          <HomeTab site={site} initialGuestbook={initialGuestbook ?? []} />
        )}
        {active === "story" && (
          <StoryTab
            items={
              (site.story_items as unknown as {
                date: string;
                title: string;
                body: string;
                photo_url?: string;
              }[]) ?? []
            }
          />
        )}
        {active === "gallery" && <GalleryTab urls={site.gallery_urls ?? []} />}
        {active === "guestbook" && (
          <GuestbookTab siteId={site.id} initial={initialGuestbook ?? []} />
        )}
        {active === "info" && (
          <InfoTab
            site={site}
            sub={
              (sub as "venue" | "rsvp" | "account" | "profile" | undefined) ?? null
            }
          />
        )}
      </TabShell>

      {showSplash && (
        <SplashOverlay
          groomName={site.groom_name}
          brideName={site.bride_name}
          weddingAt={site.wedding_at}
          nameJoiner={site.name_joiner}
          venueName={site.venue_name}
          mainPhotoUrl={site.main_photo_url}
        />
      )}
    </>
  );
}
