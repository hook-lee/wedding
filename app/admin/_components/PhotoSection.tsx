"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { mainUrl: string | null; galleryUrls: string[] };

export function PhotoSection({ mainUrl, galleryUrls }: Props) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function upload(file: File, kind: "main" | "gallery") {
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    await fetch("/api/admin/upload-photo", { method: "POST", body: fd });
    setBusy(false);
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
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">사진</h2>

      <div>
        <p className="text-sm text-secondary mb-2">메인 사진 (1장)</p>
        {mainUrl && (
          <div className="relative w-40 h-48 mb-2">
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
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "main")}
        />
      </div>

      <div>
        <p className="text-sm text-secondary mb-2">갤러리 ({galleryUrls.length}장)</p>
        <div className="grid grid-cols-4 gap-2 mb-2">
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
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "gallery")}
        />
      </div>
    </section>
  );
}
