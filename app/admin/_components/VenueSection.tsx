"use client";
import { useState } from "react";
import { MapPicker } from "./MapPicker";

type Candidate = {
  lat: number;
  lng: number;
  place_name: string;
  address_name: string;
};

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
  const [picked, setPicked] = useState<{ lat: number; lng: number; label?: string } | null>(
    initialLat != null && initialLng != null
      ? { lat: initialLat, lng: initialLng, label: initialName || initialAddress }
      : null,
  );
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "fail">("idle");
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);

  async function search() {
    if (!addr) return;
    setStatus("loading");
    setDebugInfo([]);
    setCandidates([]);
    const r = await fetch(`/api/geocode?q=${encodeURIComponent(addr)}`);
    const json = await r.json();
    if (json.ok && Array.isArray(json.candidates) && json.candidates.length > 0) {
      setCandidates(json.candidates);
      // Auto-pick the first candidate but allow the user to override
      const top = json.candidates[0];
      setPicked({ lat: top.lat, lng: top.lng, label: top.place_name });
      setStatus("ok");
    } else {
      setStatus("fail");
      if (Array.isArray(json.debug)) setDebugInfo(json.debug);
      else if (json.reason) setDebugInfo([json.reason]);
    }
  }

  function pick(c: Candidate) {
    setPicked({ lat: c.lat, lng: c.lng, label: c.place_name });
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
      <div className="space-y-1">
        <label className="block">
          <span className="text-xs text-secondary">주소 또는 장소명</span>
          <div className="flex gap-2 mt-1">
            <input
              name={`${prefix}_address`}
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              placeholder="예: 자작마루 / 100주년기념관 / 서울시립대로 163"
              className="flex-1 min-w-0 p-2 rounded-sm border border-border bg-surface"
            />
            <button
              type="button"
              onClick={search}
              disabled={status === "loading"}
              className="px-3 py-2 bg-ink text-bg rounded-pill text-sm whitespace-nowrap disabled:opacity-50"
            >
              {status === "loading" ? "검색 중..." : "검색"}
            </button>
          </div>
        </label>

        {/* 후보 리스트 */}
        {candidates.length > 0 && (
          <div className="mt-2 space-y-1 p-2 bg-bg border border-border rounded-sm">
            <p className="text-xs text-muted mb-1">검색 결과 ({candidates.length}개) — 정확한 위치를 선택하세요</p>
            {candidates.map((c, i) => {
              const isPicked = picked?.lat === c.lat && picked?.lng === c.lng;
              return (
                <button
                  key={`${c.lat}-${c.lng}-${i}`}
                  type="button"
                  onClick={() => pick(c)}
                  className={`block w-full text-left p-2 rounded-sm border text-xs ${
                    isPicked
                      ? "bg-ink text-bg border-ink"
                      : "bg-surface border-border hover:bg-bg"
                  }`}
                >
                  <div className="font-semibold">
                    {isPicked && "✓ "}
                    {c.place_name}
                  </div>
                  {c.address_name && (
                    <div className={isPicked ? "opacity-80" : "text-muted"}>
                      {c.address_name}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* 현재 선택된 위치 표시 */}
        {picked && status !== "loading" && (
          <p className="text-xs text-muted mt-2">
            선택된 좌표: ({picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}) ·{" "}
            <a
              href={`https://map.kakao.com/link/map/${encodeURIComponent(picked.label || "도착지")},${picked.lat},${picked.lng}`}
              target="_blank"
              rel="noreferrer"
              className="underline text-accent"
            >
              지도에서 확인 ↗
            </a>
          </p>
        )}

        {status === "fail" && (
          <div className="mt-1 space-y-1">
            <p className="text-xs text-red-600">
              위치를 찾지 못했습니다. 더 구체적인 이름이나 도로명 주소로 다시 시도해주세요.
            </p>
            {debugInfo.length > 0 && (
              <p className="text-[10px] text-muted font-mono">debug: {debugInfo.join(" | ")}</p>
            )}
          </div>
        )}

        {/* 지도에서 직접 선택 (검색 결과로 못 찾는 케이스용) */}
        <div className="mt-2">
          {!showMap && (
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="text-xs underline text-accent"
            >
              🗺 지도에서 직접 위치 클릭해서 정확하게 잡기
            </button>
          )}
          {showMap && (
            <div className="mt-2 space-y-1">
              <MapPicker
                lat={picked?.lat ?? null}
                lng={picked?.lng ?? null}
                onChange={(lat, lng) =>
                  setPicked({ lat, lng, label: picked?.label ?? addr })
                }
              />
              <button
                type="button"
                onClick={() => setShowMap(false)}
                className="text-[10px] underline text-muted"
              >
                지도 닫기
              </button>
            </div>
          )}
        </div>
      </div>
      <input type="hidden" name={`${prefix}_lat`} value={picked?.lat ?? ""} />
      <input type="hidden" name={`${prefix}_lng`} value={picked?.lng ?? ""} />
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
      <p className="text-xs text-muted">
        💡 주소·장소명 입력 후 <strong>검색</strong> 버튼 → 검색 결과 중 정확한 위치 선택. 같은 캠퍼스 안의 다른 건물도 골라 잡을 수 있습니다.
      </p>

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
