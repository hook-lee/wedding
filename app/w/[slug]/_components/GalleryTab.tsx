"use client";
import { useEffect, useRef, useState } from "react";
import type { GalleryStyle } from "@/lib/extras/types";
import {
  SphereLayout,
  CoverflowLayout,
  PolaroidLayout,
  type LayoutProps,
} from "./GalleryLayouts";

const PREVIEW_COUNT = 12;

/** 격자 — 3열 정사각 타일. 기본값이자 가장 많은 사진을 한눈에 보여준다. */
function GridLayout({ urls, onOpen }: LayoutProps) {
  return (
    <div className="grid grid-cols-3 gap-0.5">
      {urls.map((u, i) => (
        <button key={u + i} onClick={() => onOpen(i)} className="aspect-[4/5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={u} alt="" className="w-full h-full object-cover" loading="lazy" />
        </button>
      ))}
    </div>
  );
}

/**
 * 슬라이드 — 가로로 넘겨 보는 큰 카드. CSS scroll-snap만 사용하므로
 * 캐러셀 라이브러리 없이도 손가락 스와이프가 자연스럽게 동작한다.
 */
function SwipeLayout({ urls, onOpen }: LayoutProps) {
  return (
    <div className="-mx-4 sm:-mx-5">
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 sm:px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {urls.map((u, i) => (
          <button
            key={u + i}
            onClick={() => onOpen(i)}
            className="snap-center shrink-0 w-[78%] aspect-[3/4] rounded-lg overflow-hidden shadow-card"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
      <p className="text-[11px] text-muted text-center pt-1">← 옆으로 넘겨보세요 →</p>
    </div>
  );
}

/**
 * 매거진 — 원본 비율을 살린 2열 벽돌 배치. CSS columns를 쓰기 때문에
 * 세로/가로 사진이 섞여 있어도 잘리지 않고 잡지처럼 흐른다.
 */
function MasonryLayout({ urls, onOpen }: LayoutProps) {
  return (
    <div className="columns-2 gap-1.5 [column-fill:balance]">
      {urls.map((u, i) => (
        <button
          key={u + i}
          onClick={() => onOpen(i)}
          // 원본 비율을 살리는 대신 로드 전에는 높이를 알 수 없다. min-h와
          // 옅은 배경으로 자리를 잡아둬야 사진이 붙는 순간 레이아웃이
          // 크게 튀지 않는다.
          className="block w-full mb-1.5 break-inside-avoid rounded-md overflow-hidden bg-border/40 min-h-[120px]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={u} alt="" className="w-full h-auto" loading="lazy" />
        </button>
      ))}
    </div>
  );
}

/**
 * 필름 — 사진 한 장을 크게 보여주고 아래 썸네일로 넘기는 방식.
 * 대표 사진을 강조하고 싶을 때 어울린다.
 */
function FilmLayout({ urls, onOpen }: LayoutProps) {
  const [active, setActive] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const current = Math.min(active, urls.length - 1);

  // 선택된 썸네일을 스트립 가운데로. scrollIntoView를 쓰면 안 된다 —
  // 그건 조상 요소(=페이지)까지 같이 스크롤해서, 첫 렌더 때 방문자를
  // 사진첩으로 끌어내린다(스플래시 뒤에서 일어나면 '청첩장 열기'를 누르자마자
  // 사진첩이 떠 있는 것처럼 보인다). 스트립 자신만 움직이게 한다.
  useEffect(() => {
    const strip = stripRef.current;
    const el = strip?.children[current] as HTMLElement | undefined;
    if (!strip || !el) return;
    strip.scrollTo({
      left: el.offsetLeft - strip.clientWidth / 2 + el.offsetWidth / 2,
      behavior: "smooth",
    });
  }, [current]);

  return (
    <div className="space-y-2">
      <button
        onClick={() => onOpen(current)}
        className="block w-full aspect-[4/5] rounded-lg overflow-hidden shadow-card"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={urls[current]} alt="" className="w-full h-full object-cover" />
      </button>
      <div
        ref={stripRef}
        className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {urls.map((u, i) => (
          <button
            key={u + i}
            onClick={() => setActive(i)}
            aria-label={`${i + 1}번째 사진 보기`}
            className={`shrink-0 w-14 aspect-square rounded-md overflow-hidden transition-opacity ${
              i === current ? "ring-2 ring-ink" : "opacity-50"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
      <p className="text-[11px] text-muted text-center">
        {current + 1} / {urls.length}
      </p>
    </div>
  );
}

const LAYOUTS: Record<GalleryStyle, (p: LayoutProps) => React.ReactElement> = {
  grid: GridLayout,
  swipe: SwipeLayout,
  masonry: MasonryLayout,
  film: FilmLayout,
  sphere: SphereLayout,
  coverflow: CoverflowLayout,
  polaroid: PolaroidLayout,
};

export function GalleryTab({
  urls,
  style = "grid",
}: {
  urls: string[];
  style?: GalleryStyle;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (open === null) return;
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowLeft")
        setOpen((i) => (i === null ? null : Math.max(0, i - 1)));
      if (e.key === "ArrowRight")
        setOpen((i) =>
          i === null ? null : Math.min(urls.length - 1, i + 1)
        );
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open, urls.length]);

  if (!urls.length)
    return (
      <p className="text-center text-muted py-8">아직 사진이 없습니다.</p>
    );

  // 슬라이드·필름은 한 번에 한 장만 보이므로 "더 보기"로 접을 이유가 없다.
  // 격자·매거진만 처음 12장까지 자르고 나머지는 펼쳐서 본다.
  const paginates = style === "grid" || style === "masonry";
  const visibleUrls =
    !paginates || expanded || urls.length <= PREVIEW_COUNT
      ? urls
      : urls.slice(0, PREVIEW_COUNT);
  const hiddenCount = urls.length - PREVIEW_COUNT;
  const Layout = LAYOUTS[style] ?? GridLayout;

  return (
    <>
      <Layout urls={visibleUrls} onOpen={setOpen} />

      {paginates && hiddenCount > 0 && !expanded && (
        <div className="pt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex items-center justify-center min-h-[44px] px-5 bg-surface border border-border rounded-pill text-sm text-ink hover:bg-bg transition-colors"
          >
            사진 더 보기 ({hiddenCount}장)
          </button>
        </div>
      )}
      {paginates && expanded && urls.length > PREVIEW_COUNT && (
        <div className="pt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-xs text-muted hover:text-ink underline underline-offset-2 min-h-[32px]"
          >
            접기
          </button>
        </div>
      )}

      {open !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setOpen(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urls[open]}
            alt=""
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(null);
            }}
            className="absolute top-4 right-4 text-white text-2xl"
          >
            ×
          </button>
          {open > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(open - 1);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl"
            >
              ‹
            </button>
          )}
          {open < urls.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(open + 1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl"
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}
