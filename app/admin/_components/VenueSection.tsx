"use client";
import { useState } from "react";

type Props = { name: string; address: string; lat: number | null; lng: number | null };

export function VenueSection({ name, address, lat, lng }: Props) {
  const [addr, setAddr] = useState(address);
  const [coord, setCoord] = useState<{ lat: number; lng: number } | null>(
    lat != null && lng != null ? { lat, lng } : null
  );
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "fail">("idle");

  async function geocode() {
    if (!addr) return;
    setStatus("loading");
    const r = await fetch(`/api/geocode?q=${encodeURIComponent(addr)}`);
    const json = await r.json();
    if (json.ok) {
      setCoord({ lat: json.lat, lng: json.lng });
      setStatus("ok");
    } else {
      setCoord(null);
      setStatus("fail");
    }
  }

  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">식장</h2>
      <label className="block">
        <span className="text-sm text-secondary">식장 이름</span>
        <input
          name="venue_name"
          defaultValue={name}
          className="w-full mt-1 p-2 rounded-sm border border-border bg-surface"
        />
      </label>
      <label className="block">
        <span className="text-sm text-secondary">주소 또는 식장명</span>
        <input
          name="venue_address"
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          onBlur={geocode}
          placeholder="예: 서울시 강남구 OO로 123 / 또는 OO웨딩홀"
          className="w-full mt-1 p-2 rounded-sm border border-border bg-surface"
        />
        {status === "loading" && <p className="text-xs text-muted mt-1">위치 확인 중…</p>}
        {status === "ok" && coord && (
          <p className="text-xs text-green-700 mt-1">
            좌표 확인됨 ({coord.lat.toFixed(4)}, {coord.lng.toFixed(4)})
          </p>
        )}
        {status === "fail" && (
          <p className="text-xs text-red-600 mt-1">
            위치를 찾지 못했습니다. 식장명이나 도로명 주소(예: &quot;강남구 테헤란로 123&quot;)로 다시 시도해주세요.
          </p>
        )}
      </label>
      <input type="hidden" name="venue_lat" value={coord?.lat ?? ""} />
      <input type="hidden" name="venue_lng" value={coord?.lng ?? ""} />
    </section>
  );
}
