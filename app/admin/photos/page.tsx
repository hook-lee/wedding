import Link from "next/link";
import { requireUser } from "@/lib/auth/require-user";
import { resolveAdminSite } from "@/lib/db/wedding-site";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatKstDateTime } from "@/lib/date/kst";
import { deleteSharedPhoto } from "./actions";

export default async function SharedPhotosAdmin() {
  const user = await requireUser();
  const site = await resolveAdminSite(user.id);
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("shared_photos")
    .select("*")
    .eq("site_id", site.id)
    .order("created_at", { ascending: false });

  const photos = data ?? [];

  return (
    <main className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5 bg-bg min-h-screen">
      <header className="flex items-center gap-3">
        <Link
          href="/admin"
          className="text-secondary hover:text-ink underline underline-offset-2 text-sm"
        >
          ← 어드민
        </Link>
        <h1 className="text-xl sm:text-2xl font-semibold text-ink">
          하객 사진{" "}
          <span className="text-muted text-base font-normal">({photos.length}장)</span>
        </h1>
      </header>

      {photos.length === 0 ? (
        <p className="text-sm text-muted text-center py-12">아직 올라온 사진이 없어요.</p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((p) => (
            <li
              key={p.id}
              className="bg-surface border border-border rounded-lg overflow-hidden shadow-card"
            >
              <a href={p.url} target="_blank" rel="noreferrer" className="block aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="w-full h-full object-cover" />
              </a>
              <div className="p-2 space-y-1">
                <p className="text-xs text-ink truncate">
                  {p.uploader_name || "이름 없음"}
                </p>
                <p className="text-[10px] text-muted">{formatKstDateTime(p.created_at)}</p>
                <form action={deleteSharedPhoto.bind(null, p.id)}>
                  <button
                    type="submit"
                    className="text-xs text-red-600 hover:text-red-700 underline underline-offset-2 min-h-[32px]"
                  >
                    삭제
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
