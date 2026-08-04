"use client";
import { Icon } from "./Icon";
import { buildGoogleCalendarUrl } from "@/lib/calendar/ics";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

type Props = {
  weddingAt: string;
  slug: string;
  icsContent: string;
  title: string;
  location: string;
  googleEnabled: boolean;
  icsEnabled: boolean;
};

export function Calendar({
  weddingAt,
  slug,
  icsContent,
  title,
  location,
  googleEnabled,
  icsEnabled,
}: Props) {
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

      {(googleEnabled || icsEnabled) && (
        <div className={`mt-5 ${googleEnabled && icsEnabled ? "grid grid-cols-2 gap-2" : ""}`}>
          {googleEnabled && (
            <a
              href={buildGoogleCalendarUrl({
                title,
                location,
                description: `${title}에 초대합니다`,
                startIso: weddingAt,
              })}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 bg-ink text-bg rounded-pill font-medium shadow-card hover:opacity-90 active:opacity-80 transition-opacity ${
                icsEnabled ? "text-xs sm:text-sm" : "w-full text-sm gap-2 px-5"
              }`}
            >
              <Icon name="calendarPlus" className="w-4 h-4 flex-shrink-0" />
              Google 캘린더{icsEnabled ? "" : "에 저장"}
            </a>
          )}
          {icsEnabled && (
            // Not labeled "iOS·삼성" — we don't actually control or
            // guarantee which calendar app opens it, so the button just
            // describes the action ("등록"), not a specific OS/app.
            <button
              type="button"
              onClick={() => {
                // Match the working Korea Expo implementation: never navigate
                // to the remote .ics URL, which iOS treats as a subscription.
                // Create and click the file synchronously in the user gesture.
                const blobUrl = URL.createObjectURL(
                  new Blob([icsContent], { type: "text/calendar;charset=utf-8" }),
                );
                const link = document.createElement("a");
                link.href = blobUrl;
                const safeTitle = title.replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 60);
                link.download = `${safeTitle || `wedding-${slug}`}.ics`;
                document.body.appendChild(link);
                link.click();
                link.remove();
                setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
              }}
              className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 bg-ink text-bg rounded-pill font-medium shadow-card hover:opacity-90 active:opacity-80 transition-opacity ${
                googleEnabled ? "text-xs sm:text-sm" : "w-full text-sm gap-2 px-5"
              }`}
            >
              <Icon name="calendarPlus" className="w-4 h-4 flex-shrink-0" />
              캘린더 등록
            </button>
          )}
        </div>
      )}
    </div>
  );
}
