"use client";
import { Icon } from "./Icon";
import { buildGoogleCalendarUrl } from "@/lib/calendar/ics";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

type Props = {
  weddingAt: string;
  title: string;
  location: string;
};

export function Calendar({ weddingAt, title, location }: Props) {
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

  return (
    <div className="bg-surface border border-border rounded-lg p-5 sm:p-6 shadow-card max-w-sm mx-auto">
      <p className="text-center text-sm text-secondary mb-4 tracking-widest">
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
                isWeddingDay ? "bg-ink text-bg font-semibold shadow-card" : ""
              }`}
            >
              {c ?? ""}
            </div>
          );
        })}
      </div>

      {/* Google Calendar only — it's a plain page navigation (not a file
          download), so it works the same reliable way on iOS and Android,
          in real browsers and in-app browsers alike. The .ics-download
          path (native Apple/Samsung calendar apps) was dropped: iOS Safari
          routes a downloaded .ics through preview-only, subscribe, or add
          flows inconsistently depending on iOS version, and there's no
          reliable way to control that from the response — see git history
          on this file for the investigation. Guests who don't use Google
          Calendar simply won't use this button, which beats offering a
          second button that unpredictably breaks. */}
      <a
        href={buildGoogleCalendarUrl({
          title,
          location,
          description: `${title}에 초대합니다`,
          startIso: weddingAt,
        })}
        target="_blank"
        rel="noreferrer"
        className="mt-5 w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-5 bg-ink text-bg rounded-pill text-sm font-medium shadow-card hover:opacity-90 active:opacity-80 transition-opacity"
      >
        <Icon name="calendarPlus" className="w-4 h-4" />
        Google 캘린더에 저장
      </a>
    </div>
  );
}
