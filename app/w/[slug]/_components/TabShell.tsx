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
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 bg-bg/95 backdrop-blur border-b border-border px-4 py-3 flex justify-between items-center z-10">
        <span className="text-xs tracking-widest text-muted">WEDDING</span>
        <div id="topbar-controls" className="flex gap-3 text-sm items-center">
          <BgmPlayer tracks={bgmTracks} />
        </div>
      </header>
      <div className="p-4">{children}</div>
      <TabBar slug={slug} tabs={tabs} active={active} />
    </div>
  );
}
