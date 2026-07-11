"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function todayKstKey(slug: string): string {
  const kst = new Date(Date.now() + KST_OFFSET_MS);
  const dateStr = kst.toISOString().slice(0, 10); // YYYY-MM-DD (KST wall date)
  return `wd-rsvp-prompt-dismissed-${slug}-${dateStr}`;
}

type Props = {
  slug: string;
  namesText: string;
  dateText: string;
  venueName: string;
};

/**
 * Nudges guests toward the RSVP section right after they enter the site.
 * Rendered via portal into <body> — this lives inside HomeTab, which sits
 * under sections that use CSS `transform` for scroll-in animation, and any
 * transformed ancestor would otherwise clip a `position: fixed` overlay to
 * that ancestor's box instead of the real viewport (same issue fixed for
 * AccountView's modal earlier).
 */
export function RsvpPromptModal({ slug, namesText, dateText, venueName }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onEnter() {
      try {
        if (localStorage.getItem(todayKstKey(slug))) return;
      } catch {
        /* localStorage unavailable — just show it */
      }
      // Wait for the splash fade-out (700ms) so the modal doesn't fight it.
      setTimeout(() => setOpen(true), 750);
    }
    window.addEventListener("wedding-bgm-start", onEnter);
    return () => window.removeEventListener("wedding-bgm-start", onEnter);
  }, [slug]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function dismissToday() {
    try {
      localStorage.setItem(todayKstKey(slug), "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  function goToRsvp() {
    setOpen(false);
    setTimeout(() => {
      document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="참석 의사 전달"
    >
      <div
        className="bg-surface rounded-lg w-full max-w-sm shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-ink">참석 의사 전달</h3>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-muted hover:text-ink p-1 -m-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 rounded"
            aria-label="닫기"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-center">
          <p className="text-sm text-secondary leading-relaxed">
            축하의 마음으로 참석해주시는 모든 분들을 귀하게 모실 수 있도록
            참석 의사를 전달 부탁드립니다.
          </p>

          <div className="bg-bg border border-border rounded-md p-4 space-y-1.5 text-left">
            <p className="text-sm font-semibold text-ink flex items-center gap-1.5">
              <Icon name="heart" className="w-3.5 h-3.5" />
              {namesText}
            </p>
            {dateText && (
              <p className="text-sm text-secondary flex items-center gap-1.5">
                <Icon name="calendar" className="w-3.5 h-3.5" />
                {dateText}
              </p>
            )}
            {venueName && (
              <p className="text-sm text-secondary flex items-center gap-1.5">
                <Icon name="pin" className="w-3.5 h-3.5" />
                {venueName}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={goToRsvp}
            className="w-full inline-flex items-center justify-center min-h-[44px] px-6 bg-ink text-bg rounded-pill text-sm font-medium shadow-card hover:opacity-90 active:opacity-80 transition-opacity"
          >
            참석 의사 전달하기
          </button>
        </div>

        <div className="px-5 pb-4 flex justify-center">
          <button
            type="button"
            onClick={dismissToday}
            className="text-xs text-muted hover:text-ink underline underline-offset-2 min-h-[32px]"
          >
            오늘 하루 보지 않기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
