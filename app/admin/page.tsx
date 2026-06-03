import Link from "next/link";
import { requireUser } from "@/lib/auth/require-user";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";
import { AdminForm } from "./_components/AdminForm";
import { BasicInfoSection } from "./_components/BasicInfoSection";
import { ParentsSection } from "./_components/ParentsSection";
import { VenueSection } from "./_components/VenueSection";
import { PhotoSection } from "./_components/PhotoSection";
import { BgmSection } from "./_components/BgmSection";
import { GreetingSection } from "./_components/GreetingSection";
import { ProfileSection } from "./_components/ProfileSection";
import { StorySection } from "./_components/StorySection";
import { AccountSection } from "./_components/AccountSection";
import { ThemeSection } from "./_components/ThemeSection";
import type { ParentsBlock } from "@/lib/parents/types";

type Track = { order: number; url: string; title: string; artist: string | null };
type Profile = { mbti?: string; intro?: string };
type StoryItem = { date: string; title: string; body: string };
type Acc = { bank?: string; account?: string; holder?: string } | null;
type AccountInfo = {
  groom?: { self?: Acc; father?: Acc; mother?: Acc };
  bride?: { self?: Acc; father?: Acc; mother?: Acc };
};

export default async function AdminHome() {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto space-y-6 bg-bg">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">내 청첩장 편집</h1>
        <div className="flex gap-3 items-center">
          <Link href="/admin/guestbook" className="text-sm underline text-secondary">일촌평</Link>
          <Link href="/admin/rsvp" className="text-sm underline text-secondary">RSVP</Link>
          <form action="/admin/logout" method="POST">
            <button className="text-sm text-secondary underline">로그아웃</button>
          </form>
        </div>
      </header>
      <p className="text-sm text-secondary">
        로그인됨: <strong className="text-ink">{user.email}</strong>
      </p>

      {site.slug && !site.slug.startsWith("draft-") && (
        <div className="bg-surface border border-border rounded-md p-3 flex justify-between items-center">
          <p className="text-sm">
            내 청첩장: <code className="font-mono">/w/{site.slug}</code>
          </p>
          <a
            href={`/w/${site.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm underline"
          >
            미리보기 ↗
          </a>
        </div>
      )}

      <AdminForm>
        <BasicInfoSection site={site} />
        <ParentsSection
          parents={(site.parents as ParentsBlock) ?? {}}
          groomBirthOrder={site.groom_birth_order ?? "장남"}
          brideBirthOrder={site.bride_birth_order ?? "장녀"}
        />
        <VenueSection
          name={site.venue_name}
          address={site.venue_address}
          lat={site.venue_lat}
          lng={site.venue_lng}
        />
        <GreetingSection site={site} />
        <ProfileSection
          groom={(site.groom_profile as unknown as Profile) ?? {}}
          bride={(site.bride_profile as unknown as Profile) ?? {}}
        />
        <StorySection items={(site.story_items as unknown as StoryItem[]) ?? []} />
        <AccountSection info={(site.account_info as unknown as AccountInfo) ?? {}} />
        <ThemeSection
          theme={site.theme}
          sectionsEnabled={(site.sections_enabled as unknown as Record<string, boolean>) ?? {}}
          published={site.published}
        />
      </AdminForm>

      <PhotoSection mainUrl={site.main_photo_url} galleryUrls={site.gallery_urls ?? []} />
      <BgmSection tracks={(site.bgm_tracks as unknown as Track[]) ?? []} />
    </main>
  );
}
