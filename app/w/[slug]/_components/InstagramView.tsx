"use client";
import { Icon } from "./Icon";
import { instagramLinks, normalizeInstagram } from "@/lib/social/instagram";

function isMobile() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * The couple's shared Instagram, rendered as one button.
 *
 * Mirrors the 길찾기 buttons: on mobile try the app scheme, then fall back to
 * the web URL after a beat, because an uninstalled app's scheme simply does
 * nothing and there is no event to detect that. Desktop goes straight to web.
 */
export function InstagramView({
  username,
  note,
}: {
  username: string;
  note?: string;
}) {
  const handle = normalizeInstagram(username);
  const links = instagramLinks(handle);

  function open() {
    if (isMobile()) {
      window.location.href = links.app;
      setTimeout(() => {
        window.location.href = links.web;
      }, 1500);
    } else {
      window.open(links.web, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="text-center space-y-3">
      {note && <p className="text-sm text-secondary whitespace-pre-wrap">{note}</p>}
      <button
        type="button"
        onClick={open}
        className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 bg-ink text-bg rounded-pill text-sm font-medium shadow-card hover:opacity-90 active:opacity-80 transition-opacity"
      >
        <Icon name="instagram" className="w-4 h-4" />
        @{handle}
      </button>
    </div>
  );
}
