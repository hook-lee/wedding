/**
 * Generate .ics (iCalendar) file content for adding the wedding to native calendars.
 * Works on iOS (Calendar.app), Android (Google Calendar), macOS, Windows etc.
 */

function pad(n: number, len = 2): string {
  return String(n).padStart(len, "0");
}

export function toIcsUtc(d: Date): string {
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeIcs(s: string): string {
  return s.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
}

export function buildIcs(params: {
  title: string;
  location: string;
  description: string;
  startIso: string;
  durationHours?: number;
  uidSeed: string;
}): string {
  const { title, location, description, startIso, durationHours = 3, uidSeed } = params;
  const start = new Date(startIso);
  const end = new Date(start.getTime() + durationHours * 3600 * 1000);
  const now = new Date();

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//wedding-zip//KR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:wedding-${uidSeed}@wedding-zip.vercel.app`,
    `DTSTAMP:${toIcsUtc(now)}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcs(title)}`,
    `LOCATION:${escapeIcs(location)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Trigger browser download of an .ics file. */
export function downloadIcs(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Google Calendar's "quick add" URL — a plain link (not a file download), so
 * it survives in-app browsers (KakaoTalk 등) that block or mishandle .ics
 * downloads. This is the reliable path for Android/Google Calendar users;
 * .ics stays the path for Apple Calendar (iOS has no equivalent web intent).
 */
export function buildGoogleCalendarUrl(params: {
  title: string;
  location: string;
  description: string;
  startIso: string;
  durationHours?: number;
}): string {
  const { title, location, description, startIso, durationHours = 3 } = params;
  const start = new Date(startIso);
  const end = new Date(start.getTime() + durationHours * 3600 * 1000);
  const qs = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toIcsUtc(start)}/${toIcsUtc(end)}`,
    details: description,
    location,
  });
  return `https://calendar.google.com/calendar/render?${qs.toString()}`;
}
