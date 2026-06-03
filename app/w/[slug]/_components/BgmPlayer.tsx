"use client";
import { useEffect, useRef, useState } from "react";

type Track = {
  order: number;
  url: string;
  title: string;
  artist: string | null;
};

export function BgmPlayer({ tracks }: { tracks: Track[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [idx, setIdx] = useState(0);
  // Pulse hint: animated until first interaction or after 3 seconds
  const [pulse, setPulse] = useState(true);

  // Stop pulse after 3s
  useEffect(() => {
    if (!pulse) return;
    const t = setTimeout(() => setPulse(false), 3000);
    return () => clearTimeout(t);
  }, [pulse]);

  // Load track when idx changes; resume playback if user was already playing
  useEffect(() => {
    if (!audioRef.current || tracks.length === 0) return;
    audioRef.current.src = tracks[idx]?.url ?? "";
    if (playing) audioRef.current.play().catch(() => {});
  }, [idx, tracks, playing]);

  if (tracks.length === 0) return null;

  function start() {
    if (!audioRef.current) return;
    audioRef.current
      .play()
      .then(() => {
        setPlaying(true);
        setPulse(false);
      })
      .catch(() => {
        /* policy blocked */
      });
  }
  function pause() {
    audioRef.current?.pause();
    setPlaying(false);
  }
  function next() {
    setIdx((i) => (i + 1) % tracks.length);
  }

  return (
    <div className="flex items-center gap-2">
      <audio ref={audioRef} onEnded={next} preload="metadata" />
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
