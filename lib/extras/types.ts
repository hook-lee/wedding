/**
 * Site extras — opt-in content blocks (transit, parking notes, info items,
 * flower-decline notice) stored as a single jsonb column. Centralizing the
 * shape here lets server actions, admin UI, and the public site agree.
 */

export type InfoItem = { title: string; body: string };

export type SiteExtras = {
  transit_subway?: string;
  transit_bus?: string;
  parking_notes?: string;
  info_items?: InfoItem[];
  flower_decline?: boolean;
  flower_decline_note?: string;
};

const DEFAULT_DECLINE_NOTE = "화환은 정중히 사양하겠습니다.";

export function readExtras(raw: unknown): SiteExtras {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const obj = raw as Record<string, unknown>;
  const items = Array.isArray(obj.info_items)
    ? (obj.info_items as unknown[])
        .map((it) => {
          if (!it || typeof it !== "object") return null;
          const r = it as Record<string, unknown>;
          const title = typeof r.title === "string" ? r.title.trim() : "";
          const body = typeof r.body === "string" ? r.body.trim() : "";
          if (!title && !body) return null;
          return { title, body } as InfoItem;
        })
        .filter((x): x is InfoItem => x !== null)
    : undefined;

  return {
    transit_subway:
      typeof obj.transit_subway === "string" ? obj.transit_subway : undefined,
    transit_bus:
      typeof obj.transit_bus === "string" ? obj.transit_bus : undefined,
    parking_notes:
      typeof obj.parking_notes === "string" ? obj.parking_notes : undefined,
    info_items: items,
    flower_decline:
      typeof obj.flower_decline === "boolean" ? obj.flower_decline : undefined,
    flower_decline_note:
      typeof obj.flower_decline_note === "string"
        ? obj.flower_decline_note
        : undefined,
  };
}

export function flowerDeclineNoteOrDefault(extras: SiteExtras): string {
  const v = (extras.flower_decline_note ?? "").trim();
  return v || DEFAULT_DECLINE_NOTE;
}
