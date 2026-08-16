"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { resizedPhoto, PHOTO_WIDTHS } from "@/lib/images/resize";

export type LayoutProps = {
  urls: string[];
  onOpen: (i: number) => void;
};

/**
 * Repeats the photo list until it fills `count` slots. The showy layouts
 * below look sparse and broken with only a handful of photos, and couples
 * often upload fewer than a full sphere's worth — cycling the same shots
 * reads as intentional patterning rather than a gap.
 * Returns the source index alongside each url so taps still open the right
 * photo in the shared lightbox.
 */
function fill(urls: string[], count: number): { url: string; index: number }[] {
  if (!urls.length) return [];
  return Array.from({ length: count }, (_, i) => ({
    url: urls[i % urls.length],
    index: i % urls.length,
  }));
}

/* ─────────────────────────── 구체 (3D sphere) ─────────────────────────── */

const SPHERE_ROWS = [-52, -18, 18, 52]; // latitude of each ring, degrees
const SPHERE_COLS = 7; // photos per ring
const SPHERE_RADIUS = 148;
const TILE_W = 74;
const TILE_H = 92;

/**
 * Photos arranged on a rotating globe. Drag to spin; it drifts on its own
 * when idle.
 *
 * The spin is written straight to the node's style inside a rAF loop rather
 * than held in React state — at 60fps a state-driven transform would
 * re-render all 28 tiles every frame.
 */
export function SphereLayout({ urls, onOpen }: LayoutProps) {
  const tiles = useMemo(() => fill(urls, SPHERE_ROWS.length * SPHERE_COLS), [urls]);
  const sphereRef = useRef<HTMLDivElement>(null);
  const rot = useRef({ x: -6, y: 0 });
  const drag = useRef<{ px: number; py: number; rx: number; ry: number } | null>(null);
  const [spinning, setSpinning] = useState(true);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (spinning && !drag.current) rot.current.y += 0.18;
      if (sphereRef.current) {
        sphereRef.current.style.transform = `rotateX(${rot.current.x}deg) rotateY(${rot.current.y}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [spinning]);

  function onPointerDown(e: React.PointerEvent) {
    drag.current = { px: e.clientX, py: e.clientY, rx: rot.current.x, ry: rot.current.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    rot.current.y = d.ry + (e.clientX - d.px) * 0.4;
    // Clamp vertical tilt so the globe can't be flipped upside down.
    rot.current.x = Math.max(-60, Math.min(60, d.rx - (e.clientY - d.py) * 0.4));
  }
  function onPointerUp(e: React.PointerEvent) {
    const d = drag.current;
    drag.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    // Treat a near-motionless press as a tap on the photo under it.
    if (d && Math.hypot(e.clientX - d.px, e.clientY - d.py) < 6) {
      const el = (e.target as HTMLElement).closest("[data-idx]");
      if (el) onOpen(Number(el.getAttribute("data-idx")));
    }
  }

  return (
    <div className="space-y-2">
      <div
        className="relative h-[340px] flex items-center justify-center overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing"
        style={{ perspective: "760px" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          ref={sphereRef}
          className="relative w-0 h-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {tiles.map((t, i) => {
            const row = Math.floor(i / SPHERE_COLS);
            const col = i % SPHERE_COLS;
            const lat = SPHERE_ROWS[row];
            // Offset alternate rings so tiles don't line up in hard columns.
            const lon = (360 / SPHERE_COLS) * col + (row % 2 ? 360 / SPHERE_COLS / 2 : 0);
            return (
              <div
                key={i}
                data-idx={t.index}
                className="absolute overflow-hidden rounded-sm shadow-card"
                style={{
                  width: TILE_W,
                  height: TILE_H,
                  left: -TILE_W / 2,
                  top: -TILE_H / 2,
                  transform: `rotateY(${lon}deg) rotateX(${-lat}deg) translateZ(${SPHERE_RADIUS}px)`,
                  backfaceVisibility: "hidden",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resizedPhoto(t.url, PHOTO_WIDTHS.thumb)}
                  alt=""
                  draggable={false}
                  className="w-full h-full object-cover pointer-events-none"
                  loading="lazy"
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-center gap-3">
        <p className="text-[11px] text-muted">돌려보세요 · 사진을 누르면 크게 봐요</p>
        <button
          type="button"
          onClick={() => setSpinning((s) => !s)}
          className="text-[11px] text-muted underline underline-offset-2 min-h-[32px]"
        >
          {spinning ? "회전 멈춤" : "회전 시작"}
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────── 커버플로우 (coverflow) ────────────────────── */

/**
 * iTunes-style 3D carousel: the centered photo faces you, neighbours angle
 * away into the distance. Driven by native horizontal scrolling (so touch
 * momentum and scroll-snap come for free) with each card's 3D transform
 * recalculated from its distance to the viewport centre.
 */
export function CoverflowLayout({ urls, onOpen }: LayoutProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    const apply = () => {
      const mid = el.scrollLeft + el.clientWidth / 2;
      for (const child of Array.from(el.children) as HTMLElement[]) {
        const c = child.offsetLeft + child.offsetWidth / 2;
        // -1 .. 1 across roughly one card-width either side of centre
        const d = Math.max(-1.6, Math.min(1.6, (c - mid) / (child.offsetWidth * 0.9)));
        const inner = child.firstElementChild as HTMLElement | null;
        if (inner) {
          inner.style.transform = `rotateY(${d * -42}deg) translateZ(${-Math.abs(d) * 90}px) scale(${1 - Math.abs(d) * 0.12})`;
          inner.style.opacity = String(1 - Math.abs(d) * 0.35);
          inner.style.zIndex = String(100 - Math.round(Math.abs(d) * 100));
        }
      }
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [urls]);

  return (
    <div className="space-y-2">
      <div
        ref={scrollerRef}
        className="flex gap-2 overflow-x-auto snap-x snap-mandatory py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ perspective: "900px", paddingInline: "26%" }}
      >
        {urls.map((u, i) => (
          <div key={u + i} className="snap-center shrink-0 w-[52%]">
            <button
              onClick={() => onOpen(i)}
              className="block w-full aspect-[3/4] rounded-lg overflow-hidden shadow-card will-change-transform"
              style={{ transformStyle: "preserve-3d", transition: "none" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resizedPhoto(u, PHOTO_WIDTHS.card)}
                alt=""
                draggable={false}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted text-center">← 옆으로 넘겨보세요 →</p>
    </div>
  );
}

/* ─────────────────────────── 폴라로이드 (stack) ────────────────────────── */

const TILT = [-5, 3, -2, 6, -4, 2]; // fixed rotations, so cards don't jitter on re-render

/**
 * A loose stack of polaroid prints. Tapping the top card sends it to the
 * back, revealing the next — like flipping through a pile of photos.
 */
export function PolaroidLayout({ urls, onOpen }: LayoutProps) {
  const [top, setTop] = useState(0);
  // Only the front few cards are rendered; a long list would otherwise
  // stack hundreds of absolutely-positioned nodes for no visual gain.
  const depth = Math.min(urls.length, 4);

  return (
    <div className="space-y-3">
      <div className="relative h-[380px] flex items-center justify-center select-none">
        {Array.from({ length: depth }, (_, layer) => {
          const idx = (top + (depth - 1 - layer)) % urls.length;
          const back = depth - 1 - layer; // 0 = front
          return (
            <div
              key={layer}
              className="absolute bg-surface p-2.5 pb-8 rounded-sm shadow-card transition-transform duration-300"
              style={{
                width: "72%",
                transform: `rotate(${TILT[idx % TILT.length]}deg) translateY(${back * -6}px) scale(${1 - back * 0.04})`,
                zIndex: layer,
              }}
            >
              <button
                onClick={() => (back === 0 ? onOpen(idx) : undefined)}
                className="block w-full aspect-square overflow-hidden bg-bg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resizedPhoto(urls[idx], PHOTO_WIDTHS.card)}
                  alt=""
                  draggable={false}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setTop((t) => (t + 1) % urls.length)}
          className="inline-flex items-center justify-center min-h-[44px] px-5 bg-surface border border-border rounded-pill text-sm text-ink hover:bg-bg transition-colors"
        >
          다음 사진 →
        </button>
        <span className="text-[11px] text-muted tabular-nums">
          {(top % urls.length) + 1} / {urls.length}
        </span>
      </div>
    </div>
  );
}
