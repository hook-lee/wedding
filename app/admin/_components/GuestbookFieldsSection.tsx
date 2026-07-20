"use client";
import { Card, CardHeader } from "@/app/_ui/Card";
import type { GuestbookFields } from "@/lib/extras/types";

const ITEMS: { key: keyof GuestbookFields; name: string; label: string }[] = [
  { key: "phone", name: "guestbook_field_phone", label: "연락처" },
  { key: "guest_side", name: "guestbook_field_guest_side", label: "신랑측·신부측 구분" },
  { key: "relationship", name: "guestbook_field_relationship", label: "관계 (예: 친구, 직장동료)" },
];

export function GuestbookFieldsSection({ fields }: { fields: Required<GuestbookFields> }) {
  return (
    <Card>
      <CardHeader
        title="방명록 질문 설정"
        hint="이름과 축하 메시지는 방명록의 기본이라 항상 물어봐요. 필요한 질문만 추가로 켜두세요."
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
