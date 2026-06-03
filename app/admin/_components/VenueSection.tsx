"use client";
import { useState } from "react";

type PlaceProps = {
  prefix: "venue" | "parking";
  title: string;
  initialName: string;
  initialAddress: string;
  initialLat: number | null;
  initialLng: number | null;
};

function PlaceFields({
  prefix,
  title,
  initialName,
  initialAddress,
  initialLat,
  initialLng,
}: PlaceProps) {
  const [addr, setAddr] = useState(initialAddress);
  const [coord, setCoord] = useState<{ lat: number; lng: number } | null>(
    initialLat != null && initialLng != null ? { lat: initialLat, lng: initialLng } : null
  );
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "fail">("idle");
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  async function geocode() {
    if (!addr) return;
    setStatus("loading");
    setDebugInfo([]);
    const r = await fetch(`/api/geocode?q=${encodeURIComponent(addr)}`);
    const json = await r.json();
    if (json.ok) {
      setCoord({ lat: json.lat, lng: json.lng });
      setStatus("ok");
    } else {
      setCoord(null);
      setStatus("fail");
      if (Array.isArray(json.debug)) setDebugInfo(json.debug);
      else if (json.reason) setDebugInfo([json.reason]);
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <label className="block">
        <span className="text-xs text-secondary">이름</span>
        <input
          name={`${prefix}_name`}
          defaultValue={initialName}
          placeholder={prefix === "venue" ? "예: OO웨딩홀 그랜드볼룸" : "예: OO웨딩홀 지하 주차장"}
          className="w-full mt-1 p-2 rounded-sm border border-border bg-surface"
        />
      </label>
      <label className="block">
        <span className="text-xs text-secondary">주소 또는 장소명</span>
        <input
          name={`${prefix}_address`}
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          onBlur={geocode}
          placeholder="예: 서울시 강남구 OO로 123 / 또는 건물명"
          className="w-full mt-1 p-2 rounded-sm border border-border bg-surface"
        />
        {status === "loading" && <p className="text-xs text-muted mt-1">위치 확인 중…</p>}
        {status === "ok" && coord && (
          <p className="text-xs text-green-700 mt-1">
            좌표 확인됨 ({coord.lat.toFixed(4)}, {coord.lng.toFixed(4)})
          </p>
        )}
        {status === "fail" && (
          <div className="mt-1 space-y-1">
            <p className="text-xs text-red-600">
              위치를 찾지 못했습니다. 장소명이나 도로명 주소로 다시 시도해주세요.
            </p>
            {debugInfo.length > 0 && (
              <p className="text-[10px] text-muted font-mono">debug: {debugInfo.join(" | ")}</p>
            )}
          </div>
        )}
      </label>
      <input type="hidden" name={`${prefix}_lat`} value={coord?.lat ?? ""} />
      <input type="hidden" name={`${prefix}_lng`} value={coord?.lng ?? ""} />
    </div>
  );
}

type Props = {
  venueName: string;
  venueAddress: string;
  venueLat: number | null;
  venueLng: number | null;
  parkingName: string;
  parkingAddress: string;
  parkingLat: number | null;
  parkingLng: number | null;
};

export function VenueSection(p: Props) {
  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-5 shadow-card">
      <h2 className="text-lg font-semibold">식장 · 주차장</h2>

      <PlaceFields
        prefix="venue"
        title="🎂 예식장"
        initialName={p.venueName}
        initialAddress={p.venueAddress}
        initialLat={p.venueLat}
        initialLng={p.venueLng}
      />

      <div className="border-t border-border pt-4">
        <PlaceFields
          prefix="parking"
          title="🅿️ 주차장 (선택 — 비워두면 손님 화면에서 숨김)"
          initialName={p.parkingName}
          initialAddress={p.parkingAddress}
          initialLat={p.parkingLat}
          initialLng={p.parkingLng}
        />
      </div>
    </section>
  );
}
