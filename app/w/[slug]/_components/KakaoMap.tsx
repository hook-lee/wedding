"use client";
import { useEffect, useRef, useState } from "react";
import { KakaoSdkError, loadKakaoMapsSdk } from "@/lib/kakao/load-sdk";

type LoadState = "loading" | "ready" | "no-key" | "sdk-failed";

// venue_name is owner-controlled but rendered into Kakao InfoWindow HTML —
// escape before interpolation to prevent stored XSS on the shared origin.
function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c]!,
  );
}

export function KakaoMap({
  lat,
  lng,
  name,
}: {
  lat: number;
  lng: number;
  name: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;
    loadKakaoMapsSdk()
      .then((maps) => {
        if (cancelled || !ref.current) return;
        const center = new maps.LatLng(lat, lng);
        const map = new maps.Map(ref.current, { center, level: 4 });
        const marker = new maps.Marker({ position: center });
        marker.setMap(map);
        const info = new maps.InfoWindow({
          content: `<div style="padding:6px 10px;font-size:12px;">${escapeHtml(name)}</div>`,
        });
        info.open(map, marker);
        setState("ready");
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof KakaoSdkError && e.reason === "no-key") {
          setState("no-key");
        } else {
          setState("sdk-failed");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lng, name]);

  return (
    <div className="w-full h-64 rounded-md border border-border relative bg-bg">
      <div ref={ref} className="w-full h-full rounded-md" />
      {state !== "ready" && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted px-4 text-center">
          {state === "loading" && "지도 불러오는 중…"}
          {state === "no-key" && (
            <span>
              Kakao 지도 키가 설정되지 않았습니다.
              <br />
              <span className="text-[10px]">
                (Vercel 환경 변수 NEXT_PUBLIC_KAKAO_MAP_KEY 확인 후 재배포 필요)
              </span>
            </span>
          )}
          {state === "sdk-failed" && (
            <span>
              지도를 표시할 수 없습니다.
              <br />
              <span className="text-[10px]">
                (카카오 앱에 도메인이 등록됐고 카카오맵 제품이 활성인지 확인 필요)
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
