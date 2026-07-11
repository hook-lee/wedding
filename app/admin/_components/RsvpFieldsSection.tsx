"use client";
import { Card, CardHeader } from "@/app/_ui/Card";
import type { RsvpFields } from "@/lib/extras/types";

const ITEMS: { key: keyof RsvpFields; name: string; label: string }[] = [
  { key: "attending", name: "rsvp_field_attending", label: "참석 여부" },
  { key: "party_size", name: "rsvp_field_party_size", label: "인원수" },
  { key: "phone", name: "rsvp_field_phone", label: "연락처" },
  { key: "message", name: "rsvp_field_message", label: "메시지" },
  { key: "side", name: "rsvp_field_side", label: "신랑측·신부측 구분" },
  { key: "meal", name: "rsvp_field_meal", label: "식사 여부" },
  { key: "parking", name: "rsvp_field_parking", label: "주차 필요 여부" },
];

export function RsvpFieldsSection({ fields }: { fields: Required<RsvpFields> }) {
  return (
    <Card>
      <CardHeader
        title="RSVP 질문 설정"
        hint="필요한 질문만 켜두세요. 이름은 응답자를 구분하는 데 꼭 필요해서 항상 물어봐요."
      />

      <div className="grid grid-cols-2 gap-2">
        {ITEMS.map((item) => (
          <label
            key={item.key}
            className="flex items-center gap-2 p-3 bg-bg rounded-md cursor-pointer min-h-[44px]"
          >
            <input
              type="checkbox"
              name={item.name}
              defaultChecked={fields[item.key]}
              className="w-4 h-4"
            />
            <span className="text-sm text-ink">{item.label}</span>
          </label>
        ))}
      </div>
    </Card>
  );
}
