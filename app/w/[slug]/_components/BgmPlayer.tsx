"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type BaseTrack = {
  order: number;
  title: string;
  artist: string | null;
};
type AudioTrack = BaseTrack & { kind?: "audio"; url: string };
type YoutubeTrack = BaseTrack & { kind: "youtube"; videoId: string };
type Track = AudioTrack | YoutubeTrack;

function isYoutube(t: Track): t is YoutubeTrack {
  return t.kind === "youtube";
}

export function BgmPlayer({ tracks }: { tracks: Track[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playing, setPlaying] = useState(false);
  const [idx, setIdx] = useState(0);
  // Pulse hint: animated until first interaction or after 3 seconds
  const [pulse, setPulse] = useState(true);

  const current: Track | undefined = tracks[idx];

  // Stop pulse after 3s
  useEffect(() => {
    if (!pulse) return;
    const t = setTimeout(() => setPulse(false), 3000);
    return () => clearTimeout(t);
  }, [pulse]);

  const next = useCallback(() => {
    if (tracks.length === 0) return;
    setIdx((i) => (i + 1) % tracks.length);
  }, [tracks.length]);

  // Listen for YouTube iframe API messages (player ended → advance)
  useEffect(() => {
    function handle(e: MessageEvent) {
      if (typeof e.data !== "string") return;
      // Only trust messages from youtube origins
      if (!/youtube\.com$/i.test(new URL(e.origin || "https://x.test").hostname))
        return;
      try {
        const json = JSON.parse(e.data) as {
          event?: string;
          info?: { playerState?: number };
        };
        if (
          json.event === "infoDelivery" &&
          json.info &&
          json.info.playerState === 0
        ) {
          // 0 = ended
          next();
        }
      } catch {
        /* not a JSON message */
      }
    }
    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, [next]);

  // When track index changes, resume playback on the new source if user was playing
  useEffect(() => {
    if (!current) return;
    if (isYoutube(current)) {
      // The iframe src includes autoplay=1 when `playing`; reload happens via key change.
      // Subscribe to events so we receive infoDelivery messages.
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        // Wait briefly for iframe to be ready, then request event listening
        const t = setTimeout(() => {
          iframe.contentWindow?.postMessage(
            JSON.stringify({ event: "listening", id: current.videoId }),
            "*",
          );
        }, 500);
        return () => clearTimeout(t);
      }
    } else if (audioRef.current) {
      audioRef.current.src = current.url;
      if (playing) audioRef.current.play().catch(() => {});
    }
  }, [idx, current, playing]);

  if (tracks.length === 0 || !current) return null;

  function start() {
    setPulse(false);
    if (!current) return;
    if (isYoutube(current)) {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "playVideo", args: "" }),
        "*",
      );
      setPlaying(true);
    } else if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => {
          /* policy blocked */
        });
    }
  }

  function pause() {
    if (current && isYoutube(current)) {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo", args: "" }),
        "*",
      );
    } else {
      audioRef.current?.pause();
    }
    setPlaying(false);
  }

  // YouTube embed src — key on videoId + playing flag so it remounts on track change
  const ytSrc = isYoutube(current)
    ? `https://www.youtube.com/embed/${current.videoId}?enablejsapi=1&autoplay=${
        playing ? 1 : 0
      }&controls=0&playsinline=1&rel=0`
    : null;

  return (
    <div className="flex items-center gap-2">
      {!isYoutube(current) && (
        <audio ref={audioRef} onEnded={next} preload="metadata" />
      )}
      {isYoutube(current) && ytSrc && (
        <iframe
          key={`yt-${current.videoId}`}
          ref={iframeRef}
          src={ytSrc}
          allow="autoplay; encrypted-media"
          width="1"
          height="1"
          style={{
            position: "absolute",
            top: -1000,
            left: -1000,
            border: 0,
          }}
          title="bgm"
        />
      )}
      <button
        type="button"
        onClick={playing ? pause : start}
        className={`text-base ${pulse && !playing ? "animate-pulse" : ""}`}
        aria-label={playing ? "BGM 정지" : "BGM 재생"}
      >
        {playing ? "🔊" : "🔇"}
      </button>
      {tracks.length > 1 && playing && (
        <button
          type="button"
          onClick={next}
          aria-label="다음 곡"
          className="text-sm"
        >
          ⏭
        </button>
      )}
    </div>
  );
}
