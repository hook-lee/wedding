"use client";
import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatKstDateTime } from "@/lib/date/kst";
import { postGuestbook } from "../_actions/guestbook";
import { Card } from "@/app/_ui/Card";
import { Field } from "@/app/_ui/Field";
import { Input } from "@/app/_ui/Input";
import { Textarea } from "@/app/_ui/Textarea";
import { Button } from "@/app/_ui/Button";

type Entry = {
  id: string;
  guest_name: string;
  message: string;
  reply: string | null;
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
      // 신랑신부가 어드민에서 답글을 남기면(=UPDATE) 보고 있는 방문자 화면에도 바로 반영
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "guestbook",
          filter: `site_id=eq.${siteId}`,
        },
        (payload) => {
          const next = payload.new as Entry;
          setEntries((prev) => prev.map((e) => (e.id === next.id ? next : e)));
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
      <form ref={formRef} action={handle}>
        <Card className="space-y-3">
          <Field label="이름">
            <Input name="name" required maxLength={30} placeholder="이름" />
          </Field>
          <Field label="축하 메시지" hint="최대 200자">
            <Textarea
              name="message"
              required
              maxLength={200}
              rows={3}
              placeholder="축하 메시지를 남겨주세요"
            />
          </Field>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={pending} variant="primary">
              {pending ? "남기는 중..." : "남기기"}
            </Button>
          </div>
        </Card>
      </form>

      <p className="text-xs text-muted text-center">총 {entries.length}개</p>

      <ul className="space-y-2">
        {entries.map((e) => (
          <li key={e.id}>
            <Card className="p-4 sm:p-5 space-y-1">
              <p className="text-sm font-semibold text-ink">{e.guest_name}</p>
              <p className="text-sm text-secondary whitespace-pre-line">
                {e.message}
              </p>
              <p className="text-xs text-muted pt-1">
                {formatKstDateTime(e.created_at)}
              </p>
              {e.reply && (
                <div className="mt-2 ml-3 pl-3 border-l-2 border-accent/40 space-y-0.5">
                  <p className="text-xs text-accent font-medium">신랑신부 답글</p>
                  <p className="text-sm text-ink whitespace-pre-line">{e.reply}</p>
                </div>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
