"use client";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
}

type Props = {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
};

const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };

export function MapPicker({ lat, lng, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const initialLat = useRef(lat ?? SEOUL_CENTER.lat);
  const initialLng = useRef(lng ?? SEOUL_CENTER.lng);

  // Keep latest onChange in ref so the click handler always sees current closure
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Init map once
  useEffect(() => {
    const KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!KEY) return;

    function init() {
      if (!ref.current || !window.kakao?.maps) return;
      window.kakao.maps.load(() => {
        if (!ref.current) return;
        const center = new window.kakao.maps.LatLng(initialLat.current, initialLng.current);
        const map = new window.kakao.maps.Map(ref.current, { center, level: 3 });
        mapRef.current = map;
        const marker = new window.kakao.maps.Marker({ position: center });
        marker.setMap(map);
        markerRef.current = marker;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.kakao.maps.event.addListener(map, "click", (mouseEvent: any) => {
          const latlng = mouseEvent.latLng;
          marker.setPosition(latlng);
          onChangeRef.current(latlng.getLat(), latlng.getLng());
        });
      });
    }

    if (window.kakao?.maps) {
      init();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>("script[data-kakao-sdk]");
    if (existing) {
      existing.addEventListener("load", init, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KEY}&autoload=false`;
    script.dataset.kakaoSdk = "true";
    script.onload = init;
    document.head.appendChild(script);
  }, []);

  // Move marker when parent updates lat/lng (e.g., user picked a search candidate)
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || lat == null || lng == null) return;
    if (!window.kakao?.maps) return;
    const pos = new window.kakao.maps.LatLng(lat, lng);
    markerRef.current.setPosition(pos);
    mapRef.current.panTo(pos);
  }, [lat, lng]);

  return (
    <div className="space-y-1">
      <div
        ref={ref}
        className="w-full h-64 rounded-md border border-border bg-bg"
      />
      <p className="text-[10px] text-muted text-center">
        🖱 지도를 클릭하면 그 위치가 정확한 좌표로 저장됩니다 (확대해서 정밀히)
      </p>
    </div>
  );
}
