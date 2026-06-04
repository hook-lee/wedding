export type GeoPoint = {
  lat: number;
  lng: number;
  place_name?: string;
  address_name?: string;
};

export type GeoCandidate = {
  lat: number;
  lng: number;
  place_name: string;
  address_name: string;
};

type AddressDoc = { x: string; y: string; address_name?: string };
type KeywordDoc = {
  x: string;
  y: string;
  place_name?: string;
  address_name?: string;
  road_address_name?: string;
};

async function tryAddress(query: string, key: string) {
  try {
    const r = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${query}`,
      { headers: { Authorization: `KakaoAK ${key}` }, cache: "no-store" },
    );
    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return { docs: [] as AddressDoc[], debug: `address HTTP ${r.status} ${text.slice(0, 120)}` };
    }
    const json = (await r.json()) as { documents?: AddressDoc[] };
    return { docs: json.documents ?? [], debug: "address ok" };
  } catch (e) {
    return { docs: [] as AddressDoc[], debug: `address threw ${(e as Error).message}` };
  }
}

async function tryKeyword(query: string, key: string) {
  try {
    const r = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${query}&size=10`,
      { headers: { Authorization: `KakaoAK ${key}` }, cache: "no-store" },
    );
    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return { docs: [] as KeywordDoc[], debug: `keyword HTTP ${r.status} ${text.slice(0, 120)}` };
    }
    const json = (await r.json()) as { documents?: KeywordDoc[] };
    return { docs: json.documents ?? [], debug: "keyword ok" };
  } catch (e) {
    return { docs: [] as KeywordDoc[], debug: `keyword threw ${(e as Error).message}` };
  }
}

/**
 * Return up to 10 location candidates for the given query.
 * The admin shows them as a picker so the user can choose the exact spot
 * (e.g. 자작마루 vs 미디어관, 100주년기념관 vs 본관).
 */
export async function geocodeAddress(
  address: string,
): Promise<{ candidates: GeoCandidate[]; debug: string[] }> {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) return { candidates: [], debug: ["KAKAO_REST_API_KEY missing"] };
  const query = encodeURIComponent(address);

  const addr = await tryAddress(query, key);
  const kw = await tryKeyword(query, key);

  const candidates: GeoCandidate[] = [];
  for (const d of kw.docs) {
    candidates.push({
      lat: Number(d.y),
      lng: Number(d.x),
      place_name: d.place_name ?? "(이름 없음)",
      address_name: d.road_address_name || d.address_name || "",
    });
  }
  for (const d of addr.docs) {
    // Avoid dupes by coord
    const lat = Number(d.y);
    const lng = Number(d.x);
    if (candidates.some((c) => Math.abs(c.lat - lat) < 1e-5 && Math.abs(c.lng - lng) < 1e-5)) {
      continue;
    }
    candidates.push({
      lat,
      lng,
      place_name: d.address_name ?? address,
      address_name: d.address_name ?? "",
    });
  }

  return { candidates, debug: [addr.debug, kw.debug] };
}
