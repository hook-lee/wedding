export type GeoPoint = {
  lat: number;
  lng: number;
  place_name?: string;
  address_name?: string;
};

type AddressDoc = { x: string; y: string; address_name?: string };
type KeywordDoc = { x: string; y: string; place_name?: string; address_name?: string; road_address_name?: string };

async function tryEndpoint<T extends { x: string; y: string }>(
  url: string,
  key: string,
  label: string,
): Promise<{ doc: T | null; debug: string }> {
  try {
    const r = await fetch(url, {
      headers: { Authorization: `KakaoAK ${key}` },
      cache: "no-store",
    });
    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return { doc: null, debug: `${label} HTTP ${r.status} ${text.slice(0, 120)}` };
    }
    const json = (await r.json()) as { documents?: T[] };
    const doc = json.documents?.[0];
    if (!doc) return { doc: null, debug: `${label} no-results` };
    return { doc, debug: `${label} ok` };
  } catch (e) {
    return { doc: null, debug: `${label} threw ${(e as Error).message}` };
  }
}

/**
 * Resolve an input string to lat/lng.
 *  1) Strict address search (도로명·지번)
 *  2) Keyword search (POI / 건물·식장 이름) — also captures the matched place name
 *     so the admin can verify it found the right thing.
 */
export async function geocodeAddress(
  address: string,
): Promise<{ point: GeoPoint | null; debug: string[] }> {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) return { point: null, debug: ["KAKAO_REST_API_KEY missing"] };
  const query = encodeURIComponent(address);

  // 1) Address search
  const a = await tryEndpoint<AddressDoc>(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${query}`,
    key,
    "address",
  );
  if (a.doc) {
    return {
      point: {
        lat: Number(a.doc.y),
        lng: Number(a.doc.x),
        address_name: a.doc.address_name,
      },
      debug: [a.debug],
    };
  }

  // 2) Keyword (POI) search
  const k = await tryEndpoint<KeywordDoc>(
    `https://dapi.kakao.com/v2/local/search/keyword.json?query=${query}`,
    key,
    "keyword",
  );
  if (k.doc) {
    return {
      point: {
        lat: Number(k.doc.y),
        lng: Number(k.doc.x),
        place_name: k.doc.place_name,
        address_name: k.doc.road_address_name || k.doc.address_name,
      },
      debug: [a.debug, k.debug],
    };
  }

  return { point: null, debug: [a.debug, k.debug] };
}
