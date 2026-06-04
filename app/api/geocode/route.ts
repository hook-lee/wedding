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

  const { candidates, debug } = await geocodeAddress(address);
  console.log(`[geocode] query=${address} candidates=${candidates.length} debug=${debug.join(" | ")}`);

  if (candidates.length > 0) {
    return NextResponse.json({
      ok: true,
      candidates,
    });
  }
  return NextResponse.json({ ok: false, reason: "not-found", debug });
}
