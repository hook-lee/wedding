/**
 * Serve Supabase Storage photos through its on-the-fly resizer instead of
 * shipping the originals.
 *
 * Guests upload straight off a phone camera, so gallery photos routinely run
 * 4–6MB each; one invitation was pulling ~32MB per page load, which stalls on
 * mobile data — exactly the conditions at a wedding hall, where hundreds of
 * people share one cell tower. Resized, the same photo is ~85% smaller.
 *
 * Storage exposes this by swapping /object/public/ for /render/image/public/
 * and taking width/quality params. Anything that isn't a Supabase Storage URL
 * (or is already a render URL) is returned untouched, so callers can pass any
 * src safely.
 */
export function resizedPhoto(
  url: string | null | undefined,
  width: number,
  quality = 72,
): string {
  if (!url) return "";
  if (!url.includes("/storage/v1/object/public/")) return url;
  const base = url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}width=${width}&quality=${quality}`;
}

/** Widths tuned to how each surface actually displays a photo. */
export const PHOTO_WIDTHS = {
  /** 3-across grid tile / small thumbnail */
  thumb: 400,
  /** Single card filling most of the screen */
  card: 800,
  /** Hero image at the top of the invitation */
  hero: 1000,
  /** Full-screen lightbox */
  full: 1600,
} as const;
