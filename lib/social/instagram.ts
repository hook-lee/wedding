/**
 * Couples paste whatever they have on hand: "@name", a full profile URL, or
 * a bare handle. Everything downstream wants the bare handle.
 */
export function normalizeInstagram(input: string): string {
  return input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "")
    .trim();
}

/**
 * Same shape as mapLinks(): an app scheme that opens Instagram directly and a
 * web URL to fall back to when nothing handled it.
 *
 * The fallback earns its keep inside KakaoTalk's in-app browser, which is how
 * most guests will open the invitation. That webview has no Instagram session,
 * so the https URL frequently lands on a login wall instead of the profile —
 * the installed app does have the session.
 */
export function instagramLinks(username: string): { app: string; web: string } {
  const u = normalizeInstagram(username);
  return {
    app: `instagram://user?username=${encodeURIComponent(u)}`,
    web: `https://www.instagram.com/${encodeURIComponent(u)}/`,
  };
}
