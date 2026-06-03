/**
 * KST-aware day diff. Both the target and "today" are reduced to their KST date
 * (year/month/day) so that times near the UTC day boundary don't off-by-one.
 */
const KST_TZ = "Asia/Seoul";

function kstDateParts(iso: string): { y: number; m: number; d: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: KST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(new Date(iso));
  const get = (t: string) => parseInt(parts.find((p) => p.type === t)?.value ?? "0", 10);
  return { y: get("year"), m: get("month"), d: get("day") };
}

export function daysUntil(iso: string): number {
  const target = kstDateParts(iso);
  const today = kstDateParts(new Date().toISOString());
  const t0 = Date.UTC(today.y, today.m - 1, today.d);
  const t1 = Date.UTC(target.y, target.m - 1, target.d);
  return Math.round((t1 - t0) / 86_400_000);
}
