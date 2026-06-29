"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader } from "@/app/_ui/Card";
import { Button } from "@/app/_ui/Button";

type Props = { mainUrl: string | null; galleryUrls: string[] };

const MAX_GALLERY = 20;

function GalleryThumb({
  url,
  busy,
  onRemove,
}: {
  url: string;
  busy: boolean;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: url });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    touchAction: "none",
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative aspect-[4/5] select-none"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        draggable={false}
        className="w-full h-full object-cover rounded-md pointer-events-none"
      />
      {/* X 버튼은 드래그 이벤트 안 받게 stopPropagation + onPointerDown 차단 */}
      <button
        type="button"
        disabled={busy}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-1 right-1 bg-ink text-bg text-xs px-1.5 py-0.5 rounded-pill disabled:opacity-50 z-10"
        aria-label="사진 삭제"
      >
        X
      </button>
    </div>
  );
}

export function PhotoSection({ mainUrl, galleryUrls }: Props) {
  const [busy, setBusy] = useState(false);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [orderedUrls, setOrderedUrls] = useState<string[]>(galleryUrls);
  const [reorderStatus, setReorderStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Re-sync local order whenever the server gives us a new list (after upload / delete / refresh)
  useEffect(() => {
    setOrderedUrls(galleryUrls);
  }, [galleryUrls]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function persistOrder(next: string[]) {
    setReorderStatus("saving");
    try {
      const r = await fetch("/api/admin/reorder-gallery", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ urls: next }),
      });
      if (!r.ok) throw new Error(await r.text());
      setReorderStatus("saved");
      setTimeout(() => setReorderStatus("idle"), 1500);
    } catch {
      setReorderStatus("error");
      setOrderedUrls(galleryUrls); // 실패 시 서버 상태로 롤백
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedUrls.indexOf(String(active.id));
    const newIndex = orderedUrls.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(orderedUrls, oldIndex, newIndex);
    setOrderedUrls(next); // optimistic
    void persistOrder(next);
  }

  async function uploadMain(file: File) {
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", "main");
    const r = await fetch("/api/admin/upload-photo", { method: "POST", body: fd });
    setBusy(false);
    if (!r.ok) {
      const text = await r.text().catch(() => "");
      alert(`업로드 실패: ${text || r.status}`);
      return;
    }
    setMainFile(null);
    if (mainInputRef.current) mainInputRef.current.value = "";
    router.refresh();
  }

  async function uploadGallery(files: File[]) {
    if (files.length === 0) return;
    setBusy(true);
    setProgress({ current: 0, total: files.length });
    let failed = 0;
    let stopReason: string | null = null;
    for (let i = 0; i < files.length; i++) {
      setProgress({ current: i + 1, total: files.length });
      const fd = new FormData();
      fd.append("file", files[i]);
      fd.append("kind", "gallery");
      const r = await fetch("/api/admin/upload-photo", { method: "POST", body: fd });
      if (!r.ok) {
        failed++;
        const text = await r.text().catch(() => "");
        // Stop early if server says max reached
        if (text.includes("최대")) {
          stopReason = text;
          break;
        }
      }
    }
    setBusy(false);
    setProgress(null);
    setGalleryFiles([]);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
    if (stopReason) alert(`업로드 중단: ${stopReason}`);
    else if (failed > 0) alert(`${failed}장 업로드 실패`);
    router.refresh();
  }

  async function remove(url: string, kind: "main" | "gallery") {
    setBusy(true);
    await fetch("/api/admin/delete-photo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url, kind }),
    });
    setBusy(false);
    router.refresh();
  }

  const remainingSlots = MAX_GALLERY - orderedUrls.length;

  return (
    <Card>
      <CardHeader title="사진" />

      {/* Main photo */}
      <div className="space-y-2">
        <p className="text-sm text-secondary font-medium">메인 사진 (1장)</p>
        {mainUrl && (
          <div className="relative w-40 h-48">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mainUrl} alt="" className="w-full h-full object-cover rounded-md" />
            <button
              type="button"
              disabled={busy}
              onClick={() => remove(mainUrl, "main")}
              className="absolute top-1 right-1 bg-ink text-bg text-xs px-2 py-1 rounded-pill disabled:opacity-50"
            >
              삭제
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex-1 min-w-0 cursor-pointer text-sm">
            <span className="inline-flex items-center min-h-[44px] px-3 border border-border bg-bg rounded-md text-ink w-full">
              <span className="truncate">{mainFile ? mainFile.name : "파일 선택"}</span>
            </span>
            <input
              ref={mainInputRef}
              type="file"
              accept="image/*"
              hidden
              disabled={busy}
              onChange={(e) => setMainFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <Button
            type="button"
            disabled={busy || !mainFile}
            onClick={() => mainFile && uploadMain(mainFile)}
            variant="primary"
          >
            {busy ? "업로드 중..." : "업로드"}
          </Button>
        </div>
      </div>

      {/* Gallery */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-secondary font-medium">
            갤러리 ({orderedUrls.length}/{MAX_GALLERY}장)
          </p>
          {orderedUrls.length > 1 && (
            <p className="text-[11px] text-muted">
              {reorderStatus === "saving"
                ? "순서 저장 중…"
                : reorderStatus === "saved"
                ? "순서 저장됨 ✓"
                : reorderStatus === "error"
                ? "저장 실패"
                : "드래그해서 순서 변경"}
            </p>
          )}
        </div>
        {orderedUrls.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={orderedUrls} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {orderedUrls.map((u) => (
                  <GalleryThumb
                    key={u}
                    url={u}
                    busy={busy}
                    onRemove={() => remove(u, "gallery")}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        {remainingSlots <= 0 ? (
          <p className="text-xs text-muted">
            최대 {MAX_GALLERY}장에 도달했어요. 추가하려면 기존 사진을 먼저 삭제해주세요.
          </p>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <label className="flex-1 min-w-0 cursor-pointer text-sm">
                <span className="inline-flex items-center min-h-[44px] px-3 border border-border bg-bg rounded-md text-ink w-full">
                  <span className="truncate">
                    {galleryFiles.length > 0
                      ? `${galleryFiles.length}개 파일 선택됨`
                      : "파일 선택 (여러 장 가능)"}
                  </span>
                </span>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  multiple
                  disabled={busy}
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    if (files.length > remainingSlots) {
                      alert(`남은 슬롯이 ${remainingSlots}장이라 처음 ${remainingSlots}장만 사용해요.`);
                      setGalleryFiles(files.slice(0, remainingSlots));
                    } else {
                      setGalleryFiles(files);
                    }
                  }}
                />
              </label>
              <Button
                type="button"
                disabled={busy || galleryFiles.length === 0}
                onClick={() => uploadGallery(galleryFiles)}
                variant="primary"
                className="whitespace-nowrap"
              >
                {busy && progress
                  ? `${progress.current}/${progress.total} 업로드 중`
                  : galleryFiles.length > 0
                  ? `${galleryFiles.length}장 업로드`
                  : "업로드"}
              </Button>
            </div>
            <p className="text-xs text-muted">
              남은 슬롯: {remainingSlots}장 · Ctrl/⌘ 또는 Shift로 여러 장 선택 가능
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
