"use client";
import { useEffect, useState } from "react";

export function GalleryTab({ urls }: { urls: string[] }) {
  const [open, setOpen] = useState<number | null>(null);

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

  return (
    <>
      <div className="grid grid-cols-3 gap-0.5">
        {urls.map((u, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <button
            key={u}
            onClick={() => setOpen(i)}
            className="aspect-square"
          >
            <img
              src={u}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

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
