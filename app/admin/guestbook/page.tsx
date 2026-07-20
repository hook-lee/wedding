import Link from "next/link";
import { requireUser } from "@/lib/auth/require-user";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatKstDateTime } from "@/lib/date/kst";
import { deleteGuestbookEntry, saveGuestbookReply } from "./actions";

export default async function GuestbookAdmin() {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("guestbook")
    .select("*")
    .eq("site_id", site.id)
    .order("created_at", { ascending: false });

  const entries = data ?? [];

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
          방명록{" "}
          <span className="text-muted text-base font-normal">({entries.length}개)</span>
        </h1>
      </header>

      {entries.length === 0 ? (
        <p className="text-sm text-muted text-center py-12">아직 방명록이 없어요.</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => (
            <li
              key={e.id}
              className="bg-surface border border-border rounded-lg p-4 space-y-3 shadow-card"
            >
              <div className="flex justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-semibold text-ink">
                    {e.guest_name}
                    {(e.guest_side || e.relationship) && (
                      <span className="text-xs text-muted font-normal">
                        {" "}
                        ·{" "}
                        {[
                          e.guest_side === "groom"
                            ? "신랑측"
                            : e.guest_side === "bride"
                              ? "신부측"
                              : null,
                          e.relationship,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-secondary whitespace-pre-line leading-relaxed">
                    {e.message}
                  </p>
                  <p className="text-xs text-muted pt-1">
                    {formatKstDateTime(e.created_at)}
                    {e.phone && <span> · {e.phone}</span>}
                  </p>
                </div>
                <form action={deleteGuestbookEntry.bind(null, e.id)} className="self-start">
                  <button
                    type="submit"
                    className="text-xs text-red-600 hover:text-red-700 underline underline-offset-2 min-h-[32px] px-2"
                    aria-label={`${e.guest_name} 방명록 삭제`}
                  >
                    삭제
                  </button>
                </form>
              </div>

              <form
                action={saveGuestbookReply.bind(null, e.id)}
                className="flex items-start gap-2 pl-3 border-l-2 border-border"
              >
                <textarea
                  name="reply"
                  defaultValue={e.reply ?? ""}
                  maxLength={200}
                  rows={1}
                  placeholder="답글 남기기 (신랑신부만 볼 수 있는 게 아니라 방문자 전체에게 공개돼요)"
                  className="flex-1 text-sm bg-bg border border-border rounded-md px-3 py-2 text-ink placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-ink/15"
                />
                <button
                  type="submit"
                  className="text-xs text-ink bg-bg border border-border rounded-md px-3 min-h-[36px] hover:bg-surface"
                >
                  {e.reply ? "수정" : "답글"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
