import { NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/kakao/geocode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const address = new URL(req.url).searchParams.get("q") ?? "";
  if (!address) return NextResponse.json({ ok: false });
  const point = await geocodeAddress(address);
  return NextResponse.json(point ? { ok: true, ...point } : { ok: false });
}
