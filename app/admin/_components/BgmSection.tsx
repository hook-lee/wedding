"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Track = {
  order: number;
  title: string;
  artist: string | null;
  kind?: "audio" | "youtube";
  url?: string;
  videoId?: string;
};

function isYoutube(t: Track) {
  return t.kind === "youtube";
}

function trackKey(t: Track): string {
  return isYoutube(t) ? `yt:${t.videoId ?? ""}` : `audio:${t.url ?? ""}`;
}

export function BgmSection({ tracks }: { tracks: Track[] }) {
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"audio" | "youtube">("audio");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const router = useRouter();

  async function uploadAudio(file: File) {
    if (!title) {
      alert("제목을 입력하세요");
      return;
    }
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title);
    fd.append("artist", artist);
    const res = await fetch("/api/admin/upload-bgm", {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "업로드 실패");
    }
    setTitle("");
    setArtist("");
    setBusy(false);
    router.refresh();
  }

  async function addYoutube() {
    if (!ytUrl.trim()) {
      alert("YouTube 링크를 입력하세요");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/admin/update-bgm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "add-youtube",
        url: ytUrl.trim(),
        title,
        artist,
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "추가 실패");
    } else {
      setYtUrl("");
      setTitle("");
      setArtist("");
    }
    setBusy(false);
    router.refresh();
  }

  async function remove(t: Track) {
    setBusy(true);
    const body = isYoutube(t)
      ? { action: "delete", videoId: t.videoId }
      : { action: "delete", url: t.url };
    await fetch("/api/admin/update-bgm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    router.refresh();
  }

  const canAdd = tracks.length < 5;

  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">
        BGM 플레이리스트 ({tracks.length}/5)
      </h2>
      <ul className="space-y-2">
        {tracks.map((t) => (
          <li
            key={trackKey(t)}
            className="flex items-center gap-3 p-2 bg-bg rounded-sm"
          >
            <span className="w-6 h-6 rounded-pill bg-ink text-bg text-xs flex items-center justify-center">
              {t.order}
            </span>
            <span className="text-base" aria-hidden>
              {isYoutube(t) ? "🎬" : "🎵"}
            </span>
            <span className="flex-1 text-sm">
              {t.title}{" "}
              {t.artist && <span className="text-muted">— {t.artist}</span>}
            </span>
            {isYoutube(t) ? (
              <a
                href={`https://youtu.be/${t.videoId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted underline"
              >
                미리보기
              </a>
            ) : (
              t.url && <audio src={t.url} controls className="h-8" />
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => remove(t)}
              className="text-xs text-red-600"
            >
              삭제
            </button>
          </li>
        ))}
      </ul>

      {canAdd && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("audio")}
              className={`px-3 py-1 rounded-pill text-xs ${
                mode === "audio"
                  ? "bg-ink text-bg"
                  : "bg-bg text-ink border border-border"
              }`}
            >
              MP3 파일
            </button>
            <button
              type="button"
              onClick={() => setMode("youtube")}
              className={`px-3 py-1 rounded-pill text-xs ${
                mode === "youtube"
                  ? "bg-ink text-bg"
                  : "bg-bg text-ink border border-border"
              }`}
            >
              YouTube 링크
            </button>
          </div>

          {mode === "audio" ? (
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
                  onChange={(e) =>
                    e.target.files?.[0] && uploadAudio(e.target.files[0])
                  }
                />
              </label>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full p-2 rounded-sm border border-border bg-surface"
              />
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
                <button
                  type="button"
                  disabled={busy}
                  onClick={addYoutube}
                  className="px-3 py-2 bg-ink text-bg rounded-pill text-sm"
                >
                  추가
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
