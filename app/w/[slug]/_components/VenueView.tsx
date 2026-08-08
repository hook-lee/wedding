"use client";
import { useState } from "react";
import { KakaoMap } from "./KakaoMap";
import { Card } from "@/app/_ui/Card";
import { Button } from "@/app/_ui/Button";
import { Icon } from "./Icon";
import { mapLinks, MAP_APP_LABELS } from "@/lib/maps/links";
import type { MapApp, MapApps } from "@/lib/extras/types";

type Place = {
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
};

type Props = {
  venue: Place;
  parking: Place;
  transitSubway?: string;
  transitBus?: string;
  parkingNotes?: string;
  mapApps: Required<MapApps>;
};

function isMobile() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * On mobile, try the native app scheme first and fall back to the web URL if
 * nothing handled it (an uninstalled app's scheme just does nothing, so the
 * timer is the only way to detect it). Desktop goes straight to web.
 */
function navigateWith(app: MapApp, lat: number, lng: number, name: string) {
  const links = mapLinks(app, { lat, lng, name });
  if (isMobile() && links.app !== links.web) {
    window.location.href = links.app;
    setTimeout(() => {
      window.location.href = links.web;
    }, 1500);
  } else {
    window.location.href = links.web;
  }
}

export function VenueView({
  venue,
  parking,
  transitSubway,
  transitBus,
  parkingNotes,
  mapApps,
}: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const enabledApps = (Object.keys(MAP_APP_LABELS) as MapApp[]).filter((a) => mapApps[a]);

  /** One 길찾기 button per map app the couple turned on. */
  function DirectionButtons({ place, fallbackName }: { place: Place; fallbackName: string }) {
    if (!enabledApps.length) return null;
    return (
      <div className="flex gap-2 pt-2">
        {enabledApps.map((a) => (
          <Button
            key={a}
            type="button"
            onClick={() => navigateWith(a, place.lat!, place.lng!, place.name || fallbackName)}
            variant="primary"
            className="flex-1 px-2 text-xs gap-1"
          >
            <Icon name="navigation" className="w-3.5 h-3.5 flex-shrink-0" />
            {MAP_APP_LABELS[a]}
          </Button>
        ))}
      </div>
    );
  }

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
          {venue.address && (
            <div className="flex gap-2 pt-2">
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
            </div>
          )}
          {hasVenueCoords && <DirectionButtons place={venue} fallbackName="예식장" />}
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
          {parking.address && (
            <div className="flex gap-2 pt-2">
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
            </div>
          )}
          <DirectionButtons place={parking} fallbackName="주차장" />
        </Card>
      )}

      {enabledApps.length > 0 && (
        <p className="text-[10px] text-muted text-center pt-1">
          앱이 설치되어 있지 않으면 웹 지도로 열립니다.
        </p>
      )}

      {/* 교통편·주차 안내 (extras) */}
      {transitSubway?.trim() && (
        <Card className="space-y-1.5">
          <p className="text-xs text-muted flex items-center gap-1.5">
            <Icon name="navigation" className="w-3.5 h-3.5" />
            지하철
          </p>
          <p className="text-sm text-secondary whitespace-pre-line leading-relaxed">
            {transitSubway}
          </p>
        </Card>
      )}

      {transitBus?.trim() && (
        <Card className="space-y-1.5">
          <p className="text-xs text-muted flex items-center gap-1.5">
            <Icon name="navigation" className="w-3.5 h-3.5" />
            버스
          </p>
          <p className="text-sm text-secondary whitespace-pre-line leading-relaxed">
            {transitBus}
          </p>
        </Card>
      )}

      {parkingNotes?.trim() && (
        <Card className="space-y-1.5">
          <p className="text-xs text-muted flex items-center gap-1.5">
            <Icon name="parking" className="w-3.5 h-3.5" />
            주차 안내
          </p>
          <p className="text-sm text-secondary whitespace-pre-line leading-relaxed">
            {parkingNotes}
          </p>
        </Card>
      )}
    </div>
  );
}
