import Link from "next/link";
import { requireUser } from "@/lib/auth/require-user";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LinkButton } from "@/app/_ui/Button";

export default async function RsvpAdmin() {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("rsvp")
    .select("*")
    .eq("site_id", site.id)
    .order("created_at", { ascending: false });

  const all = data ?? [];
  const attending = all.filter((r) => r.attending);
  const totalGuests = attending.reduce((sum, r) => sum + r.party_size, 0);

  return (
    <main className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5 bg-bg min-h-screen">
      <header className="flex justify-between items-center gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-secondary hover:text-ink underline underline-offset-2 text-sm"
          >
            ← 어드민
          </Link>
          <h1 className="text-xl sm:text-2xl font-semibold text-ink">RSVP</h1>
        </div>
        <LinkButton
          href="/admin/rsvp/csv"
          download
          variant="primary"
          className="px-4 text-sm"
        >
          CSV 다운로드
        </LinkButton>
      </header>

      <div className="bg-surface border border-border rounded-lg p-4 sm:p-5 grid grid-cols-3 gap-3 sm:gap-4 text-center shadow-card">
        <div className="space-y-1">
          <p className="text-xs text-muted">전체 응답</p>
          <p className="text-2xl sm:text-3xl font-semibold text-ink tabular-nums">
            {all.length}
          </p>
        </div>
        <div className="space-y-1 border-x border-border">
          <p className="text-xs text-muted">참석</p>
          <p className="text-2xl sm:text-3xl font-semibold text-ink tabular-nums">
            {attending.length}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted">총 인원</p>
          <p className="text-2xl sm:text-3xl font-semibold text-ink tabular-nums">
            {totalGuests}
          </p>
        </div>
      </div>

      {all.length === 0 ? (
        <p className="text-sm text-muted text-center py-12">아직 응답이 없어요.</p>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-x-auto shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-bg/50">
              <tr className="text-secondary">
                <th className="p-3 text-left font-medium">이름</th>
                <th className="p-3 text-center font-medium">참석</th>
                <th className="p-3 text-center font-medium">인원</th>
                <th className="p-3 text-left font-medium">연락처</th>
                <th className="p-3 text-left font-medium">메시지</th>
              </tr>
            </thead>
            <tbody>
              {all.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-border hover:bg-bg/40 transition-colors"
                >
                  <td className="p-3 text-ink">{r.guest_name}</td>
                  <td className="p-3 text-center">
                    {r.attending ? (
                      <span className="text-green-700">✓</span>
                    ) : (
                      <span className="text-muted">✗</span>
                    )}
                  </td>
                  <td className="p-3 text-center text-ink tabular-nums">{r.party_size}</td>
                  <td className="p-3 text-secondary">{r.phone ?? "-"}</td>
                  <td className="p-3 text-secondary">{r.message ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
