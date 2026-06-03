export type SlugCheck = { ok: true } | { ok: false; reason: string };

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

export function validateSlug(slug: string): SlugCheck {
  if (!slug) return { ok: false, reason: "슬러그가 비어 있습니다." };
  if (slug.length < 3) return { ok: false, reason: "3자 이상이어야 합니다." };
  if (slug.length > 50) return { ok: false, reason: "50자 이하이어야 합니다." };
  if (!SLUG_RE.test(slug)) return { ok: false, reason: "소문자·숫자·중간 하이픈만 가능합니다." };
  return { ok: true };
}
