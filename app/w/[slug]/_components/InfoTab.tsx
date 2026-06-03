import Link from "next/link";
import type { Tables } from "@/lib/supabase/types";
import { VenueView } from "./VenueView";
import { RsvpView } from "./RsvpView";
import { AccountView } from "./AccountView";
import { ProfileView } from "./ProfileView";

type SubKey = "venue" | "rsvp" | "account" | "profile";
const SUB_LABELS: Record<SubKey, string> = {
  venue: "오시는길",
  rsvp: "RSVP",
  account: "마음전하기",
  profile: "프로필",
};

export function InfoTab({
  site,
  sub,
}: {
  site: Tables<"wedding_sites">;
  sub: SubKey | null;
}) {
  const enabled =
    (site.sections_enabled as unknown as Record<string, boolean>) ?? {};
  const subs: SubKey[] = ["venue"];
  if (enabled.rsvp) subs.push("rsvp");
  if (enabled.account) subs.push("account");
  if (enabled.profile) subs.push("profile");

  const active: SubKey = sub && subs.includes(sub) ? sub : "venue";

  return (
    <div className="space-y-4">
      <nav className="flex gap-2 overflow-x-auto pb-1">
        {subs.map((s) => (
          <Link
            key={s}
            href={`/w/${site.slug}?tab=info&sub=${s}`}
            className={`px-3 py-1 rounded-pill text-xs whitespace-nowrap ${
              active === s
                ? "bg-ink text-bg"
                : "bg-bg border border-border"
            }`}
          >
            {SUB_LABELS[s]}
          </Link>
        ))}
      </nav>
      {active === "venue" && (
        <VenueView
          name={site.venue_name}
          address={site.venue_address}
          lat={site.venue_lat}
          lng={site.venue_lng}
        />
      )}
      {active === "rsvp" && <RsvpView siteId={site.id} />}
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
            }) ?? {}
          }
          groomName={site.groom_name}
          bride={
            (site.bride_profile as unknown as {
              mbti?: string;
              intro?: string;
            }) ?? {}
          }
          brideName={site.bride_name}
        />
      )}
    </div>
  );
}
