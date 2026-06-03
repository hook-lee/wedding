"use client";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
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

  useEffect(() => {
    const KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!KEY) return;

    function init() {
      if (!ref.current || !window.kakao?.maps) return;
      window.kakao.maps.load(() => {
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
      });
    }

    if (window.kakao?.maps) {
      init();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-kakao-sdk]"
    );
    if (existing) {
      existing.addEventListener("load", init, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KEY}&autoload=false`;
    script.dataset.kakaoSdk = "true";
    script.onload = init;
    document.head.appendChild(script);
  }, [lat, lng, name]);

  return (
    <div
      ref={ref}
      className="w-full h-64 rounded-md border border-border"
    />
  );
}
