"use client";
import { useEffect, useRef, useState } from "react";
import { Card, CardHeader } from "@/app/_ui/Card";
import { Input } from "@/app/_ui/Input";
import { Textarea } from "@/app/_ui/Textarea";
import { Button } from "@/app/_ui/Button";

type Pos = { x: number; y: number };
type StoryItem = {
  date: string;
  title: string;
  body: string;
  photo_url?: string;
  photo_position?: Pos;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Drag-to-reposition crop, shown at the same 4:3 ratio the public site renders. */
function PhotoPositioner({
  url,
  position,
  onChange,
}: {
  url: string;
  position: Pos;
  onChange: (p: Pos) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number; pos: Pos } | null>(null);
  const [live, setLive] = useState<Pos>(position);

  // Follow external resets (e.g. "가운데로") while not actively dragging.
  useEffect(() => {
    if (!dragStart.current) setLive(position);
  }, [position]);

  function onPointerDown(e: React.PointerEvent) {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY, pos: live };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragStart.current || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const dxPct = ((e.clientX - dragStart.current.x) / rect.width) * 100;
    const dyPct = ((e.clientY - dragStart.current.y) / rect.height) * 100;
    // Dragging right should reveal more of the photo's left side, so the
    // object-position value moves opposite to the pointer.
    setLive({
      x: clamp(dragStart.current.pos.x - dxPct, 0, 100),
      y: clamp(dragStart.current.pos.y - dyPct, 0, 100),
    });
  }

  function endDrag() {
    if (dragStart.current) onChange(live);
    dragStart.current = null;
  }

  return (
    <div className="space-y-1.5">
      <div
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative w-full max-w-[220px] aspect-[4/3] overflow-hidden rounded-md border border-border cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: "none" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ objectPosition: `${live.x}% ${live.y}%` }}
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-[11px] text-muted">사진을 드래그해서 보여줄 부분을 조정하세요</p>
        <button
          type="button"
          onClick={() => {
            const center = { x: 50, y: 50 };
            setLive(center);
            onChange(center);
          }}
          className="text-[11px] text-accent underline underline-offset-2 flex-shrink-0"
        >
          가운데로
        </button>
      </div>
    </div>
  );
}

export function StorySection({ items }: { items: StoryItem[] }) {
  const [list, setList] = useState<StoryItem[]>(
    items.length ? items : [{ date: "", title: "", body: "", photo_url: "" }],
  );
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputs = useRef<(HTMLInputElement | null)[]>([]);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);

  // Most edits here (drag position, add/remove, photo upload) never touch a
  // native <input>, so they don't fire the input/change event the admin's
  // live-preview listener depends on. Dispatch one manually whenever the
  // list changes so the preview pane stays in sync — same fix already
  // applied to SectionOrderSection/TabOrderSection.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    hiddenRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [list]);

  function update(i: number, key: "date" | "title" | "body" | "photo_url", val: string) {
    setList((prev) => prev.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));
  }

  function updatePosition(i: number, pos: Pos) {
    setList((prev) => prev.map((it, idx) => (idx === i ? { ...it, photo_position: pos } : it)));
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
      if (json.url) {
        setList((prev) =>
          prev.map((it, idx) =>
            idx === i ? { ...it, photo_url: json.url, photo_position: { x: 50, y: 50 } } : it,
          ),
        );
      }
    } finally {
      setUploadingIndex(null);
    }
  }

  function removePhoto(i: number) {
    setList((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, photo_url: "", photo_position: undefined } : it)),
    );
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
            {it.photo_url ? (
              <div className="space-y-2">
                <PhotoPositioner
                  url={it.photo_url}
                  position={it.photo_position ?? { x: 50, y: 50 }}
                  onChange={(pos) => updatePosition(i, pos)}
                />
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer text-xs inline-flex">
                    <span className="inline-flex items-center min-h-[44px] px-4 border border-border bg-surface rounded-md text-ink">
                      {busy ? "업로드 중..." : "사진 변경"}
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
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    disabled={busy}
                    className="text-xs text-red-600 px-2 min-h-[44px]"
                  >
                    사진 삭제
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer text-xs inline-flex">
                <span className="inline-flex items-center min-h-[44px] px-4 border border-border bg-surface rounded-md text-ink">
                  {busy ? "업로드 중..." : "+ 사진 추가"}
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
            )}
          </div>
        );
      })}

      <Button type="button" onClick={add} variant="ghost">
        + 항목 추가
      </Button>
      <input
        ref={hiddenRef}
        type="hidden"
        name="story_items_json"
        value={JSON.stringify(list)}
        readOnly
      />
    </Card>
  );
}
