"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/app/_ui/Card";
import { Input } from "@/app/_ui/Input";
import { Button } from "@/app/_ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

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
    try {
      // 1) 서버에서 이 파일 크기/형식으로 서명된 업로드 URL 발급
      const urlRes = await fetch("/api/admin/bgm-upload-url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mimeType: file.type,
          size: file.size,
          fileName: file.name,
        }),
      });
      if (!urlRes.ok) {
        const j = await urlRes.json().catch(() => ({}));
        alert(j.error ?? `업로드 준비 실패 (${urlRes.status})`);
        return;
      }
      const { path, token, contentType } = (await urlRes.json()) as {
        path: string;
        token: string;
        contentType: string;
      };

      // 2) 브라우저에서 Supabase Storage로 직접 업로드 — Vercel의 4.5MB 요청
      //    본문 제한을 완전히 우회한다 (일반 노래 파일은 대부분 이보다 큼).
      //    file.type이 비어있거나 이상한 값이어도 서버가 확장자로 판별해준
      //    contentType을 쓴다 (일부 다운로드 출처의 파일은 브라우저가
      //    MIME을 못 읽어오는 경우가 있음).
      const supabase = createSupabaseBrowserClient();
      const { error: upErr } = await supabase.storage
        .from("wedding-bgm")
        .uploadToSignedUrl(path, token, file, { contentType });
      if (upErr) {
        alert(`업로드 실패: ${upErr.message}`);
        return;
      }

      // 3) 서버에 최종 반영 (bgm_tracks에 추가)
      const finalizeRes = await fetch("/api/admin/update-bgm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "add-audio", path, title, artist }),
      });
      if (!finalizeRes.ok) {
        const j = await finalizeRes.json().catch(() => ({}));
        alert(j.error ?? "저장 실패");
        return;
      }
      setTitle("");
      setArtist("");
    } finally {
      setBusy(false);
      router.refresh();
    }
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
    <Card>
      <CardHeader title={`BGM 플레이리스트 (${tracks.length}/5)`} />
      <ul className="space-y-2">
        {tracks.map((t) => (
          <li
            key={trackKey(t)}
            className="flex items-center gap-3 p-2 bg-bg rounded-md"
          >
            <span className="w-6 h-6 rounded-pill bg-ink text-bg text-xs flex items-center justify-center flex-shrink-0">
              {t.order}
            </span>
            <span className="text-base" aria-hidden>
              {isYoutube(t) ? "🎬" : "🎵"}
            </span>
            <span className="flex-1 min-w-0 text-sm truncate">
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
              t.url && <audio src={t.url} controls className="h-8 max-w-[180px]" />
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => remove(t)}
              className="text-xs text-red-600 px-2 min-h-[44px] disabled:opacity-50"
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
              className={`px-4 py-1.5 rounded-pill text-xs transition-colors ${
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
              className={`px-4 py-1.5 rounded-pill text-xs transition-colors ${
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
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="곡 제목"
                aria-label="곡 제목"
              />
              <Input
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="아티스트 (선택)"
                aria-label="아티스트"
              />
              <label className="inline-flex items-center justify-center min-h-[44px] px-5 bg-ink text-bg rounded-pill text-sm font-medium cursor-pointer shadow-card">
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
              <Input
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                aria-label="YouTube 링크"
              />
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="곡 제목"
                  aria-label="곡 제목"
                />
                <Input
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="아티스트 (선택)"
                  aria-label="아티스트"
                />
                <Button
                  type="button"
                  disabled={busy}
                  onClick={addYoutube}
                  variant="primary"
                >
                  추가
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
