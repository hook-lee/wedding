"use client";
import { useState } from "react";
import type { InfoItem } from "@/lib/extras/types";

export function InfoView({ items }: { items: InfoItem[] }) {
  // 첫 번째 항목을 기본 선택 — 탭 인터페이스
  const [active, setActive] = useState(0);
  if (items.length === 0) return null;
  const current = items[Math.min(active, items.length - 1)];

  return (
    <div className="bg-surface border border-border rounded-lg shadow-card overflow-hidden">
      {/* 탭 헤더 */}
      <div className="flex border-b border-border bg-bg/40 overflow-x-auto">
        {items.map((it, i) => {
          const isActive = i === active;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`flex-shrink-0 px-4 py-3 text-sm transition-colors min-h-[44px] ${
                isActive
                  ? "text-ink font-semibold border-b-2 border-ink -mb-px"
                  : "text-muted hover:text-secondary"
              }`}
            >
              {it.title || `안내 ${i + 1}`}
            </button>
          );
        })}
      </div>

      {/* 본문 */}
      <div className="p-5 sm:p-6">
        <p className="text-sm text-secondary whitespace-pre-line leading-relaxed text-center">
          {current.body}
        </p>
      </div>
    </div>
  );
}
