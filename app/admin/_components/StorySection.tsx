"use client";
import { useRef, useState } from "react";
import { Card, CardHeader } from "@/app/_ui/Card";
import { Input } from "@/app/_ui/Input";
import { Textarea } from "@/app/_ui/Textarea";
import { Button } from "@/app/_ui/Button";

type PhotoPosition = "top" | "center" | "bottom";
type StoryItem = {
  date: string;
  title: string;
  body: string;
  photo_url?: string;
  photo_position?: PhotoPosition;
};

const POSITION_LABELS: Record<PhotoPosition, string> = {
  top: "상단",
  center: "중앙",
  bottom: "하단",
};

export function StorySection({ items }: { items: StoryItem[] }) {
  const [list, setList] = useState<StoryItem[]>(
    items.length ? items : [{ date: "", title: "", body: "", photo_url: "" }],
  );
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputs = useRef<(HTMLInputElement | null)[]>([]);

  function update(i: number, key: keyof StoryItem, val: string) {
    setList((prev) => prev.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));
  }

  function add() {
    setList((prev) => [...prev, { date: "", title: "", body: "", photo_url: "" }]);
  }

  function remove(i: number) {
    setList((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function uploadPhoto(i: number, file: File) {
    setUploadingIndex(i);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "story");
      const r = await fetch("/api/admin/upload-photo", { method: "POST", body: fd });
      if (!r.ok) {
        const text = await r.text().catch(() => "");
        alert(`업로드 실패: ${text || r.status}`);
        return;
      }
      const json = (await r.json()) as { url?: string };
      if (json.url) update(i, "photo_url", json.url);
    } finally {
      setUploadingIndex(null);
    }
  }

  function removePhoto(i: number) {
    update(i, "photo_url", "");
    if (fileInputs.current[i]) fileInputs.current[i]!.value = "";
  }

  return (
    <Card>
      <CardHeader
        title="우리 스토리"
        hint="각 항목에 날짜·제목·내용 + 선택적으로 사진을 추가할 수 있어요."
      />

      {list.map((it, i) => {
        const busy = uploadingIndex === i;
        return (
          <div
            key={i}
            className="bg-bg border border-border rounded-md p-3 space-y-2"
          >
            <div className="grid grid-cols-[110px_1fr_auto] gap-2 items-start">
              <Input
                value={it.date}
                onChange={(e) => update(i, "date", e.target.value)}
                placeholder="2023.05"
                aria-label="날짜"
                className="text-sm"
              />
              <Input
                value={it.title}
                onChange={(e) => update(i, "title", e.target.value)}
                placeholder="제목"
                aria-label="제목"
                className="text-sm"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-red-600 text-sm self-start px-2 min-h-[44px]"
                aria-label="항목 삭제"
              >
                ✕
              </button>
            </div>

            <Textarea
              value={it.body}
              onChange={(e) => update(i, "body", e.target.value)}
              placeholder="내용"
              rows={2}
              aria-label="내용"
              className="text-sm"
            />

            {/* 사진 영역 */}
            <div className="flex items-center gap-3">
              {it.photo_url && (
                <div className="relative w-20 h-20 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.photo_url}
                    alt=""
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    disabled={busy}
                    className="absolute top-0.5 right-0.5 bg-ink text-bg text-[10px] px-1.5 py-0.5 rounded-pill"
                    aria-label="사진 삭제"
                  >
                    X
                  </button>
                </div>
              )}
              <label className="cursor-pointer text-xs inline-flex">
                <span className="inline-flex items-center min-h-[44px] px-4 border border-border bg-surface rounded-md text-ink">
                  {busy ? "업로드 중..." : it.photo_url ? "사진 변경" : "+ 사진 추가"}
                </span>
                <input
                  ref={(el) => {
                    fileInputs.current[i] = el;
                  }}
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={busy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadPhoto(i, f);
                  }}
                />
              </label>
            </div>

            {/* 세로 사진이 청첩장에서 위/아래로 잘릴 때, 어느 쪽을 남길지 선택 */}
            {it.photo_url && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-muted">사진 위치</span>
                {(Object.keys(POSITION_LABELS) as PhotoPosition[]).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => update(i, "photo_position", pos)}
                    className={`px-2.5 py-1 rounded-pill text-xs border transition-colors ${
                      (it.photo_position ?? "center") === pos
                        ? "bg-ink text-bg border-ink"
                        : "bg-surface text-ink border-border"
                    }`}
                  >
                    {POSITION_LABELS[pos]}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <Button type="button" onClick={add} variant="ghost">
        + 항목 추가
      </Button>
      <input type="hidden" name="story_items_json" value={JSON.stringify(list)} />
    </Card>
  );
}
