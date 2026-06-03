import { requireUser } from "@/lib/auth/require-user";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function RsvpAdmin() {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("rsvp").select("*").eq("site_id", site.id)
    .order("created_at", { ascending: false });

  const all = data ?? [];
  const attending = all.filter((r) => r.attending);
  const totalGuests = attending.reduce((sum, r) => sum + r.party_size, 0);

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4 bg-bg min-h-screen">
      <header className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">RSVP</h1>
        <div className="flex gap-3 items-center">
          <Link href="/admin" className="text-sm underline text-secondary">← 어드민</Link>
          <a href="/admin/rsvp/csv" download
            className="text-sm px-3 py-1.5 bg-ink text-bg rounded-pill">CSV 다운로드</a>
        </div>
      </header>

      <div className="bg-surface border border-border rounded-md p-4 grid grid-cols-3 gap-3 text-center shadow-card">
        <div>
          <p className="text-xs text-muted">전체 응답</p>
          <p className="text-2xl font-semibold">{all.length}</p>
        </div>
        <div>
          <p className="text-xs text-muted">참석</p>
          <p className="text-2xl font-semibold">{attending.length}</p>
        </div>
        <div>
          <p className="text-xs text-muted">총 인원</p>
          <p className="text-2xl font-semibold">{totalGuests}</p>
        </div>
      </div>

      {all.length === 0 && (
        <p className="text-sm text-muted text-center py-12">아직 응답이 없어요.</p>
      )}

      {all.length > 0 && (
        <div className="bg-surface border border-border rounded-md overflow-x-auto shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-bg">
              <tr>
                <th className="p-2 text-left">이름</th>
                <th className="p-2">참석</th>
                <th className="p-2">인원</th>
                <th className="p-2 text-left">연락처</th>
                <th className="p-2 text-left">메시지</th>
              </tr>
            </thead>
            <tbody>
              {all.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-2">{r.guest_name}</td>
                  <td className="p-2 text-center">{r.attending ? "✓" : "✗"}</td>
                  <td className="p-2 text-center">{r.party_size}</td>
                  <td className="p-2 text-secondary">{r.phone ?? "-"}</td>
                  <td className="p-2 text-secondary">{r.message ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
