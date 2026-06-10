"use client";
import { buildIcs, downloadIcs } from "@/lib/calendar/ics";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

type Props = {
  weddingAt: string;
  title: string; // 예: "창환 ♡ 지영 결혼식"
  location: string;
  slug: string;
};

export function Calendar({ weddingAt, title, location, slug }: Props) {
  // Compute KST date parts using manual offset (same convention as lib/date/kst.ts).
  const kstDate = new Date(new Date(weddingAt).getTime() + KST_OFFSET_MS);
  const year = kstDate.getUTCFullYear();
  const month = kstDate.getUTCMonth(); // 0-indexed
  const day = kstDate.getUTCDate();

  // Build calendar grid for that month.
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  // Pad to multiple of 7 so the trailing row is balanced
  while (cells.length % 7 !== 0) cells.push(null);

  function save() {
    const ics = buildIcs({
      title,
      location,
      description: title + " 결혼식에 초대합니다",
      startIso: weddingAt,
      uidSeed: slug,
    });
    downloadIcs(ics, `wedding-${slug}.ics`);
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
        📅 캘린더에 저장하기
      </button>
    </div>
  );
}
