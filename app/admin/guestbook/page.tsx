import { requireUser } from "@/lib/auth/require-user";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatKstDateTime } from "@/lib/date/kst";
import { deleteGuestbookEntry } from "./actions";
import Link from "next/link";

export default async function GuestbookAdmin() {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("guestbook").select("*").eq("site_id", site.id)
    .order("created_at", { ascending: false });

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4 bg-bg min-h-screen">
      <header className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">일촌평 ({data?.length ?? 0}개)</h1>
        <Link href="/admin" className="text-sm underline text-secondary">← 어드민</Link>
      </header>
      {(!data || data.length === 0) && (
        <p className="text-sm text-muted text-center py-12">아직 일촌평이 없어요.</p>
      )}
      <ul className="space-y-2">
        {data?.map((e) => (
          <li key={e.id}
              className="bg-surface border border-border rounded-md p-3 flex justify-between gap-3 shadow-card">
            <div className="flex-1">
              <p className="text-sm font-semibold">{e.guest_name}</p>
              <p className="text-sm text-secondary whitespace-pre-line">{e.message}</p>
              <p className="text-xs text-muted mt-1">{formatKstDateTime(e.created_at)}</p>
            </div>
            <form action={deleteGuestbookEntry.bind(null, e.id)}>
              <button className="text-xs text-red-600 self-start">삭제</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
