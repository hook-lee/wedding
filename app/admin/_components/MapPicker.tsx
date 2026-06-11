"use client";
import { useEffect, useRef, useState } from "react";
import { KakaoSdkError, loadKakaoMapsSdk } from "@/lib/kakao/load-sdk";

type Props = {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
};

type LoadState = "loading" | "ready" | "no-key" | "sdk-failed";

const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };

export function MapPicker({ lat, lng, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clickListenerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapsModuleRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const initialLat = useRef(lat ?? SEOUL_CENTER.lat);
  const initialLng = useRef(lng ?? SEOUL_CENTER.lng);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Mount once: load SDK, build the map, attach click listener.
  // Cleanup: drop listener and refs to avoid leaks across open/close cycles.
  useEffect(() => {
    let cancelled = false;

    loadKakaoMapsSdk()
      .then((maps) => {
        if (cancelled || !ref.current) return;
        mapsModuleRef.current = maps;
        const center = new maps.LatLng(initialLat.current, initialLng.current);
        const map = new maps.Map(ref.current, { center, level: 3 });
        const marker = new maps.Marker({ position: center });
        marker.setMap(map);
        mapRef.current = map;
        markerRef.current = marker;

        clickListenerRef.current = maps.event.addListener(
          map,
          "click",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (mouseEvent: any) => {
            const latlng = mouseEvent.latLng;
            marker.setPosition(latlng);
            onChangeRef.current(latlng.getLat(), latlng.getLng());
          },
        );
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
      const maps = mapsModuleRef.current;
      if (maps && clickListenerRef.current) {
        try {
          maps.event.removeListener(clickListenerRef.current);
        } catch {
          /* ignore */
        }
      }
      if (markerRef.current) {
        try {
          markerRef.current.setMap(null);
        } catch {
          /* ignore */
        }
      }
      clickListenerRef.current = null;
      markerRef.current = null;
      mapRef.current = null;
      mapsModuleRef.current = null;
    };
  }, []);

  // Move marker when parent updates lat/lng (e.g., user picks a search candidate).
  useEffect(() => {
    const maps = mapsModuleRef.current;
    if (!mapRef.current || !markerRef.current || !maps) return;
    if (lat == null || lng == null) return;
    const pos = new maps.LatLng(lat, lng);
    markerRef.current.setPosition(pos);
    mapRef.current.panTo(pos);
  }, [lat, lng]);

  return (
    <div className="space-y-1">
      <div className="w-full h-64 rounded-md border border-border bg-bg relative">
        <div ref={ref} className="w-full h-full rounded-md" />
        {state !== "ready" && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted px-4 text-center">
            {state === "loading" && "지도 불러오는 중…"}
            {state === "no-key" && "Kakao 지도 키가 설정되지 않았습니다."}
            {state === "sdk-failed" && "지도를 표시할 수 없습니다."}
          </div>
        )}
      </div>
      <p className="text-[10px] text-muted text-center">
        🖱 지도를 클릭하면 그 위치가 정확한 좌표로 저장됩니다 (확대해서 정밀히)
      </p>
    </div>
  );
}
