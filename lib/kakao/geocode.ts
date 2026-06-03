export type GeoPoint = { lat: number; lng: number };

export async function geocodeAddress(address: string): Promise<GeoPoint | null> {
  if (!process.env.KAKAO_REST_API_KEY) return null;
  const r = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
    {
      headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` },
      cache: "no-store",
    }
  );
  if (!r.ok) return null;
  const json = (await r.json()) as { documents?: Array<{ x: string; y: string }> };
  const doc = json.documents?.[0];
  if (!doc) return null;
  return { lat: Number(doc.y), lng: Number(doc.x) };
}
