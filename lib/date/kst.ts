/**
 * KST (Asia/Seoul, UTC+9) timezone helpers.
 *
 * Storage convention:
 *  - `wedding_sites.wedding_at` is `timestamptz` storing UTC.
 *  - The user enters the wedding time in KST (their local time).
 *  - Display ALWAYS converts back to KST so guests in any timezone see the same wall-clock time.
 *
 * Why we don't just rely on `new Date(localString)`:
 *  - HTML `<input type="datetime-local">` produces a naive string like `2026-10-10T16:00`.
 *  - `new Date("2026-10-10T16:00")` interprets it as the SERVER's local time.
 *  - On Vercel the server is UTC → KST 16:00 gets misread as UTC 16:00 → display shifts by +9 hours.
 *  - The fix is to explicitly tag the input as KST (`+09:00`) when parsing.
 */

const KST_TZ = "Asia/Seoul";

/**
 * Convert a UTC ISO string (from DB) to `YYYY-MM-DDTHH:mm` for use as a
 * `<input type="datetime-local">` default value, expressed in KST.
 */
export function utcIsoToKstDateTimeLocal(utcIso: string): string {
  const date = new Date(utcIso);
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: KST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  // hour12:false may return "24" for midnight on some engines; normalize.
  const hour = get("hour") === "24" ? "00" : get("hour");
  return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}`;
}

/**
 * Convert a datetime-local input (`YYYY-MM-DDTHH:mm`) to UTC ISO,
 * treating the input value as KST.
 */
export function kstDateTimeLocalToUtcIso(local: string): string {
  // Appending +09:00 tags this as KST regardless of where the code runs.
  return new Date(local + "+09:00").toISOString();
}

/**
 * Format a UTC ISO string as a human-readable KST datetime,
 * e.g. "2026. 10. 10. (토) 오후 04:00".
 */
export function formatKstDateTime(utcIso: string): string {
  return new Date(utcIso).toLocaleString("ko-KR", {
    timeZone: KST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a UTC ISO string as a KST date only (no time),
 * e.g. "2026. 10. 10.".
 */
export function formatKstDate(utcIso: string): string {
  return new Date(utcIso).toLocaleDateString("ko-KR", {
    timeZone: KST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
