import { requireUser } from "@/lib/auth/require-user";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";
import { BasicInfoSection } from "./_components/BasicInfoSection";
import { ParentsSection } from "./_components/ParentsSection";
import { saveAdminForm } from "./actions";
import type { ParentsBlock } from "@/lib/parents/types";

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
        <button type="submit" className="w-full p-3 bg-ink text-bg rounded-pill">
          저장
        </button>
      </form>
    </main>
  );
}
