"use client";
import Link from "next/link";
import { formatKstDateTime } from "@/lib/date/kst";

type Props = {
  groomName: string;
  brideName: string;
  weddingAt: string | null;
  nameJoiner: string;
  venueName: string;
  greeting: string;
  mainPhotoUrl: string | null;
  slug: string;
};

export function Splash(p: Props) {
  const dateText = p.weddingAt ? formatKstDateTime(p.weddingAt) : "";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4"
      style={{ animation: "splash-fade-in 700ms ease-out both" }}
    >
      <style>{`@keyframes splash-fade-in { from { opacity: 0 } to { opacity: 1 } }`}</style>
      {p.mainPhotoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.mainPhotoUrl}
          alt=""
          className="w-56 h-72 object-cover rounded-sm shadow-card"
        />
      )}
      <h1 className="text-2xl font-medium tracking-tight">
        {p.groomName}
        {p.nameJoiner}
        {p.brideName}
      </h1>
      {dateText && <p className="text-sm text-muted tracking-widest">{dateText}</p>}
      {p.venueName && <p className="text-sm text-secondary">📍 {p.venueName}</p>}
      {p.greeting && (
        <p className="text-sm text-secondary whitespace-pre-line max-w-xs leading-relaxed">
          {p.greeting}
        </p>
      )}
      <Link
        href={`/w/${p.slug}?tab=home`}
        className="mt-4 px-6 py-3 bg-ink text-bg rounded-pill text-sm"
      >
        🎵 청첩장 자세히 보기 ↓
      </Link>
    </div>
  );
}
