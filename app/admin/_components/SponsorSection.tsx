"use client";
import { useEffect, useRef, useState } from "react";
import { Card, CardHeader } from "@/app/_ui/Card";
import { Input } from "@/app/_ui/Input";
import type { SponsorTitle } from "@/lib/extras/types";

const MAX_LOGOS = 10;

export function SponsorSection({
  title,
  logos,
  slogan,
}: {
  title: SponsorTitle;
  logos: string[];
  slogan: string;
}) {
  const [list, setList] = useState<string[]>(logos);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);

  // Uploading/removing a logo only changes React state — no native <input>
  // event fires from that, so the admin's live-preview listener (which
  // watches for real input/change events bubbling from the form) wouldn't
  // otherwise notice. Same fix as StorySection/SectionOrderSection.
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
      if (json.url) setList((prev) => [...prev, json.url!]);
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeLogo(idx: number) {
    setList((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <Card>
      <CardHeader
        title="스폰서"
        hint="스폰서·협찬사가 있을 때만 켜서 사용하세요. 로고는 여러 개 올릴 수 있어요."
      />

      <div>
        <p className="text-sm text-secondary font-medium mb-2">제목</p>
        <div className="flex gap-2">
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
        </div>
      </div>

      {list.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {list.map((url, i) => (
            <div
              key={url + i}
              className="relative aspect-square bg-bg border border-border rounded-md flex items-center justify-center p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="max-w-full max-h-full object-contain" />
              <button
                type="button"
                onClick={() => removeLogo(i)}
                className="absolute top-1 right-1 bg-ink text-bg text-[10px] px-1.5 py-0.5 rounded-pill"
                aria-label="로고 삭제"
              >
                X
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
