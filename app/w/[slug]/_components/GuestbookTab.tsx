"use client";
import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { postGuestbook } from "../_actions/guestbook";

type Entry = {
  id: string;
  guest_name: string;
  message: string;
  created_at: string;
};

export function GuestbookTab({
  siteId,
  initial,
}: {
  siteId: string;
  initial: Entry[];
}) {
  const [entries, setEntries] = useState<Entry[]>(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`guestbook:${siteId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "guestbook",
          filter: `site_id=eq.${siteId}`,
        },
        (payload) => {
          setEntries((prev) => {
            const next = payload.new as Entry;
            if (prev.some((e) => e.id === next.id)) return prev;
            return [next, ...prev];
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [siteId]);

  async function handle(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await postGuestbook(siteId, formData);
    setPending(false);
    if (result.error) setError(result.error);
    else formRef.current?.reset();
  }

  return (
    <div className="space-y-4 max-w-md mx-auto py-2">
      <form
        ref={formRef}
        action={handle}
        className="bg-surface border border-border rounded-md p-4 space-y-2 shadow-card"
      >
        <input
          name="name"
          required
          maxLength={30}
          placeholder="이름 또는 애칭"
          className="w-full p-2 rounded-sm border border-border bg-bg text-sm"
        />
        <textarea
          name="message"
          required
          maxLength={200}
          placeholder="축하 메시지 (최대 200자)"
          className="w-full p-2 rounded-sm border border-border bg-bg text-sm h-16"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex justify-end">
          <button
            disabled={pending}
            className="px-4 py-1.5 bg-ink text-bg rounded-pill text-sm"
          >
            {pending ? "남기는 중..." : "남기기"}
          </button>
        </div>
      </form>

      <p className="text-xs text-muted text-center">총 {entries.length}개</p>

      <ul className="space-y-2">
        {entries.map((e) => (
          <li
            key={e.id}
            className="bg-surface border border-border rounded-md p-3 shadow-card"
          >
            <p className="text-sm font-semibold">{e.guest_name}</p>
            <p className="text-sm text-secondary mt-1 whitespace-pre-line">
              {e.message}
            </p>
            <p className="text-xs text-muted mt-1">
              {new Date(e.created_at).toLocaleString("ko-KR")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
