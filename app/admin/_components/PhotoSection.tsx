"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = { mainUrl: string | null; galleryUrls: string[] };

export function PhotoSection({ mainUrl, galleryUrls }: Props) {
  const [busy, setBusy] = useState(false);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function upload(file: File, kind: "main" | "gallery") {
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    const r = await fetch("/api/admin/upload-photo", { method: "POST", body: fd });
    setBusy(false);
    if (!r.ok) {
      const text = await r.text().catch(() => "");
      alert(`업로드 실패: ${text || r.status}`);
      return;
    }
    if (kind === "main") {
      setMainFile(null);
      if (mainInputRef.current) mainInputRef.current.value = "";
    } else {
      setGalleryFile(null);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
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
            onClick={() => mainFile && upload(mainFile, "main")}
            className="px-4 py-2 bg-ink text-bg rounded-pill text-sm disabled:opacity-50"
          >
            {busy ? "업로드 중..." : "업로드"}
          </button>
        </div>
      </div>

      {/* Gallery */}
      <div className="space-y-2">
        <p className="text-sm text-secondary">갤러리 ({galleryUrls.length}/20장)</p>
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
        {galleryUrls.length >= 20 ? (
          <p className="text-xs text-muted">최대 20장에 도달했어요. 추가하려면 기존 사진을 먼저 삭제해주세요.</p>
        ) : (
          <div className="flex items-center gap-2">
            <label className="flex-1 cursor-pointer text-sm">
              <span className="inline-block px-3 py-2 border border-border bg-bg rounded-sm">
                {galleryFile ? galleryFile.name : "파일 선택"}
              </span>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                hidden
                disabled={busy}
                onChange={(e) => setGalleryFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <button
              type="button"
              disabled={busy || !galleryFile}
              onClick={() => galleryFile && upload(galleryFile, "gallery")}
              className="px-4 py-2 bg-ink text-bg rounded-pill text-sm disabled:opacity-50"
            >
              {busy ? "업로드 중..." : "업로드"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
