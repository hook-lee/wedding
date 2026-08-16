"use client";
import { useRef, useState } from "react";
import { Card } from "@/app/_ui/Card";
import { Input } from "@/app/_ui/Input";
import { Icon } from "./Icon";
import { formatKstDateTime } from "@/lib/date/kst";
import { resizedPhoto, PHOTO_WIDTHS } from "@/lib/images/resize";

type SharedPhoto = { id: string; url: string; uploader_name: string | null };

export function PhotoShareView({
  slug,
  initial,
  isOpen,
  weddingAt,
  note,
}: {
  slug: string;
  initial: SharedPhoto[];
  isOpen: boolean;
  weddingAt: string | null;
  note: string;
}) {
  const [photos, setPhotos] = useState<SharedPhoto[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList) {
    setBusy(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        if (name.trim()) fd.append("name", name.trim());
        const r = await fetch(`/api/w/${encodeURIComponent(slug)}/share-photo`, {
          method: "POST",
          body: fd,
        });
        const json = (await r.json()) as { url?: string; error?: string };
        if (!r.ok || !json.url) {
          setError(json.error ?? "업로드에 실패했어요.");
          break;
        }
        // Optimistic: the row exists server-side, we just don't have its id
        // until a refetch. A synthetic key is enough for rendering.
        setPhotos((prev) => [
          { id: json.url!, url: json.url!, uploader_name: name.trim() || null },
          ...prev,
        ]);
      }
    } catch {
      setError("업로드에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      {note.trim() && (
        <p className="text-sm text-secondary whitespace-pre-line leading-relaxed text-center max-w-xs mx-auto">
          {note}
        </p>
      )}

      {isOpen ? (
        <Card className="space-y-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            placeholder="이름 (선택)"
            aria-label="이름"
          />
          <label className="cursor-pointer block">
            <span className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-5 bg-ink text-bg rounded-pill text-sm font-medium shadow-card hover:opacity-90 active:opacity-80 transition-opacity">
              <Icon name="image" className="w-4 h-4" />
              {busy ? "올리는 중..." : "사진 올리기"}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files;
                if (f?.length) void upload(f);
              }}
            />
          </label>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <p className="text-[11px] text-muted text-center">
            한 장당 8MB까지 · 여러 장 한 번에 선택할 수 있어요
          </p>
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-secondary text-center">
            {weddingAt
              ? `${formatKstDateTime(weddingAt)} 오픈 예정`
              : "아직 사진을 받고 있지 않아요."}
          </p>
        </Card>
      )}

      {photos.length > 0 && (
        <>
          <p className="text-xs text-muted text-center">총 {photos.length}장</p>
          <div className="grid grid-cols-3 gap-0.5">
            {photos.map((p, i) => (
              <button key={p.id} onClick={() => setLightbox(i)} className="aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resizedPhoto(p.url, PHOTO_WIDTHS.thumb)}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </>
      )}

      {lightbox !== null && photos[lightbox] && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resizedPhoto(photos[lightbox].url, PHOTO_WIDTHS.full)}
            alt=""
            className="max-w-full max-h-[85vh] object-contain"
          />
          {photos[lightbox].uploader_name && (
            <p className="text-white/80 text-sm pt-3">
              {photos[lightbox].uploader_name}
            </p>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(null);
            }}
            className="absolute top-4 right-4 text-white text-2xl"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
