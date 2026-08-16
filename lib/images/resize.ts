/**
 * Serve Supabase Storage photos through its on-the-fly resizer instead of
 * shipping the originals.
 *
 * Guests upload straight off a phone camera, so photos routinely arrive at
 * 4000x6000 — about 16x more pixels than a phone screen can show. One
 * invitation was pulling ~24MB per page load, which stalls on mobile data,
 * exactly the condition at a wedding hall where hundreds of guests share one
 * cell tower.
 */

/**
 * Rewrite a Storage URL to its render endpoint.
 *
 * `resize=contain` is NOT optional. Passing width alone leaves the original
 * height untouched — a 3547x5321 photo came back 1000x5321, squashed to a
 * sliver and then stretched to fill its container. That shipped to real
 * guests once; don't remove it. `contain` fits the image inside the box
 * keeping its aspect ratio, and never enlarges something already smaller.
 *
 * Anything that isn't a Supabase Storage URL is returned untouched, so
 * callers can pass any src safely.
 */
export function resizedPhoto(
  url: string | null | undefined,
  width: number,
  quality = 80,
): string {
  if (!url) return "";
  if (!url.includes("/storage/v1/object/public/")) return url;
  const base = url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}width=${width}&quality=${quality}&resize=contain`;
}

/**
 * Widths are deliberately generous. Phone screens pack 2–3 physical pixels
 * into each CSS pixel, so a 124px-wide grid tile still wants ~400px of image —
 * and an earlier pass that sized to exactly that looked visibly soft. 1080
 * is the floor here (the width Instagram serves), with more for anything
 * shown large. Height always follows from the source aspect ratio.
 */
export const PHOTO_WIDTHS = {
  /** Grid tiles and small thumbnails */
  thumb: 1200,
  /** Cards filling most of the screen */
  card: 1200,
  /** Hero image at the top of the invitation / splash */
  hero: 1440,
  /** Full-screen lightbox */
  full: 2048,
} as const;
