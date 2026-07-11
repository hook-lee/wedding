"use client";
import { useState } from "react";
import { formatKstDateTime } from "@/lib/date/kst";

type Props = {
  groomName: string;
  brideName: string;
  weddingAt: string | null;
  nameJoiner: string;
  venueName: string;
  mainPhotoUrl: string | null;
};

const STYLES = `
@keyframes wd-photo-in {
  from { opacity: 0; transform: scale(0.94); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes wd-letter-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes wd-line-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes wd-bounce-soft {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
@keyframes wd-pulse-arrow {
  0%, 100% { opacity: 0.4; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(4px); }
}
@keyframes wd-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
`;

export function SplashOverlay(p: Props) {
  const [closing, setClosing] = useState(false);
  const [hidden, setHidden] = useState(false);

  const dateText = p.weddingAt ? formatKstDateTime(p.weddingAt) : "";
  const namesText = `${p.groomName}${p.nameJoiner}${p.brideName}`;

  function enter() {
    // 1) 같은 페이지에서 BGM 시작 (BgmPlayer가 이 이벤트 듣고 play() 호출 — user gesture 그대로 보존)
    try {
      window.dispatchEvent(new CustomEvent("wedding-bgm-start"));
    } catch {
      /* ignore */
    }
    // 2) 오버레이 페이드아웃
    setClosing(true);
    // 3) 애니메이션 후 DOM에서 제거 (스크롤 차단 풀림)
    setTimeout(() => setHidden(true), 700);
  }

  if (hidden) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-bg flex flex-col items-center justify-center p-6 text-center gap-5 overflow-y-auto"
      style={{
        animation: closing ? "wd-fade-out 700ms ease-out forwards" : undefined,
      }}
    >
      <style>{STYLES}</style>

      {/* 상단 라벨 */}
      <p
        className="text-[10px] tracking-[0.6em] text-muted opacity-0"
        style={{ animation: "wd-line-in 700ms ease-out 100ms forwards" }}
      >
        WEDDING INVITATION
      </p>

      {/* 메인 사진 */}
      {p.mainPhotoUrl && (
        <div
          className="w-56 h-72 rounded-sm shadow-card overflow-hidden opacity-0"
          style={{ animation: "wd-photo-in 900ms ease-out 300ms forwards" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.mainPhotoUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* 이름 한 자씩 */}
      <div className="text-2xl font-medium tracking-wide">
        {namesText.split("").map((ch, i) => (
          <span
            key={i}
            className="inline-block opacity-0"
            style={{
              animation: `wd-letter-in 500ms ease-out ${950 + i * 70}ms forwards`,
              whiteSpace: ch === " " ? "pre" : undefined,
            }}
          >
            {ch}
          </span>
        ))}
      </div>

      {/* 날짜 */}
      {dateText && (
        <p
          className="text-sm text-muted tracking-widest opacity-0"
          style={{
            animation: `wd-line-in 700ms ease-out ${1100 + namesText.length * 70}ms forwards`,
          }}
        >
          {dateText}
        </p>
      )}

      {/* 식장 */}
      {p.venueName && (
        <p
          className="text-sm text-secondary opacity-0"
          style={{
            animation: `wd-line-in 700ms ease-out ${1300 + namesText.length * 70}ms forwards`,
          }}
        >
          {p.venueName}
        </p>
      )}

      {/* CTA 버튼 — 입장 + BGM 시작. 통일된 Button 스타일을 직접 적용 (애니메이션 keyframe과
          inline style을 합쳐야 해서 Button 컴포넌트가 아닌 native button 사용). */}
      <button
        type="button"
        onClick={enter}
        className="mt-4 inline-flex items-center justify-center gap-2 min-h-[44px] px-7 bg-ink text-bg rounded-pill text-sm font-medium shadow-card hover:opacity-90 active:opacity-80 transition-opacity opacity-0"
        style={{
          animation: `wd-line-in 700ms ease-out ${1600 + namesText.length * 70}ms forwards, wd-bounce-soft 2.5s ease-in-out ${3000 + namesText.length * 70}ms infinite`,
        }}
      >
        청첩장 열기
      </button>

      {/* 아래쪽 안내 화살표 */}
      <div
        className="mt-2 opacity-0"
        style={{
          animation: `wd-line-in 700ms ease-out ${1900 + namesText.length * 70}ms forwards`,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted"
          style={{ animation: "wd-pulse-arrow 1.6s ease-in-out infinite" }}
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
