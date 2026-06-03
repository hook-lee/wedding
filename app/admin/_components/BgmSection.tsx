"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Track = { order: number; url: string; title: string; artist: string | null };

export function BgmSection({ tracks }: { tracks: Track[] }) {
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const router = useRouter();

  async function upload(file: File) {
    if (!title) {
      alert("제목을 입력하세요");
      return;
    }
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title);
    fd.append("artist", artist);
    await fetch("/api/admin/upload-bgm", { method: "POST", body: fd });
    setTitle("");
    setArtist("");
    setBusy(false);
    router.refresh();
  }

  async function remove(url: string) {
    setBusy(true);
    await fetch("/api/admin/update-bgm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "delete", url }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">BGM 플레이리스트 ({tracks.length}/5)</h2>
      <ul className="space-y-2">
        {tracks.map((t) => (
          <li key={t.url} className="flex items-center gap-3 p-2 bg-bg rounded-sm">
            <span className="w-6 h-6 rounded-pill bg-ink text-bg text-xs flex items-center justify-center">
              {t.order}
            </span>
            <span className="flex-1 text-sm">
              {t.title} {t.artist && <span className="text-muted">— {t.artist}</span>}
            </span>
            <audio src={t.url} controls className="h-8" />
            <button
              type="button"
              disabled={busy}
              onClick={() => remove(t.url)}
              className="text-xs text-red-600"
            >
              삭제
            </button>
          </li>
        ))}
      </ul>

      {tracks.length < 5 && (
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="곡 제목"
            className="p-2 rounded-sm border border-border bg-surface"
          />
          <input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="아티스트 (선택)"
            className="p-2 rounded-sm border border-border bg-surface"
          />
          <label className="px-3 py-2 bg-ink text-bg rounded-pill text-sm cursor-pointer">
            업로드
            <input
              type="file"
              accept="audio/*"
              hidden
              disabled={busy}
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            />
          </label>
        </div>
      )}
    </section>
  );
}
