"use client";
import { buildIcs, downloadIcs } from "@/lib/calendar/ics";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

type Props = {
  weddingAt: string;
  title: string;
  location: string;
  slug: string;
};

function isMobile() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function pad(n: number, len = 2): string {
  return String(n).padStart(len, "0");
}

/** Google Calendar deep link — opens in browser with pre-filled event. */
function buildGoogleUrl(weddingAt: string, title: string, location: string): string {
  const start = new Date(weddingAt);
  const end = new Date(start.getTime() + 3 * 3600 * 1000);
  const toGoogle = (d: Date) =>
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toGoogle(start)}/${toGoogle(end)}`,
    location,
    details: `${title} 결혼식에 초대합니다`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function Calendar({ weddingAt, title, location, slug }: Props) {
  const kstDate = new Date(new Date(weddingAt).getTime() + KST_OFFSET_MS);
  const year = kstDate.getUTCFullYear();
  const month = kstDate.getUTCMonth();
  const day = kstDate.getUTCDate();

  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  /**
   * Mobile: .ics 다운로드 — iOS는 Calendar 앱 자동 호출, Android는 캘린더 선택 다이얼로그.
   * Desktop: Google Calendar 웹을 새 탭에 열어 추가 페이지 직접 노출.
   */
  function save() {
    if (isMobile()) {
      const ics = buildIcs({
        title,
        location,
        description: title + " 결혼식에 초대합니다",
        startIso: weddingAt,
        uidSeed: slug,
      });
      downloadIcs(ics, `wedding-${slug}.ics`);
    } else {
      window.open(buildGoogleUrl(weddingAt, title, location), "_blank", "noopener");
    }
  }

  return (
    <div className="bg-surface border border-border rounded-md p-4 shadow-card max-w-sm mx-auto">
      <p className="text-center text-sm text-secondary mb-3 tracking-widest">
        {year}년 {month + 1}월
      </p>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={`py-1 text-[11px] font-semibold ${
              i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-muted"
            }`}
          >
            {d}
          </div>
        ))}
        {cells.map((c, i) => {
          const col = i % 7;
          const isWeddingDay = c === day;
          const colorClass = isWeddingDay
            ? ""
            : col === 0
              ? "text-red-500"
              : col === 6
                ? "text-blue-500"
                : "text-ink";
          return (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center text-sm rounded-full ${colorClass} ${
                isWeddingDay
                  ? "bg-ink text-bg font-semibold relative shadow-card"
                  : ""
              }`}
            >
              {c ?? ""}
              {isWeddingDay && (
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-accent"
                >
                  ♥
                </span>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={save}
        className="mt-4 w-full p-2.5 bg-ink text-bg rounded-pill text-sm shadow-card hover:opacity-90 transition-opacity"
      >
        📅 내 캘린더에 추가하기
      </button>
      <p className="text-[10px] text-muted text-center mt-2 leading-relaxed">
        📱 모바일: 기본 캘린더 앱에 자동 추가
        <br />
        💻 PC: Google 캘린더로 이동
      </p>
    </div>
  );
}
