"use client";
import { useEffect, useRef, useState } from "react";
import { Card, CardHeader } from "@/app/_ui/Card";
import { Input } from "@/app/_ui/Input";
import type { SponsorLogo, SponsorTitle } from "@/lib/extras/types";

const MAX_LOGOS = 10;

type Logo = { url: string; scale: number };

export function SponsorSection({
  title,
  logos,
  slogan,
}: {
  title: SponsorTitle;
  logos: SponsorLogo[];
  slogan: string;
}) {
  const [list, setList] = useState<Logo[]>(
    logos.map((l) => ({ url: l.url, scale: l.scale ?? 100 })),
  );
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);

  // Uploading/resizing/removing a logo only changes React state — no native
  // <input> event fires from that, so the admin's live-preview listener
  // (which watches for real input/change events bubbling from the form)
  // wouldn't otherwise notice. Same fix as StorySection/SectionOrderSection.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    hiddenRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [list]);

  async function uploadLogo(file: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "sponsor");
      const r = await fetch("/api/admin/upload-photo", { method: "POST", body: fd });
      if (!r.ok) {
        const text = await r.text().catch(() => "");
        alert(`업로드 실패: ${text || r.status}`);
        return;
      }
      const json = (await r.json()) as { url?: string };
      if (json.url) setList((prev) => [...prev, { url: json.url!, scale: 100 }]);
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function updateScale(i: number, scale: number) {
    setList((prev) => prev.map((l, idx) => (idx === i ? { ...l, scale } : l)));
  }

  function removeLogo(idx: number) {
    setList((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <Card>
      <CardHeader
        title="스폰서"
        hint="스폰서·협찬사가 있을 때만 켜서 사용하세요. 로고는 여러 개 올릴 수 있고, 업체마다 로고 여백이 달라서 보기에 작거나 크면 크기를 따로 조절할 수 있어요."
      />

      <div>
        <p className="text-sm text-secondary font-medium mb-2">제목</p>
        <div className="flex gap-2 flex-wrap">
          <label className="cursor-pointer">
            <input
              type="radio"
              name="sponsor_title"
              value="sponsored_by"
              defaultChecked={title === "sponsored_by"}
              className="peer sr-only"
            />
            <span className="inline-flex items-center min-h-[44px] px-4 rounded-pill border border-border peer-checked:bg-ink peer-checked:text-bg text-sm transition-colors">
              Sponsored by
            </span>
          </label>
          <label className="cursor-pointer">
            <input
              type="radio"
              name="sponsor_title"
              value="supported_by"
              defaultChecked={title === "supported_by"}
              className="peer sr-only"
            />
            <span className="inline-flex items-center min-h-[44px] px-4 rounded-pill border border-border peer-checked:bg-ink peer-checked:text-bg text-sm transition-colors">
              Supported by
            </span>
          </label>
          <label className="cursor-pointer">
            <input
              type="radio"
              name="sponsor_title"
              value="none"
              defaultChecked={title === "none"}
              className="peer sr-only"
            />
            <span className="inline-flex items-center min-h-[44px] px-4 rounded-pill border border-border peer-checked:bg-ink peer-checked:text-bg text-sm transition-colors">
              제목 사용 안 함
            </span>
          </label>
        </div>
      </div>

      {list.length > 0 && (
        <div className="space-y-2">
          {list.map((logo, i) => (
            <div
              key={logo.url + i}
              className="flex items-center gap-3 bg-bg border border-border rounded-md p-2"
            >
              <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-surface border border-border rounded-md overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.url}
                  alt=""
                  className="max-w-full max-h-full object-contain"
                  style={{ transform: `scale(${logo.scale / 100})` }}
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">크기</span>
                  <span className="text-xs text-ink tabular-nums">{logo.scale}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={150}
                  step={5}
                  value={logo.scale}
                  onChange={(e) => updateScale(i, Number(e.target.value))}
                  className="w-full"
                  aria-label="로고 크기"
                />
              </div>
              <button
                type="button"
                onClick={() => removeLogo(i)}
                className="text-xs text-red-600 px-2 min-h-[44px] flex-shrink-0"
                aria-label="로고 삭제"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}

      {list.length < MAX_LOGOS && (
        <label className="cursor-pointer text-xs inline-flex">
          <span className="inline-flex items-center min-h-[44px] px-4 border border-border bg-surface rounded-md text-ink">
            {busy ? "업로드 중..." : "+ 로고 추가"}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadLogo(f);
            }}
          />
        </label>
      )}

      <div>
        <p className="text-sm text-secondary font-medium mb-1">슬로건 (선택)</p>
        <Input name="sponsor_slogan" defaultValue={slogan} placeholder="한 문장으로 소개해보세요" />
      </div>

      <input
        ref={hiddenRef}
        type="hidden"
        name="sponsor_logos_json"
        value={JSON.stringify(list)}
        readOnly
      />
    </Card>
  );
}
