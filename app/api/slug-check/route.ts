import { NextResponse } from "next/server";
import { validateSlug } from "@/lib/slug/validate";
import { isSlugAvailable } from "@/lib/db/wedding-site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  const v = validateSlug(slug);
  if (!v.ok) return NextResponse.json({ available: false, reason: v.reason });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ available: false, reason: "로그인 필요" }, { status: 401 });
  }

  const available = await isSlugAvailable(slug, user.id);
  return NextResponse.json({
    available,
    reason: available ? null : "이미 사용 중인 슬러그입니다.",
  });
}
