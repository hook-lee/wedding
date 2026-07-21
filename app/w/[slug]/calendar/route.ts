import { loadSite } from "../_lib/load-site";
import { buildIcs } from "@/lib/calendar/ics";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const site = await loadSite(slug);
  if (!site.wedding_at) {
    return new Response("결혼식 일시가 설정되지 않았습니다.", { status: 404 });
  }

  const title = `${site.groom_name}${site.name_joiner}${site.bride_name} 결혼식`;
  const location =
    [site.venue_name, site.venue_address].filter(Boolean).join(", ") || "결혼식장";

  const ics = buildIcs({
    title,
    location,
    description: `${title}에 초대합니다`,
    startIso: site.wedding_at,
    uidSeed: site.slug,
  });

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      // "attachment", not "inline" — reverted. text/calendar has no in-page
      // renderer, so "inline" makes several mobile browsers just dump the
      // raw VCALENDAR text on screen instead of downloading anything —
      // worse than the original behavior, not better. "attachment" is what
      // every mainstream "add to calendar" implementation (Eventbrite-style)
      // actually uses: it forces a real file into Downloads/Files, which is
      // what both Safari's QuickLook handoff and Samsung Calendar's Import
      // flow need to have something to grab in the first place.
      "Content-Disposition": `attachment; filename="wedding-${slug}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
