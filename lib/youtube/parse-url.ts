const ID_PATTERN = /[A-Za-z0-9_-]{11}/;

/**
 * Was a YouTube field filled in with something we cannot turn into an id?
 *
 * Callers used to store the failed parse as "", which overwrote the couple's
 * input and gave them no idea why their link kept disappearing. Saving should
 * stop and say so instead.
 */
export function isUnreadableYouTubeInput(input: string): boolean {
  return input.trim() !== "" && extractYouTubeVideoId(input) === null;
}

export function extractYouTubeVideoId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;

  // bare ID
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;

  try {
    const u = new URL(s);
    // youtu.be/<id>
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }
    // youtube.com/watch?v=<id>
    if (u.hostname.endsWith("youtube.com")) {
      if (u.pathname === "/watch") {
        const v = u.searchParams.get("v");
        return v && /^[A-Za-z0-9_-]{11}$/.test(v) ? v : null;
      }
      // /embed/<id>, /v/<id>, /shorts/<id>, /live/<id>. Shorts is what the
      // mobile app's share sheet hands you, so leaving it out rejected the
      // most common paste of all — and silently, which was the real damage.
      const m = u.pathname.match(/^\/(?:embed|v|shorts|live)\/([A-Za-z0-9_-]{11})/);
      if (m) return m[1];
      // No match within youtube.com — do not fall back to loose token match
      return null;
    }
    // Different host (e.g. example.com) — not a YouTube URL
    return null;
  } catch {
    // Not a URL — fall through
  }

  // Last resort: find an 11-char token in the string
  const m = s.match(ID_PATTERN);
  return m ? m[0] : null;
}
