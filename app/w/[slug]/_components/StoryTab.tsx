"use client";
import { useState } from "react";

type Pos = { x: number; y: number };
// Legacy string values from before drag-positioning existed — still read so
// older saved story items don't lose their (coarser) crop choice.
type LegacyPos = "top" | "center" | "bottom";
type Item = {
  date: string;
  title: string;
  body: string;
  photo_url?: string;
  photo_position?: Pos | LegacyPos;
};

function objectPositionOf(p?: Pos | LegacyPos): string {
  if (!p) return "50% 50%";
  if (typeof p === "string") {
    return p === "top" ? "50% 0%" : p === "bottom" ? "50% 100%" : "50% 50%";
  }
  return `${p.x}% ${p.y}%`;
}

const PREVIEW_COUNT = 2;

export function StoryTab({ items }: { items: Item[] }) {
  const [expanded, setExpanded] = useState(false);

  if (!items.length)
    return <p className="text-center text-muted py-8">아직 스토리가 없습니다.</p>;

  const visible = expanded || items.length <= PREVIEW_COUNT ? items : items.slice(0, PREVIEW_COUNT);
  const hiddenCount = items.length - PREVIEW_COUNT;

  return (
    <div className="max-w-md mx-auto">
      <ol className="relative py-4">
        {visible.map((it, i) => (
          <li key={i} className="grid grid-cols-[16px_1fr] gap-3 relative pb-8">
            <div className="flex flex-col items-center">
              <span className="w-2 h-2 rounded-pill bg-ink mt-1.5" />
              {i < visible.length - 1 && <span className="flex-1 w-px bg-border mt-1" />}
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted tracking-widest">{it.date}</p>
              <h3 className="text-sm font-semibold text-ink">{it.title}</h3>
              {it.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.photo_url}
                  alt=""
                  className="w-full aspect-[4/3] object-cover rounded-md shadow-card"
                  style={{ objectPosition: objectPositionOf(it.photo_position) }}
                />
              )}
              {it.body && (
                <p className="text-sm text-secondary whitespace-pre-line leading-relaxed">
                  {it.body}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {hiddenCount > 0 && !expanded && (
        <div className="flex justify-center pb-2">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex items-center justify-center min-h-[44px] px-5 bg-surface border border-border rounded-pill text-sm text-ink hover:bg-bg transition-colors"
          >
            스토리 더 보기 ({hiddenCount}개)
          </button>
        </div>
      )}
      {expanded && items.length > PREVIEW_COUNT && (
        <div className="flex justify-center pb-2">
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-xs text-muted hover:text-ink underline underline-offset-2 min-h-[32px]"
          >
            접기
          </button>
        </div>
      )}
    </div>
  );
}
