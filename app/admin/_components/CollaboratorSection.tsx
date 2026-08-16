"use client";
import { useState, useTransition } from "react";
import { Card, CardHeader } from "@/app/_ui/Card";
import { Button } from "@/app/_ui/Button";
import { generateInvite, kickCollaborator } from "@/app/admin/collaborators/actions";
import type { Collaborator } from "@/lib/db/collaborators";

export function CollaboratorSection({
  isOwner,
  collaborators,
  ownerEmail,
}: {
  isOwner: boolean;
  collaborators: Collaborator[];
  ownerEmail: string | null;
}) {
  // Everything here calls the server action directly from an onClick rather
  // than through a <form>. This card renders inside the admin's main save
  // form, and nested <form> elements are invalid HTML — the browser drops the
  // inner one, so a nested submit button would trigger a full site save
  // instead of the invite action.
  const [pending, startTransition] = useTransition();
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function makeInvite() {
    setError(null);
    startTransition(async () => {
      const result = await generateInvite(null);
      if (result.error) setError(result.error);
      else setCode(result.code ?? null);
    });
  }

  const link =
    code && typeof window !== "undefined"
      ? `${window.location.origin}/invite/${code}`
      : null;

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — the input below is still selectable */
    }
  }

  return (
    <Card>
      <CardHeader
        title="함께 만들기"
        hint="신랑·신부가 각자 계정으로 같은 청첩장을 편집할 수 있어요."
      />

      <div className="space-y-2">
        <p className="text-sm text-secondary font-medium">참여 중</p>
        <div className="flex items-center gap-2 p-3 bg-bg rounded-md min-h-[44px]">
          <span className="text-sm text-ink truncate flex-1">
            {ownerEmail ?? "나"}
          </span>
          <span className="text-[11px] text-muted flex-shrink-0">만든 사람</span>
        </div>
        {collaborators.map((c) => (
          <div
            key={c.user_id}
            className="flex items-center gap-2 p-3 bg-bg rounded-md min-h-[44px]"
          >
            <span className="text-sm text-ink truncate flex-1">
              {c.email ?? c.user_id.slice(0, 8)}
            </span>
            {isOwner && (
              <button
                type="button"
                onClick={() => startTransition(() => kickCollaborator(c.user_id))}
                disabled={pending}
                className="text-xs text-red-600 hover:text-red-700 underline underline-offset-2 min-h-[32px] px-1"
              >
                내보내기
              </button>
            )}
          </div>
        ))}
      </div>

      {isOwner ? (
        <div className="space-y-2">
          <Button
            type="button"
            onClick={makeInvite}
            variant="secondary"
            disabled={pending}
            className="w-full"
          >
            {pending ? "만드는 중..." : "초대 링크 만들기"}
          </Button>
          {error && <p className="text-xs text-red-600">{error}</p>}
          {link && (
            <div className="space-y-2">
              <input
                readOnly
                value={link}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full min-h-[44px] px-3 rounded-md border border-border bg-bg text-ink text-xs font-mono"
                aria-label="초대 링크"
              />
              <Button
                type="button"
                onClick={copy}
                variant="primary"
                className="w-full text-sm"
              >
                {copied ? "복사됨 ✓" : "링크 복사"}
              </Button>
              <p className="text-[11px] text-muted">
                이 링크를 상대방에게 카톡으로 보내주세요. 14일간 유효하고, 한 번만
                사용할 수 있어요. 새로 만들면 이전 링크는 사용할 수 없게 됩니다.
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-muted">
          초대는 청첩장을 만든 사람만 보낼 수 있어요.
        </p>
      )}
    </Card>
  );
}
