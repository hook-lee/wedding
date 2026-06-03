"use client";
import { useState } from "react";
import { KakaoMap } from "./KakaoMap";

type Props = {
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
};

export function VenueView({ name, address, lat, lng }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // clipboard not supported (rare); silently no-op
    }
  }

  const naverApp =
    lat != null && lng != null
      ? `nmap://route/public?dlat=${lat}&dlng=${lng}&dname=${encodeURIComponent(
          name
        )}&appname=wedding-zip`
      : null;
  const naverWeb =
    lat != null && lng != null
      ? `https://map.naver.com/v5/directions/-/-/-/${lng},${lat},${encodeURIComponent(
          name
        )},,/public`
      : null;

  function onNavigate(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!naverApp || !naverWeb) return;
    e.preventDefault();
    // try app, fall back to web after 800ms (the app, if installed, will navigate away first)
    window.location.href = naverApp;
    setTimeout(() => {
      window.location.href = naverWeb;
    }, 800);
  }

  return (
    <div className="space-y-4">
      {lat != null && lng != null ? (
        <KakaoMap lat={lat} lng={lng} name={name} />
      ) : (
        <p className="text-sm text-muted text-center py-6">
          아직 식장 위치가 설정되지 않았습니다.
        </p>
      )}

      {(name || address) && (
        <div className="bg-surface border border-border rounded-md p-3 shadow-card">
          {name && <p className="text-sm font-semibold">{name}</p>}
          {address && (
            <p className="text-sm text-secondary mt-1">{address}</p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {address && (
          <button
            onClick={copyAddress}
            className="flex-1 p-2 border border-ink rounded-pill text-sm"
          >
            {copied ? "복사됨 ✓" : "📋 주소 복사"}
          </button>
        )}
        {naverApp && (
          <a
            href={naverApp}
            onClick={onNavigate}
            className="flex-1 p-2 border border-ink rounded-pill text-sm text-center"
          >
            🚗 길찾기
          </a>
        )}
      </div>
    </div>
  );
}
