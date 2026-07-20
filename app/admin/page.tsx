import Link from "next/link";
import { requireUser } from "@/lib/auth/require-user";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";
import { AdminWorkspace } from "./_components/AdminWorkspace";
import { BasicInfoSection } from "./_components/BasicInfoSection";
import { ParentsSection } from "./_components/ParentsSection";
import { VenueSection } from "./_components/VenueSection";
import { PhotoSection } from "./_components/PhotoSection";
import { BgmSection } from "./_components/BgmSection";
import { GreetingSection } from "./_components/GreetingSection";
import { ProfileSection } from "./_components/ProfileSection";
import { StorySection } from "./_components/StorySection";
import { AccountSection } from "./_components/AccountSection";
import { TransitParkingSection } from "./_components/TransitParkingSection";
import { InfoItemsSection } from "./_components/InfoItemsSection";
import { FlowerDeclineSection } from "./_components/FlowerDeclineSection";
import { ThemeSection } from "./_components/ThemeSection";
import { SectionOrderSection } from "./_components/SectionOrderSection";
import { TabOrderSection } from "./_components/TabOrderSection";
import { RsvpFieldsSection } from "./_components/RsvpFieldsSection";
import { GuestbookFieldsSection } from "./_components/GuestbookFieldsSection";
import { SponsorSection } from "./_components/SponsorSection";
import type { ParentsBlock } from "@/lib/parents/types";
import {
  readExtras,
  resolveSectionOrder,
  resolveRsvpFields,
  resolveGuestbookFields,
  isHomeVisible,
  type SectionKey,
} from "@/lib/extras/types";
import { enabledPrimaryKeys, resolvePrimaryTabs } from "@/app/w/[slug]/_lib/tabs";

type Track = { order: number; url: string; title: string; artist: string | null };
type Profile = { mbti?: string; intro?: string; photo_url?: string };
type StoryItem = {
  date: string;
  title: string;
  body: string;
  photo_url?: string;
  photo_position?: { x: number; y: number };
};
type Acc = { bank?: string; account?: string; holder?: string } | null;
type AccountInfo = {
  groom?: { self?: Acc; father?: Acc; mother?: Acc };
  bride?: { self?: Acc; father?: Acc; mother?: Acc };
};

export default async function AdminHome() {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);
  const isLive = site.slug && !site.slug.startsWith("draft-");
  const extras = readExtras(site.extras);
  const sectionsEnabled =
    (site.sections_enabled as unknown as Record<string, boolean>) ?? {};
  const primaryTabsInitial = resolvePrimaryTabs(
    extras.primary_tabs,
    enabledPrimaryKeys(sectionsEnabled),
  );
  const sectionOrder = resolveSectionOrder(extras);
  const sectionVisible = Object.fromEntries(
    sectionOrder.map((k) => [k, isHomeVisible(extras, k)]),
  ) as Record<SectionKey, boolean>;

  return (
    <main className="min-h-screen p-4 sm:p-6 max-w-6xl mx-auto space-y-5 bg-bg">
      <header className="max-w-3xl mx-auto lg:mx-0 lg:max-w-none space-y-3">
        <div className="flex justify-between items-start gap-3 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-ink">내 청첩장 편집</h1>
            <p className="text-xs text-muted">
              로그인됨: <span className="text-secondary">{user.email}</span>
            </p>
          </div>
          <nav className="flex gap-4 items-center text-sm">
            <Link
              href="/admin/guestbook"
              className="text-secondary hover:text-ink underline underline-offset-2"
            >
              방명록
            </Link>
            <Link
              href="/admin/rsvp"
              className="text-secondary hover:text-ink underline underline-offset-2"
            >
              RSVP
            </Link>
            <form action="/admin/logout" method="POST" className="m-0">
              <button
                type="submit"
                className="text-secondary hover:text-ink underline underline-offset-2"
              >
                로그아웃
              </button>
            </form>
          </nav>
        </div>

        {isLive && (
          <div className="bg-surface border border-border rounded-lg p-4 flex justify-between items-center gap-3 shadow-card">
            <div className="min-w-0">
              <p className="text-xs text-muted">내 청첩장 주소</p>
              <p className="text-sm font-mono text-ink truncate">/w/{site.slug}</p>
            </div>
            <a
              href={`/w/${site.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-ink underline underline-offset-2 hover:opacity-80 whitespace-nowrap"
            >
              미리보기 ↗
            </a>
          </div>
        )}
      </header>

      <AdminWorkspace site={site}>
        <BasicInfoSection site={site} shareTitleSuffix={extras.share_title_suffix ?? ""} />
        <ParentsSection
          parents={(site.parents as ParentsBlock) ?? {}}
          groomBirthOrder={site.groom_birth_order ?? "장남"}
          brideBirthOrder={site.bride_birth_order ?? "장녀"}
        />
        <VenueSection
          venueName={site.venue_name}
          venueAddress={site.venue_address}
          venueLat={site.venue_lat}
          venueLng={site.venue_lng}
          parkingName={site.parking_name ?? ""}
          parkingAddress={site.parking_address ?? ""}
          parkingLat={site.parking_lat ?? null}
          parkingLng={site.parking_lng ?? null}
        />
        <TransitParkingSection extras={extras} />
        <InfoItemsSection items={extras.info_items ?? []} />
        <GreetingSection site={site} />
        <ProfileSection
          groom={(site.groom_profile as unknown as Profile) ?? {}}
          bride={(site.bride_profile as unknown as Profile) ?? {}}
        />
        <StorySection items={(site.story_items as unknown as StoryItem[]) ?? []} />
        <GuestbookFieldsSection fields={resolveGuestbookFields(extras)} />
        <RsvpFieldsSection
          fields={resolveRsvpFields(extras)}
          promptEnabled={extras.rsvp_prompt_enabled ?? false}
        />
        <AccountSection info={(site.account_info as unknown as AccountInfo) ?? {}} />
        <FlowerDeclineSection
          enabled={extras.flower_decline ?? false}
          note={extras.flower_decline_note ?? ""}
        />
        <SponsorSection
          title={extras.sponsor_title ?? "sponsored_by"}
          logos={extras.sponsor_logos ?? []}
          slogan={extras.sponsor_slogan ?? ""}
        />
        <SectionOrderSection
          order={sectionOrder}
          visible={sectionVisible}
          sectionsEnabled={sectionsEnabled}
        />
        <TabOrderSection initial={primaryTabsInitial} />
        <ThemeSection
          theme={site.theme}
          sectionsEnabled={sectionsEnabled}
          published={site.published}
        />
      </AdminWorkspace>

      <div className="max-w-3xl mx-auto lg:mx-0 space-y-5">
        <PhotoSection mainUrl={site.main_photo_url} galleryUrls={site.gallery_urls ?? []} />
        <BgmSection tracks={(site.bgm_tracks as unknown as Track[]) ?? []} />
      </div>
    </main>
  );
}
