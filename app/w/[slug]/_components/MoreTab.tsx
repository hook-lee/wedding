import Link from "next/link";
import type { Tables } from "@/lib/supabase/types";
import { VenueView } from "./VenueView";
import { RsvpView } from "./RsvpView";
import { AccountView } from "./AccountView";
import { ProfileView } from "./ProfileView";
import { SponsorView } from "./SponsorView";
import { readExtras, resolveRsvpFields } from "@/lib/extras/types";
import { TAB_LABELS, type PrimaryKey } from "../_lib/tabs";

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
}: {
  site: Tables<"wedding_sites">;
  items: PrimaryKey[];
  sub: PrimaryKey | null;
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
            (site.groom_profile as unknown as { mbti?: string; intro?: string }) ?? {}
          }
          groomName={site.groom_name}
          bride={
            (site.bride_profile as unknown as { mbti?: string; intro?: string }) ?? {}
          }
          brideName={site.bride_name}
        />
      )}
      {active === "sponsor" && <SponsorView extras={extras} />}
    </div>
  );
}
