import { NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/kakao/geocode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const address = new URL(req.url).searchParams.get("q") ?? "";
  if (!address) return NextResponse.json({ ok: false, reason: "empty" });

  const { point, debug } = await geocodeAddress(address);
  console.log(`[geocode] query=${address} debug=${debug.join(" | ")}`);

  if (point) {
    return NextResponse.json({
      ok: true,
      lat: point.lat,
      lng: point.lng,
      place_name: point.place_name ?? null,
      address_name: point.address_name ?? null,
    });
  }
  return NextResponse.json({ ok: false, reason: "not-found", debug });
}
