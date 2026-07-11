import { ParentsLine } from "./ParentsLine";
import { StoryTab } from "./StoryTab";
import { GalleryTab } from "./GalleryTab";
import { GuestbookTab } from "./GuestbookTab";
import { VenueView } from "./VenueView";
import { RsvpView } from "./RsvpView";
import { AccountView } from "./AccountView";
import { ProfileView } from "./ProfileView";
import { InfoView } from "./InfoView";
import { FlowerDeclineView } from "./FlowerDeclineView";
import { RsvpPromptModal } from "./RsvpPromptModal";
import { Reveal } from "./Reveal";
import { Countdown } from "./Countdown";
import { Calendar } from "./Calendar";
import { Icon } from "./Icon";
import { daysUntil } from "@/lib/date/dday";
import { formatKstDateTime } from "@/lib/date/kst";
import type { Tables } from "@/lib/supabase/types";
import type { ParentsBlock } from "@/lib/parents/types";
import {
  readExtras,
  flowerDeclineNoteOrDefault,
  resolveSectionOrder,
  resolveRsvpFields,
  isHomeVisible,
  type SectionKey,
} from "@/lib/extras/types";

type Profile = { mbti?: string; intro?: string };
type StoryItem = { date: string; title: string; body: string; photo_url?: string };
type GuestbookEntry = {
  id: string;
  guest_name: string;
  message: string;
  reply: string | null;
  created_at: string;
};
type IconName = React.ComponentProps<typeof Icon>["name"];

type Props = {
  site: Tables<"wedding_sites">;
  initialGuestbook: GuestbookEntry[];
};

function SectionTitle({
  icon,
  label,
  anchor,
}: {
  icon: IconName;
  label: string;
  anchor: string;
}) {
  return (
    <div id={anchor} className="flex items-center gap-2 pt-10 pb-4 scroll-mt-16">
      <Icon name={icon} className="w-4 h-4 text-secondary" />
      <h2 className="text-base font-semibold tracking-wide">{label}</h2>
      <span className="flex-1 h-px bg-border" />
    </div>
  );
}

export function HomeTab({ site, initialGuestbook }: Props) {
  const dday = site.wedding_at ? daysUntil(site.wedding_at) : null;
  const dateText = site.wedding_at ? formatKstDateTime(site.wedding_at) : "";
  const parents = (site.parents as unknown as ParentsBlock) ?? {};
  const enabled = (site.sections_enabled as unknown as Record<string, boolean>) ?? {};
  const greetingVideoId = site.greeting_video_id ?? "";
  const extras = readExtras(site.extras);
  const hasInfoItems = (extras.info_items?.length ?? 0) > 0;
  const showFlowerDecline = extras.flower_decline === true;
  const namesText = `${site.groom_name}${site.name_joiner}${site.bride_name}`;
  const groomProfile = (site.groom_profile as unknown as Profile) ?? {};
  const brideProfile = (site.bride_profile as unknown as Profile) ?? {};

  return (
    <div className="space-y-2">
      {enabled.rsvp && extras.rsvp_prompt_enabled && (
        <RsvpPromptModal
          slug={site.slug}
          siteId={site.id}
          namesText={namesText}
          dateText={dateText}
          venueName={site.venue_name}
          fields={resolveRsvpFields(extras)}
        />
      )}
      {/* === 메인 === */}
      <div id="main" className="text-center space-y-4 pt-4">
        {dday !== null && dday >= 0 && (
          <Reveal>
            <span className="inline-block bg-ink text-bg px-3 py-1 rounded-pill text-xs tracking-widest">
              D - {dday}
            </span>
          </Reveal>
        )}
        {site.main_photo_url && (
          <Reveal delay={100}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.main_photo_url}
              alt=""
              className="w-full max-w-xs mx-auto aspect-[4/5] object-cover rounded-sm"
            />
          </Reveal>
        )}
        <Reveal delay={200}>
          <h1 className="text-xl font-medium">
            {site.groom_name}
            {site.name_joiner}
            {site.bride_name}
          </h1>
        </Reveal>
        {dateText && (
          <Reveal delay={250}>
            <p className="text-sm text-muted tracking-widest">{dateText}</p>
          </Reveal>
        )}
        {(site.venue_name || site.venue_address) && (
          <Reveal delay={300}>
            <div className="text-sm text-secondary leading-relaxed">
              <p className="flex items-center justify-center gap-1">
                <Icon name="pin" className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{site.venue_name || site.venue_address}</span>
              </p>
              {site.venue_name && site.venue_address && <p>{site.venue_address}</p>}
            </div>
          </Reveal>
        )}

        {/* === 인사말 영상 (선택) === */}
        {greetingVideoId && (
          <Reveal delay={320}>
            <div className="max-w-sm mx-auto aspect-video rounded-md overflow-hidden shadow-card">
              <iframe
                src={`https://www.youtube.com/embed/${greetingVideoId}?modestbranding=1&rel=0&playsinline=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="인사말 영상"
              />
            </div>
          </Reveal>
        )}

        {site.greeting && (
          <Reveal delay={350}>
            <p className="text-sm text-secondary whitespace-pre-line max-w-xs mx-auto leading-relaxed pt-2">
              {site.greeting}
            </p>
          </Reveal>
        )}
        <Reveal delay={400}>
          <div className="space-y-2 pt-4 border-t border-border max-w-xs mx-auto">
            <ParentsLine
              father={parents.groom_father}
              mother={parents.groom_mother}
              childLabel={site.groom_birth_order ?? "장남"}
              childName={site.groom_name}
              roleLabel="신랑"
              profile={groomProfile}
            />
            <ParentsLine
              father={parents.bride_father}
              mother={parents.bride_mother}
              childLabel={site.bride_birth_order ?? "장녀"}
              childName={site.bride_name}
              roleLabel="신부"
              profile={brideProfile}
            />
          </div>
        </Reveal>
      </div>

      {/* === 아래 섹션들은 어드민의 "섹션 순서" 드래그로 순서가 바뀔 수 있다 === */}
      {(() => {
        const sections: Record<SectionKey, { visible: boolean; node: React.ReactNode }> = {
          calendar: {
            visible: !!site.wedding_at,
            node: (
              <Reveal key="calendar">
                <SectionTitle icon="calendar" label="캘린더" anchor="calendar" />
                <Calendar weddingAt={site.wedding_at!} slug={site.slug} />
                <div className="mt-6">
                  <Countdown targetIso={site.wedding_at!} />
                </div>
              </Reveal>
            ),
          },
          story: {
            visible: !!enabled.story,
            node: (
              <Reveal key="story">
                <SectionTitle icon="book" label="우리 스토리" anchor="story" />
                <StoryTab items={(site.story_items as unknown as StoryItem[]) ?? []} />
              </Reveal>
            ),
          },
          gallery: {
            visible: !!enabled.gallery,
            node: (
              <Reveal key="gallery">
                <SectionTitle icon="image" label="사진첩" anchor="gallery" />
                <GalleryTab urls={site.gallery_urls ?? []} />
              </Reveal>
            ),
          },
          guestbook: {
            visible: !!enabled.guestbook,
            node: (
              <Reveal key="guestbook">
                <SectionTitle icon="chat" label="방명록" anchor="guestbook" />
                <GuestbookTab siteId={site.id} initial={initialGuestbook} />
              </Reveal>
            ),
          },
          info: {
            visible: true,
            node: (
              <Reveal key="info">
                <SectionTitle icon="pin" label="오시는길" anchor="info" />
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
              </Reveal>
            ),
          },
          extras_info: {
            visible: hasInfoItems,
            node: (
              <Reveal key="extras_info">
                <SectionTitle icon="clipboard" label="예식 정보 및 안내사항" anchor="extras-info" />
                <InfoView items={extras.info_items ?? []} />
              </Reveal>
            ),
          },
          rsvp: {
            visible: !!enabled.rsvp,
            node: (
              <Reveal key="rsvp">
                <SectionTitle icon="clipboard" label="참석 의사" anchor="rsvp" />
                <RsvpView siteId={site.id} fields={resolveRsvpFields(extras)} />
              </Reveal>
            ),
          },
          account: {
            visible: !!enabled.account,
            node: (
              <Reveal key="account">
                <SectionTitle icon="heart" label="마음 전하기" anchor="account" />
                <AccountView
                  info={
                    (site.account_info as unknown as Parameters<
                      typeof AccountView
                    >[0]["info"]) ?? {}
                  }
                />
                {showFlowerDecline && (
                  <div className="pt-4">
                    <FlowerDeclineView note={flowerDeclineNoteOrDefault(extras)} />
                  </div>
                )}
              </Reveal>
            ),
          },
          profile: {
            visible: !!enabled.profile,
            node: (
              <Reveal key="profile">
                <SectionTitle icon="user" label="신랑·신부 프로필" anchor="profile" />
                <ProfileView
                  groom={groomProfile}
                  groomName={site.groom_name}
                  bride={brideProfile}
                  brideName={site.bride_name}
                />
              </Reveal>
            ),
          },
        };

        return resolveSectionOrder(extras).map((key) =>
          sections[key].visible && isHomeVisible(extras, key) ? sections[key].node : null,
        );
      })()}

      <div className="h-16" />
    </div>
  );
}
