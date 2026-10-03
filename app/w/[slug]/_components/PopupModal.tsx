"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { RsvpView } from "./RsvpView";
import { resizedPhoto, PHOTO_WIDTHS } from "@/lib/images/resize";
import { POPUP_LINK_TARGETS, type PopupConfig, type RsvpFields } from "@/lib/extras/types";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function todayKstKey(slug: string): string {
  const kst = new Date(Date.now() + KST_OFFSET_MS);
  const dateStr = kst.toISOString().slice(0, 10); // YYYY-MM-DD (KST wall date)
  return `wd-popup-dismissed-${slug}-${dateStr}`;
}

type Props = {
  slug: string;
  siteId: string;
  popup: Required<PopupConfig>;
  namesText: string;
  dateText: string;
  venueName: string;
  fields: Required<RsvpFields>;
};

/**
 * The single popup shown right after a guest enters, with whatever the couple
 * put in it: a title, an image, some text, and optionally one button.
 *
 * Rendered via portal into <body> — this lives inside HomeTab, which sits
 * under sections that use CSS `transform` for scroll-in animation, and any
 * transformed ancestor would otherwise clip a `position: fixed` overlay to
 * that ancestor's box instead of the real viewport.
 */
export function PopupModal({
  slug,
  siteId,
  popup,
  namesText,
  dateText,
  venueName,
  fields,
}: Props) {
  const [open, setOpen] = useState(false);
  // false = the couple's content, true = the RSVP form swapped in place so the
  // guest answers without the popup closing and scrolling away under them.
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    function onEnter() {
      try {
        if (localStorage.getItem(todayKstKey(slug))) return;
      } catch {
        /* localStorage unavailable — just show it */
      }
      // Wait for the splash fade-out (700ms) so the popup doesn't fight it.
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

  /**
   * Jump to the section the couple picked. It normally lives on this page, but
   * the home screen can hide any section, so fall back to its own tab when the
   * anchor isn't here.
   */
  function goToTarget() {
    const { tab } = POPUP_LINK_TARGETS[popup.link_target];
    const el = document.getElementById(popup.link_target);
    setOpen(false);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else if (tab) window.location.href = `/w/${slug}?tab=${tab}`;
  }

  if (!open) return null;

  const title = popup.title.trim();
  const body = popup.body.trim();
  const linkLabel =
    popup.link_label.trim() || `${POPUP_LINK_TARGETS[popup.link_target].label} 보기`;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label={title || "안내"}
    >
      <div
        className="bg-surface rounded-lg w-full max-w-sm max-h-[85vh] flex flex-col shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* The close button is the one thing that always renders — a popup with
            an empty title still has to be closable. */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h3 className="text-base font-semibold text-ink">{title}</h3>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-muted hover:text-ink p-1 -m-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 rounded flex-shrink-0"
            aria-label="닫기"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {!showForm ? (
            <div className="space-y-4 text-center">
              {/* One media slot: a video wins over a still, because stacking
                  both in a popup this size turns it into a scroll. Never
                  autoplayed — the BGM is already running and a second audio
                  source on entry is the fastest way to get a tab closed. */}
              {popup.video_id ? (
                <div className="aspect-video rounded-md overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${popup.video_id}?modestbranding=1&rel=0&playsinline=1`}
                    className="w-full h-full"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="안내 영상"
                  />
                </div>
              ) : (
                popup.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resizedPhoto(popup.image_url, PHOTO_WIDTHS.card)}
                    alt=""
                    className="w-full rounded-md object-contain max-h-[40vh]"
                  />
                )
              )}

              {body && (
                <p className="text-sm text-secondary leading-relaxed whitespace-pre-wrap">
                  {body}
                </p>
              )}

              {/* Kept only for the RSVP action, which is what the popup did
                  before it was configurable — guests see the same card. */}
              {popup.action === "rsvp" && (
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
              )}

              {popup.action !== "none" && (
                <button
                  type="button"
                  onClick={popup.action === "rsvp" ? () => setShowForm(true) : goToTarget}
                  className="w-full inline-flex items-center justify-center min-h-[44px] px-6 bg-ink text-bg rounded-pill text-sm font-medium shadow-card hover:opacity-90 active:opacity-80 transition-opacity"
                >
                  {popup.action === "rsvp" ? "참석 의사 전달하기" : linkLabel}
                </button>
              )}
            </div>
          ) : (
            // No extra card padding here — RsvpView already renders its own Card.
            <RsvpView siteId={siteId} fields={fields} />
          )}
        </div>

        {!showForm && (
          <div className="px-5 pb-4 flex justify-center flex-shrink-0">
            <button
              type="button"
              onClick={dismissToday}
              className="text-xs text-muted hover:text-ink underline underline-offset-2 min-h-[32px]"
            >
              오늘 하루 보지 않기
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
