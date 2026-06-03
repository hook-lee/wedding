import { TabBar } from "./TabBar";
import { BgmPlayer } from "./BgmPlayer";
import { ShareButton } from "./ShareButton";
import type { TabKey } from "../_lib/tabs";

type Track = {
  order: number;
  url: string;
  title: string;
  artist: string | null;
};

export function TabShell({
  slug,
  tabs,
  active,
  bgmTracks,
  shareUrl,
  shareTitle,
  shareDescription,
  shareImage,
  children,
}: {
  slug: string;
  tabs: TabKey[];
  active: TabKey;
  bgmTracks: Track[];
  shareUrl: string;
  shareTitle: string;
  shareDescription: string;
  shareImage: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 bg-bg/95 backdrop-blur border-b border-border px-4 py-3 flex justify-between items-center z-10">
        <span className="text-xs tracking-widest text-muted">WEDDING</span>
        <div id="topbar-controls" className="flex gap-3 text-sm items-center">
          <BgmPlayer tracks={bgmTracks} />
          <ShareButton
            url={shareUrl}
            title={shareTitle}
            description={shareDescription}
            imageUrl={shareImage}
          />
        </div>
      </header>
      <div className="p-4">{children}</div>
      <TabBar slug={slug} tabs={tabs} active={active} />
    </div>
  );
}
