"use client";
import { useState } from "react";
import { KakaoMap } from "./KakaoMap";

type Place = {
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
};

type Props = {
  venue: Place;
  parking: Place;
};

function isMobile() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Navigation strategy:
 * - Mobile: try Naver Map app (nmap://route/car), fallback to Kakao Map web after 1.5s
 * - Desktop / no app: open Kakao Map web with one-tap directions
 *
 * Kakao web (`map.kakao.com/link/to/...`) is used as the web fallback because
 * the Naver web URL format keeps changing and currently breaks on desktop.
 */
function navigateTo(lat: number, lng: number, name: string) {
  const naverApp = `nmap://route/car?dlat=${lat}&dlng=${lng}&dname=${encodeURIComponent(
    name,
  )}&appname=wedding-zip`;
  const kakaoWeb = `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`;

  if (isMobile()) {
    window.location.href = naverApp;
    setTimeout(() => {
      window.location.href = kakaoWeb;
    }, 1500);
  } else {
    window.location.href = kakaoWeb;
  }
}

export function VenueView({ venue, parking }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copyAddress(addr: string, key: string) {
    if (!addr) return;
    try {
      await navigator.clipboard.writeText(addr);
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      /* clipboard not supported */
    }
  }

  const hasVenueCoords = venue.lat != null && venue.lng != null;
  const hasParking =
    parking.lat != null && parking.lng != null && (parking.name || parking.address);

  return (
    <div className="space-y-4">
      {hasVenueCoords ? (
        <KakaoMap lat={venue.lat!} lng={venue.lng!} name={venue.name} />
      ) : (
        <p className="text-sm text-muted text-center py-6">
          아직 식장 위치가 설정되지 않았습니다.
        </p>
      )}

      {/* 예식장 카드 */}
      {(venue.name || venue.address) && (
        <div className="bg-surface border border-border rounded-md p-3 shadow-card">
          <p className="text-xs text-muted">🎂 예식장</p>
          {venue.name && <p className="text-sm font-semibold mt-1">{venue.name}</p>}
          {venue.address && <p className="text-sm text-secondary mt-1">{venue.address}</p>}
          <div className="flex gap-2 mt-3">
            {venue.address && (
              <button
                type="button"
                onClick={() => copyAddress(venue.address, "venue")}
                className="flex-1 p-2 border border-ink rounded-pill text-xs"
              >
                {copied === "venue" ? "복사됨 ✓" : "📋 주소 복사"}
              </button>
            )}
            {hasVenueCoords && (
              <button
                type="button"
                onClick={() =>
                  navigateTo(venue.lat!, venue.lng!, venue.name || "예식장")
                }
                className="flex-1 p-2 bg-ink text-bg rounded-pill text-xs"
              >
                🚗 예식장 길찾기
              </button>
            )}
          </div>
        </div>
      )}

      {/* 주차장 카드 (좌표 있을 때만) */}
      {hasParking && (
        <div className="bg-surface border border-border rounded-md p-3 shadow-card">
          <p className="text-xs text-muted">🅿️ 주차장</p>
          {parking.name && <p className="text-sm font-semibold mt-1">{parking.name}</p>}
          {parking.address && (
            <p className="text-sm text-secondary mt-1">{parking.address}</p>
          )}
          <div className="flex gap-2 mt-3">
            {parking.address && (
              <button
                type="button"
                onClick={() => copyAddress(parking.address, "parking")}
                className="flex-1 p-2 border border-ink rounded-pill text-xs"
              >
                {copied === "parking" ? "복사됨 ✓" : "📋 주소 복사"}
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                navigateTo(parking.lat!, parking.lng!, parking.name || "주차장")
              }
              className="flex-1 p-2 bg-ink text-bg rounded-pill text-xs"
            >
              🅿️ 주차장 길찾기
            </button>
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted text-center pt-1">
        모바일은 네이버지도 앱 우선, 앱이 없으면 카카오맵 웹으로 이동합니다.
      </p>
    </div>
  );
}
