"use client";
import { useState } from "react";

type Acc = { bank?: string; account?: string; holder?: string } | null;
type Info = {
  groom?: { self?: Acc; father?: Acc; mother?: Acc };
  bride?: { self?: Acc; father?: Acc; mother?: Acc };
};

function Card({ label, acc }: { label: string; acc: Acc }) {
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
      className="w-full text-left bg-surface border border-border rounded-md p-3 shadow-card"
    >
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-semibold mt-1">
        {acc.bank} · {acc.holder}
      </p>
      <p className="text-sm text-secondary mt-0.5 font-mono">{acc.account}</p>
      <p className="text-xs mt-1 text-accent">
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
        <Card label="신랑" acc={info.groom?.self ?? null} />
        <Card label="신랑 아버지" acc={info.groom?.father ?? null} />
        <Card label="신랑 어머니" acc={info.groom?.mother ?? null} />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-secondary">신부측</h3>
        <Card label="신부" acc={info.bride?.self ?? null} />
        <Card label="신부 아버지" acc={info.bride?.father ?? null} />
        <Card label="신부 어머니" acc={info.bride?.mother ?? null} />
      </div>
    </div>
  );
}
