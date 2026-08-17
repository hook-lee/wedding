import Link from "next/link";
import type { Tables } from "@/lib/supabase/types";
import { VenueView } from "./VenueView";
import { RsvpView } from "./RsvpView";
import { AccountView } from "./AccountView";
import { ProfileView } from "./ProfileView";
import { SponsorView } from "./SponsorView";
import { PhotoShareView } from "./PhotoShareView";
import { StoryTab } from "./StoryTab";
import { GalleryTab } from "./GalleryTab";
import { GuestbookTab } from "./GuestbookTab";
import {
  readExtras,
  resolveRsvpFields,
  resolveGuestbookFields,
  resolveMapApps,
  resolveGalleryStyle,
  resolvePhotoShare,
  isPhotoShareOpen,
} from "@/lib/extras/types";
import { TAB_LABELS, type PrimaryKey } from "../_lib/tabs";

type StoryItem = {
  date: string;
  title: string;
  body: string;
  photo_url?: string;
  photo_position?: { x: number; y: number };
};
type GuestbookEntry = {
  id: string;
  guest_name: string;
  message: string;
  reply: string | null;
  phone: string | null;
  guest_side: "groom" | "bride" | null;
  relationship: string | null;
  created_at: string;
};
type SharedPhoto = { id: string; url: string; uploader_name: string | null };

/**
 * Catch-all "더보기" tab: whatever content the couple didn't pin to the
 * bottom bar (via the admin's "하단 탭바 구성" picker) shows up here as a
 * small pill sub-nav instead. `items` is already resolved by visibleTabs()
 * to exclude anything promoted to a primary tab.
 */
export function MoreTab({
  site,
  items,
  sub,
  initialGuestbook = [],
  initialSharedPhotos = [],
}: {
  site: Tables<"wedding_sites">;
  items: PrimaryKey[];
  sub: PrimaryKey | null;
  initialGuestbook?: GuestbookEntry[];
  initialSharedPhotos?: SharedPhoto[];
}) {
  const extras = readExtras(site.extras);
  const active: PrimaryKey | null =
    sub && items.includes(sub) ? sub : (items[0] ?? null);

  if (!active) return null;

  return (
    <div className="space-y-4">
      <nav className="flex gap-2 overflow-x-auto pb-1">
        {items.map((k) => (
          <Link
            key={k}
            href={`/w/${site.slug}?tab=more&sub=${k}`}
            className={`px-3 py-1 rounded-pill text-xs whitespace-nowrap ${
              active === k ? "bg-ink text-bg" : "bg-bg border border-border"
            }`}
          >
            {TAB_LABELS[k].label}
          </Link>
        ))}
      </nav>
      {/* story / gallery / guestbook were missing here: the pill nav listed
          them but nothing rendered, so picking one showed an empty tab.
          Every PrimaryKey needs a branch — anything not pinned to the bottom
          bar lands in 더보기. */}
      {active === "story" && (
        <StoryTab items={(site.story_items as unknown as StoryItem[]) ?? []} />
      )}
      {active === "gallery" && (
        <GalleryTab urls={site.gallery_urls ?? []} style={resolveGalleryStyle(extras)} />
      )}
      {active === "guestbook" && (
        <GuestbookTab
          siteId={site.id}
          initial={initialGuestbook}
          fields={resolveGuestbookFields(extras)}
        />
      )}
      {active === "venue" && (
        <VenueView
          venue={{
            name: site.venue_name,
            address: site.venue_address,
            lat: site.venue_lat,
            lng: site.venue_lng,
          }}
          parking={{
            name: site.parking_name ?? "",
            address: site.parking_address ?? "",
            lat: site.parking_lat ?? null,
            lng: site.parking_lng ?? null,
          }}
          transitSubway={extras.transit_subway}
          transitBus={extras.transit_bus}
          parkingNotes={extras.parking_notes}
          mapApps={resolveMapApps(extras)}
        />
      )}
      {active === "rsvp" && (
        <RsvpView siteId={site.id} fields={resolveRsvpFields(extras)} />
      )}
      {active === "account" && (
        <AccountView
          info={
            (site.account_info as unknown as Parameters<
              typeof AccountView
            >[0]["info"]) ?? {}
          }
        />
      )}
      {active === "profile" && (
        <ProfileView
          groom={
            (site.groom_profile as unknown as {
              mbti?: string;
              intro?: string;
              photo_url?: string;
            }) ?? {}
          }
          groomName={site.groom_name}
          bride={
            (site.bride_profile as unknown as {
              mbti?: string;
              intro?: string;
              photo_url?: string;
            }) ?? {}
          }
          brideName={site.bride_name}
        />
      )}
      {active === "sponsor" && <SponsorView extras={extras} />}
      {active === "photo_share" && (
        <PhotoShareView
          slug={site.slug}
          initial={initialSharedPhotos}
          isOpen={isPhotoShareOpen(resolvePhotoShare(extras), site.wedding_at)}
          weddingAt={site.wedding_at}
          note={resolvePhotoShare(extras).note}
        />
      )}
    </div>
  );
}
