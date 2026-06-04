"use client";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
}

type LoadState = "loading" | "ready" | "no-key" | "sdk-failed";

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
    const KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!KEY) {
      setState("no-key");
      return;
    }

    function init() {
      if (!ref.current || !window.kakao?.maps) return;
      window.kakao.maps.load(() => {
        if (!ref.current) return;
        const center = new window.kakao.maps.LatLng(lat, lng);
        const map = new window.kakao.maps.Map(ref.current, {
          center,
          level: 4,
        });
        const marker = new window.kakao.maps.Marker({ position: center });
        marker.setMap(map);
        const info = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:6px 10px;font-size:12px;">${name}</div>`,
        });
        info.open(map, marker);
        setState("ready");
      });
    }

    if (window.kakao?.maps) {
      init();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>("script[data-kakao-sdk]");
    if (existing) {
      existing.addEventListener("load", init, { once: true });
      existing.addEventListener("error", () => setState("sdk-failed"), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KEY}&autoload=false`;
    script.dataset.kakaoSdk = "true";
    script.onload = init;
    script.onerror = () => setState("sdk-failed");
    document.head.appendChild(script);

    // If we never reach ready within 5s, surface a hint
    const timer = setTimeout(() => {
      setState((s) => (s === "loading" ? "sdk-failed" : s));
    }, 5000);
    return () => clearTimeout(timer);
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
