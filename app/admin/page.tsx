import { requireUser } from "@/lib/auth/require-user";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";
import { BasicInfoSection } from "./_components/BasicInfoSection";
import { ParentsSection } from "./_components/ParentsSection";
import { VenueSection } from "./_components/VenueSection";
import { PhotoSection } from "./_components/PhotoSection";
import { BgmSection } from "./_components/BgmSection";
import { saveAdminForm } from "./actions";
import type { ParentsBlock } from "@/lib/parents/types";

type Track = { order: number; url: string; title: string; artist: string | null };

export default async function AdminHome() {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto space-y-6 bg-bg">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">내 청첩장 편집</h1>
        <form action="/admin/logout" method="POST">
          <button className="text-sm text-secondary underline">로그아웃</button>
        </form>
      </header>
      <p className="text-sm text-secondary">
        로그인됨: <strong className="text-ink">{user.email}</strong>
      </p>

      <form
        action={async (formData) => {
          "use server";
          await saveAdminForm(formData);
        }}
        className="space-y-6"
      >
        <BasicInfoSection site={site} />
        <ParentsSection parents={(site.parents as ParentsBlock) ?? {}} />
        <VenueSection
          name={site.venue_name}
          address={site.venue_address}
          lat={site.venue_lat}
          lng={site.venue_lng}
        />
        <button type="submit" className="w-full p-3 bg-ink text-bg rounded-pill">
          저장
        </button>
      </form>

      <PhotoSection mainUrl={site.main_photo_url} galleryUrls={site.gallery_urls ?? []} />
      <BgmSection tracks={(site.bgm_tracks as unknown as Track[]) ?? []} />
    </main>
  );
}
