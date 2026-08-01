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
      "Content-Type": "text/calendar; charset=utf-8; method=PUBLISH",
      // The URL path itself must end in ".ics" — iOS Safari's recognition
      // of a served file as a calendar event (triggering the native
      // "Add to Calendar" EventKit sheet instead of a generic/QuickLook
      // file preview) depends partly on the file extension, not just the
      // Content-Type header. The old route was at /calendar with no
      // extension at all, which is the likely reason the previous version
      // showed a dead-end preview with only a "완료(Done)" button and no
      // actual add action.
      // A real calendar attachment (reached through a direct HTTPS link) is
      // what Safari hands to its Event Details preview. That preview exposes
      // the native "Add to Calendar" action shown at the bottom of the sheet.
      "Content-Disposition": `attachment; filename="wedding-${slug}.ics"`,
      "X-Content-Type-Options": "nosniff",
      // Explicit Content-Length instead of leaving it to chunked transfer
      // encoding — Safari's calendar-file recognition/preview generation
      // reads more reliably off a response with a known-upfront byte
      // length than one streamed without one.
      "Content-Length": String(Buffer.byteLength(ics, "utf-8")),
      "Cache-Control": "no-store",
    },
  });
}
