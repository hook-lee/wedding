/**
 * KST (Asia/Seoul, UTC+9) helpers — manual offset arithmetic.
 *
 * Why we don't use Intl/toLocaleString with `timeZone: "Asia/Seoul"`:
 *   - Browsers + Node SHOULD respect the `timeZone` option, but in practice some
 *     environments (older browsers, slim Node runtimes, certain serverless edges)
 *     silently ignore it and render the underlying UTC clock instead. This caused
 *     the splash to show UTC hours as if they were KST.
 *   - Shifting the Date by +9 hours and reading via getUTC* methods bypasses Intl
 *     entirely, so the result is identical everywhere.
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const WEEKDAYS_KR = ["일", "월", "화", "수", "목", "금", "토"];

function shiftedToKst(utcIso: string): Date {
  return new Date(new Date(utcIso).getTime() + KST_OFFSET_MS);
}

/** "2026-10-10T07:00Z" -> "2026-10-10T16:00" (KST wall clock) for datetime-local input. */
export function utcIsoToKstDateTimeLocal(utcIso: string): string {
  const k = shiftedToKst(utcIso);
  const y = k.getUTCFullYear();
  const m = String(k.getUTCMonth() + 1).padStart(2, "0");
  const d = String(k.getUTCDate()).padStart(2, "0");
  const hh = String(k.getUTCHours()).padStart(2, "0");
  const mm = String(k.getUTCMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

/** "2026-10-10T16:00" (KST wall clock from input) -> UTC ISO for DB. */
export function kstDateTimeLocalToUtcIso(local: string): string {
  // The +09:00 suffix tags this as KST regardless of where the parser runs.
  return new Date(local + "+09:00").toISOString();
}

/** "2026. 10. 10. (토) 오후 04:00" in KST, deterministically. */
export function formatKstDateTime(utcIso: string): string {
  const k = shiftedToKst(utcIso);
  const y = k.getUTCFullYear();
  const m = String(k.getUTCMonth() + 1).padStart(2, "0");
  const d = String(k.getUTCDate()).padStart(2, "0");
  const dow = WEEKDAYS_KR[k.getUTCDay()];
  const hour24 = k.getUTCHours();
  const ampm = hour24 < 12 ? "오전" : "오후";
  let h12 = hour24 % 12;
  if (h12 === 0) h12 = 12;
  const hh = String(h12).padStart(2, "0");
  const mm = String(k.getUTCMinutes()).padStart(2, "0");
  return `${y}. ${m}. ${d}. (${dow}) ${ampm} ${hh}:${mm}`;
}

/** "2026. 10. 10." in KST. */
export function formatKstDate(utcIso: string): string {
  const k = shiftedToKst(utcIso);
  const y = k.getUTCFullYear();
  const m = String(k.getUTCMonth() + 1).padStart(2, "0");
  const d = String(k.getUTCDate()).padStart(2, "0");
  return `${y}. ${m}. ${d}.`;
}
