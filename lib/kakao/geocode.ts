export type GeoPoint = { lat: number; lng: number };

type KakaoSearchResult = { documents?: Array<{ x: string; y: string }> };

async function tryEndpoint(
  url: string,
  key: string,
  label: string,
): Promise<{ point: GeoPoint | null; debug: string }> {
  try {
    const r = await fetch(url, {
      headers: { Authorization: `KakaoAK ${key}` },
      cache: "no-store",
    });
    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return { point: null, debug: `${label} HTTP ${r.status} ${text.slice(0, 120)}` };
    }
    const json = (await r.json()) as KakaoSearchResult;
    const doc = json.documents?.[0];
    if (!doc) return { point: null, debug: `${label} no-results` };
    return { point: { lat: Number(doc.y), lng: Number(doc.x) }, debug: `${label} ok` };
  } catch (e) {
    return { point: null, debug: `${label} threw ${(e as Error).message}` };
  }
}

/**
 * Resolve an input string to lat/lng.
 *  1) Strict address search (도로명·지번)
 *  2) Keyword search (POI / 건물·식장 이름)
 */
export async function geocodeAddress(
  address: string,
): Promise<{ point: GeoPoint | null; debug: string[] }> {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) return { point: null, debug: ["KAKAO_REST_API_KEY missing"] };
  const query = encodeURIComponent(address);

  const a = await tryEndpoint(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${query}`,
    key,
    "address",
  );
  if (a.point) return { point: a.point, debug: [a.debug] };

  const k = await tryEndpoint(
    `https://dapi.kakao.com/v2/local/search/keyword.json?query=${query}`,
    key,
    "keyword",
  );
  if (k.point) return { point: k.point, debug: [a.debug, k.debug] };

  return { point: null, debug: [a.debug, k.debug] };
}
