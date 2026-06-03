import { loadSite } from "./_lib/load-site";
import { Splash } from "./_components/Splash";
import { TabShell } from "./_components/TabShell";
import { visibleTabs, type TabKey } from "./_lib/tabs";
import { HomeTab } from "./_components/HomeTab";
import { StoryTab } from "./_components/StoryTab";

const VALID: TabKey[] = ["home", "story", "gallery", "guestbook", "info"];

export default async function PublicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab } = await searchParams;
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

  return (
    <TabShell slug={site.slug} tabs={tabs} active={active}>
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
        <div className="text-center text-muted py-8">사진첩 (Chunk B)</div>
      )}
      {active === "guestbook" && (
        <div className="text-center text-muted py-8">일촌평 (Chunk B)</div>
      )}
      {active === "info" && (
        <div className="text-center text-muted py-8">더보기 (Chunk B)</div>
      )}
    </TabShell>
  );
}
