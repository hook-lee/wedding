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

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// Local KST wall-clock time, no "Z" — paired with TZID=Asia/Seoul on the
// property itself (DTSTART;TZID=Asia/Seoul:...). A working reference
// implementation (a live "add to calendar" widget, confirmed by direct
// device testing to produce a real EventKit "Add Event" sheet on iOS
// rather than the plain-UTC version's dead-end preview) uses this form —
// not bare UTC — so we match it instead of guessing further.
function toIcsLocalKst(d: Date): string {
  const kst = new Date(d.getTime() + KST_OFFSET_MS);
  return (
    kst.getUTCFullYear() +
    pad(kst.getUTCMonth() + 1) +
    pad(kst.getUTCDate()) +
    "T" +
    pad(kst.getUTCHours()) +
    pad(kst.getUTCMinutes()) +
    pad(kst.getUTCSeconds())
  );
}

// Standard Asia/Seoul VTIMEZONE block. Korea has had a fixed UTC+9 offset
// (no DST) since the 1988 Seoul Olympics DST trial ended — the historical
// DTSTART below marks that transition, which is the conventional way
// iCalendar VTIMEZONE blocks represent a timezone with no current DST.
const VTIMEZONE_SEOUL = [
  "BEGIN:VTIMEZONE",
  "TZID:Asia/Seoul",
  "BEGIN:STANDARD",
  "DTSTART:19881009T030000",
  "TZOFFSETFROM:+1000",
  "TZOFFSETTO:+0900",
  "TZNAME:KST",
  "END:STANDARD",
  "END:VTIMEZONE",
];

function escapeIcs(s: string): string {
  return s.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
}

// RFC 5545 §3.1: content lines SHOULD NOT exceed 75 octets (not characters —
// bytes, and a fold must never split a multi-byte UTF-8 sequence). Korean
// venue names/addresses blow past 75 octets almost immediately, and an
// unfolded line risks a strict .ics parser (which is what decides whether
// iOS shows the native "Add to Calendar" sheet vs. a dumb file preview)
// choking on the file instead of just being lenient about it.
const FOLD_LIMIT = 75;

function foldLine(line: string): string {
  const bytes = Buffer.from(line, "utf-8");
  if (bytes.length <= FOLD_LIMIT) return line;
  const chunks: string[] = [];
  let offset = 0;
  let first = true;
  while (offset < bytes.length) {
    const limit = first ? FOLD_LIMIT : FOLD_LIMIT - 1; // -1 for the continuation's leading space
    let end = Math.min(offset + limit, bytes.length);
    while (end > offset && (bytes[end] & 0xc0) === 0x80) end--; // don't split a UTF-8 char
    chunks.push(bytes.subarray(offset, end).toString("utf-8"));
    offset = end;
    first = false;
  }
  return chunks.join("\r\n ");
}

export function buildIcs(params: {
  title: string;
  location: string;
  description: string;
  startIso: string;
  durationHours?: number;
  uidSeed: string;
}): string {
  const { title, location, description, startIso, durationHours = 2, uidSeed } = params;
  const start = new Date(startIso);
  const end = new Date(start.getTime() + durationHours * 3600 * 1000);
  const now = new Date();

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//wedding-zip//KR",
    "CALSCALE:GREGORIAN",
    // Some calendar parsers (iOS included) treat METHOD as the signal that
    // this file is a publishable/importable event rather than passive data.
    "METHOD:PUBLISH",
    ...VTIMEZONE_SEOUL,
    "BEGIN:VEVENT",
    `UID:wedding-${uidSeed}@wedding-zip.vercel.app`,
    `DTSTAMP:${toIcsUtc(now)}`,
    `DTSTART;TZID=Asia/Seoul:${toIcsLocalKst(start)}`,
    `DTEND;TZID=Asia/Seoul:${toIcsLocalKst(end)}`,
    `SUMMARY:${escapeIcs(title)}`,
    `LOCATION:${escapeIcs(location)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcs(title)} 하루 전입니다!`,
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT6H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcs(title)} 6시간 전입니다!`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(foldLine)
    .join("\r\n");
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
  const { title, location, description, startIso, durationHours = 2 } = params;
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
