import { TabBar } from "./TabBar";
import { BgmPlayer } from "./BgmPlayer";
import type { TabKey } from "../_lib/tabs";

type AudioTrack = { order: number; title: string; artist: string | null; kind?: "audio"; url: string };
type YoutubeTrack = { order: number; title: string; artist: string | null; kind: "youtube"; videoId: string };
type Track = AudioTrack | YoutubeTrack;

export function TabShell({
  slug,
  tabs,
  active,
  bgmTracks,
  children,
}: {
  slug: string;
  tabs: TabKey[];
  active: TabKey;
  bgmTracks: Track[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 bg-bg/90 backdrop-blur-md border-b border-border px-4 py-3 flex justify-between items-center z-10">
        <span className="text-[11px] tracking-[0.5em] text-muted uppercase">
          Wedding
        </span>
        <div id="topbar-controls" className="flex gap-3 items-center text-ink">
          <BgmPlayer tracks={bgmTracks} />
        </div>
      </header>
      <div className="px-4 sm:px-5">{children}</div>
      <TabBar slug={slug} tabs={tabs} active={active} />
    </div>
  );
}
