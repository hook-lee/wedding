"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = { mainUrl: string | null; galleryUrls: string[] };

const MAX_GALLERY = 20;

export function PhotoSection({ mainUrl, galleryUrls }: Props) {
  const [busy, setBusy] = useState(false);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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

  const remainingSlots = MAX_GALLERY - galleryUrls.length;

  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-6 shadow-card">
      <h2 className="text-lg font-semibold">사진</h2>

      {/* Main photo */}
      <div className="space-y-2">
        <p className="text-sm text-secondary">메인 사진 (1장)</p>
        {mainUrl && (
          <div className="relative w-40 h-48">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mainUrl} alt="" className="w-full h-full object-cover rounded-sm" />
            <button
              type="button"
              disabled={busy}
              onClick={() => remove(mainUrl, "main")}
              className="absolute top-1 right-1 bg-ink text-bg text-xs px-2 py-1 rounded-pill"
            >
              삭제
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <label className="flex-1 cursor-pointer text-sm">
            <span className="inline-block px-3 py-2 border border-border bg-bg rounded-sm">
              {mainFile ? mainFile.name : "파일 선택"}
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
          <button
            type="button"
            disabled={busy || !mainFile}
            onClick={() => mainFile && uploadMain(mainFile)}
            className="px-4 py-2 bg-ink text-bg rounded-pill text-sm disabled:opacity-50"
          >
            {busy ? "업로드 중..." : "업로드"}
          </button>
        </div>
      </div>

      {/* Gallery */}
      <div className="space-y-2">
        <p className="text-sm text-secondary">갤러리 ({galleryUrls.length}/{MAX_GALLERY}장)</p>
        {galleryUrls.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {galleryUrls.map((u) => (
              <div key={u} className="relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" className="w-full h-full object-cover rounded-sm" />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => remove(u, "gallery")}
                  className="absolute top-1 right-1 bg-ink text-bg text-xs px-1.5 py-0.5 rounded-pill"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
        {remainingSlots <= 0 ? (
          <p className="text-xs text-muted">
            최대 {MAX_GALLERY}장에 도달했어요. 추가하려면 기존 사진을 먼저 삭제해주세요.
          </p>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <label className="flex-1 cursor-pointer text-sm">
                <span className="inline-block px-3 py-2 border border-border bg-bg rounded-sm">
                  {galleryFiles.length > 0
                    ? `${galleryFiles.length}개 파일 선택됨`
                    : "파일 선택 (여러 장 가능)"}
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
              <button
                type="button"
                disabled={busy || galleryFiles.length === 0}
                onClick={() => uploadGallery(galleryFiles)}
                className="px-4 py-2 bg-ink text-bg rounded-pill text-sm disabled:opacity-50 whitespace-nowrap"
              >
                {busy && progress
                  ? `${progress.current}/${progress.total} 업로드 중`
                  : galleryFiles.length > 0
                  ? `${galleryFiles.length}장 업로드`
                  : "업로드"}
              </button>
            </div>
            <p className="text-xs text-muted">
              남은 슬롯: {remainingSlots}장 · Ctrl/⌘ 또는 Shift로 여러 장 선택 가능
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
