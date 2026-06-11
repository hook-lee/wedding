"use client";
import { useState } from "react";

type Acc = { bank?: string; account?: string; holder?: string } | null;
type Info = {
  groom?: { self?: Acc; father?: Acc; mother?: Acc };
  bride?: { self?: Acc; father?: Acc; mother?: Acc };
};

function AccountCard({ label, acc }: { label: string; acc: Acc }) {
  const [copied, setCopied] = useState(false);
  if (!acc || !acc.account) return null;
  async function copy() {
    if (!acc?.account) return;
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
      className="w-full text-left bg-surface border border-border rounded-lg p-4 sm:p-5 shadow-card space-y-1 transition-colors hover:bg-bg focus:outline-none focus:ring-2 focus:ring-ink/15 focus:border-ink/40"
    >
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-semibold text-ink">
        {acc.bank} · {acc.holder}
      </p>
      <p className="text-sm text-secondary font-mono">{acc.account}</p>
      <p className="text-xs text-accent pt-1">
        {copied ? "복사됨 ✓" : "탭하면 계좌번호 복사"}
      </p>
    </button>
  );
}

export function AccountView({ info }: { info: Info }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-secondary">신랑측</h3>
        <AccountCard label="신랑" acc={info.groom?.self ?? null} />
        <AccountCard label="신랑 아버지" acc={info.groom?.father ?? null} />
        <AccountCard label="신랑 어머니" acc={info.groom?.mother ?? null} />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-secondary">신부측</h3>
        <AccountCard label="신부" acc={info.bride?.self ?? null} />
        <AccountCard label="신부 아버지" acc={info.bride?.father ?? null} />
        <AccountCard label="신부 어머니" acc={info.bride?.mother ?? null} />
      </div>
    </div>
  );
}
