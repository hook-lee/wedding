"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/app/_ui/Button";
import { Icon } from "./Icon";

type Acc = { bank?: string; account?: string; holder?: string };
type Side = { self?: Acc | null; father?: Acc | null; mother?: Acc | null };
type Info = { groom?: Side; bride?: Side };

const MODAL_KEYFRAMES = `
@keyframes wd-modal-backdrop { from { opacity: 0 } to { opacity: 1 } }
@keyframes wd-modal-card {
  from { opacity: 0; transform: translateY(8px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
`;

function AccountCard({ label, acc }: { label: string; acc: Acc }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    if (!acc.account) return;
    try {
      await navigator.clipboard.writeText(acc.account);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* no-op */
    }
  }
  return (
    <button
      onClick={copy}
      type="button"
      className="w-full text-left bg-bg border border-border rounded-md p-3 sm:p-4 space-y-0.5 transition-colors hover:bg-surface focus:outline-none focus:ring-2 focus:ring-ink/15"
    >
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-semibold text-ink">
        {acc.bank} · {acc.holder}
      </p>
      <p className="text-sm text-secondary font-mono">{acc.account}</p>
      <p className="text-[11px] text-accent pt-0.5">
        {copied ? "복사됨 ✓" : "탭하면 계좌번호 복사"}
      </p>
    </button>
  );
}

function AccountModal({
  title,
  rows,
  onClose,
}: {
  title: string;
  rows: { label: string; acc: Acc }[];
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // Rendered via portal straight into <body> — this section lives inside a
  // <Reveal> wrapper that applies a CSS `transform` for its scroll-in
  // animation. Any ancestor with `transform` creates a new containing block
  // for `position: fixed` descendants, so without the portal this modal's
  // "fullscreen" backdrop would actually be clipped to that section's box
  // instead of the real viewport — letting adjacent sections show through.
  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} 계좌`}
      style={{ animation: "wd-modal-backdrop 180ms ease-out forwards" }}
    >
      <style>{MODAL_KEYFRAMES}</style>
      <div
        className="bg-surface rounded-lg w-full max-w-sm max-h-[85vh] flex flex-col shadow-card"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "wd-modal-card 220ms ease-out forwards" }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-ink">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-ink p-1 -m-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 rounded"
            aria-label="닫기"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 — 입력된 계좌만큼만 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {rows.map((r) => (
            <AccountCard key={r.label} label={r.label} acc={r.acc} />
          ))}
        </div>

        {/* 하단 닫기 */}
        <div className="px-5 py-4 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-full"
          >
            닫기
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function SideSection({
  title,
  selfLabel,
  fatherLabel,
  motherLabel,
  side,
}: {
  title: string;
  selfLabel: string;
  fatherLabel: string;
  motherLabel: string;
  side: Side;
}) {
  const [open, setOpen] = useState(false);

  const rows = [
    { label: selfLabel, acc: side.self },
    { label: fatherLabel, acc: side.father },
    { label: motherLabel, acc: side.mother },
  ].filter((r): r is { label: string; acc: Acc } => !!r.acc && !!r.acc.account);

  if (rows.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-secondary text-center">{title}</h3>
      <Button
        type="button"
        variant="primary"
        onClick={() => setOpen(true)}
        className="w-full gap-2"
        aria-haspopup="dialog"
      >
        <Icon name="heart" className="w-4 h-4" />
        마음 전달하기
      </Button>
      {open && (
        <AccountModal title={title} rows={rows} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

export function AccountView({ info }: { info: Info }) {
  return (
    <div className="space-y-5">
      <SideSection
        title="신랑측"
        selfLabel="신랑"
        fatherLabel="신랑 아버지"
        motherLabel="신랑 어머니"
        side={info.groom ?? {}}
      />
      <SideSection
        title="신부측"
        selfLabel="신부"
        fatherLabel="신부 아버지"
        motherLabel="신부 어머니"
        side={info.bride ?? {}}
      />
    </div>
  );
}
