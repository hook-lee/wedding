const ID_PATTERN = /[A-Za-z0-9_-]{11}/;

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
      // /embed/<id> or /v/<id>
      const m = u.pathname.match(/^\/(?:embed|v)\/([A-Za-z0-9_-]{11})/);
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
