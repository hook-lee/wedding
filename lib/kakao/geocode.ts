export type GeoPoint = { lat: number; lng: number };

type KakaoSearchResult = { documents?: Array<{ x: string; y: string }> };

async function tryEndpoint(url: string, key: string): Promise<GeoPoint | null> {
  try {
    const r = await fetch(url, {
      headers: { Authorization: `KakaoAK ${key}` },
      cache: "no-store",
    });
    if (!r.ok) return null;
    const json = (await r.json()) as KakaoSearchResult;
    const doc = json.documents?.[0];
    if (!doc) return null;
    return { lat: Number(doc.y), lng: Number(doc.x) };
  } catch {
    return null;
  }
}

/**
 * Resolve an input string to lat/lng.
 *  1) Strict address search (도로명·지번) — works for "서울시 강남구 테헤란로 152"
 *  2) Keyword search (POI / 건물·식장 이름) — works for "강남파이낸스센터" or "OO웨딩홀"
 * Returns the first match from whichever endpoint hits.
 */
export async function geocodeAddress(address: string): Promise<GeoPoint | null> {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) return null;
  const query = encodeURIComponent(address);

  const addressHit = await tryEndpoint(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${query}`,
    key,
  );
  if (addressHit) return addressHit;

  const keywordHit = await tryEndpoint(
    `https://dapi.kakao.com/v2/local/search/keyword.json?query=${query}`,
    key,
  );
  return keywordHit;
}
