"use client";
import { useState } from "react";
import { KakaoMap } from "./KakaoMap";
import { Card } from "@/app/_ui/Card";
import { Button } from "@/app/_ui/Button";
import { Icon } from "./Icon";

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
        <Card className="space-y-2">
          <p className="text-xs text-muted flex items-center gap-1.5">
            <Icon name="building" className="w-3.5 h-3.5" />
            예식장
          </p>
          {venue.name && (
            <p className="text-sm font-semibold text-ink">{venue.name}</p>
          )}
          {venue.address && (
            <p className="text-sm text-secondary">{venue.address}</p>
          )}
          <div className="flex gap-2 pt-2">
            {venue.address && (
              <Button
                type="button"
                onClick={() => copyAddress(venue.address, "venue")}
                variant="secondary"
                className="flex-1 px-3 text-xs gap-1.5"
              >
                {copied === "venue" ? (
                  "복사됨 ✓"
                ) : (
                  <>
                    <Icon name="copy" className="w-3.5 h-3.5" />
                    주소 복사
                  </>
                )}
              </Button>
            )}
            {hasVenueCoords && (
              <Button
                type="button"
                onClick={() =>
                  navigateTo(venue.lat!, venue.lng!, venue.name || "예식장")
                }
                variant="primary"
                className="flex-1 px-3 text-xs gap-1.5"
              >
                <Icon name="navigation" className="w-3.5 h-3.5" />
                길찾기
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* 주차장 카드 (좌표 있을 때만) */}
      {hasParking && (
        <Card className="space-y-2">
          <p className="text-xs text-muted flex items-center gap-1.5">
            <Icon name="parking" className="w-3.5 h-3.5" />
            주차장
          </p>
          {parking.name && (
            <p className="text-sm font-semibold text-ink">{parking.name}</p>
          )}
          {parking.address && (
            <p className="text-sm text-secondary">{parking.address}</p>
          )}
          <div className="flex gap-2 pt-2">
            {parking.address && (
              <Button
                type="button"
                onClick={() => copyAddress(parking.address, "parking")}
                variant="secondary"
                className="flex-1 px-3 text-xs gap-1.5"
              >
                {copied === "parking" ? (
                  "복사됨 ✓"
                ) : (
                  <>
                    <Icon name="copy" className="w-3.5 h-3.5" />
                    주소 복사
                  </>
                )}
              </Button>
            )}
            <Button
              type="button"
              onClick={() =>
                navigateTo(parking.lat!, parking.lng!, parking.name || "주차장")
              }
              variant="primary"
              className="flex-1 px-3 text-xs gap-1.5"
            >
              <Icon name="navigation" className="w-3.5 h-3.5" />
              길찾기
            </Button>
          </div>
        </Card>
      )}

      <p className="text-[10px] text-muted text-center pt-1">
        모바일은 네이버지도 앱 우선, 앱이 없으면 카카오맵 웹으로 이동합니다.
      </p>
    </div>
  );
}
