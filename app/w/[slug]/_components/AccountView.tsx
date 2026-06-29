"use client";
import { useState } from "react";
import { Button } from "@/app/_ui/Button";
import { Icon } from "./Icon";

type Acc = { bank?: string; account?: string; holder?: string };
type Side = { self?: Acc | null; father?: Acc | null; mother?: Acc | null };
type Info = { groom?: Side; bride?: Side };

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
        onClick={() => setOpen((v) => !v)}
        className="w-full gap-2"
        aria-expanded={open}
      >
        <Icon name="heart" className="w-4 h-4" />
        {open ? "닫기" : "마음 전달하기"}
      </Button>
      {open && (
        <div className="space-y-2 pt-1">
          {rows.map((r) => (
            <AccountCard key={r.label} label={r.label} acc={r.acc} />
          ))}
        </div>
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
