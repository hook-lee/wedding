/**
 * KST-aware day diff using manual offset arithmetic (consistent with kst.ts).
 */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function kstDayKey(iso: string): number {
  const k = new Date(new Date(iso).getTime() + KST_OFFSET_MS);
  return Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate());
}

export function daysUntil(iso: string): number {
  const t1 = kstDayKey(iso);
  const t0 = kstDayKey(new Date().toISOString());
  return Math.round((t1 - t0) / 86_400_000);
}
