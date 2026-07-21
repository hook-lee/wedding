"use client";
import { Icon } from "./Icon";
import { buildGoogleCalendarUrl } from "@/lib/calendar/ics";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

type Props = {
  weddingAt: string;
  slug: string;
  title: string;
  location: string;
};

export function Calendar({ weddingAt, slug, title, location }: Props) {
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

      {/* Two separate buttons instead of one auto-detected link.
          Google Calendar's own link is a plain page navigation (not a
          file), so it survives in-app browsers — but it needs the guest
          already signed into Google in that browser tab, which an in-app
          WebView (KakaoTalk 등) often isn't. The .ics download is the
          fallback: it's NOT Apple-only — Samsung Calendar, Outlook, and
          basically every calendar app can import a standalone .ics file
          (Samsung: 캘린더 앱 메뉴 → 가져오기), it's just that iOS Safari is
          the one platform that turns it into a one-tap "add to calendar"
          instead of a manual import. Letting guests pick both avoids
          fragile user-agent guessing either way. */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <a
          href={buildGoogleCalendarUrl({
            title,
            location,
            description: `${title}에 초대합니다`,
            startIso: weddingAt,
          })}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 bg-ink text-bg rounded-pill text-xs sm:text-sm font-medium shadow-card hover:opacity-90 active:opacity-80 transition-opacity"
        >
          <Icon name="calendarPlus" className="w-4 h-4 flex-shrink-0" />
          Google 캘린더
        </a>
        <a
          href={`/w/${slug}/calendar`}
          className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 bg-ink text-bg rounded-pill text-xs sm:text-sm font-medium shadow-card hover:opacity-90 active:opacity-80 transition-opacity"
        >
          <Icon name="calendarPlus" className="w-4 h-4 flex-shrink-0" />
          iOS·삼성 캘린더
        </a>
      </div>
    </div>
  );
}
