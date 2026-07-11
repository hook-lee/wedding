"use client";
import { Card, CardHeader } from "@/app/_ui/Card";
import type { RsvpFields } from "@/lib/extras/types";

export function RsvpFieldsSection({ fields }: { fields: RsvpFields }) {
  return (
    <Card>
      <CardHeader
        title="RSVP 질문 설정"
        hint="이름·연락처·예식장 참석 여부·인원수·메시지는 항상 물어봐요. 아래는 필요한 것만 켜서 추가로 물어볼 수 있어요."
      />

      <label className="flex items-center gap-2 p-3 bg-bg rounded-md cursor-pointer min-h-[44px]">
        <input
          type="checkbox"
          name="rsvp_field_meal"
          defaultChecked={fields.meal ?? false}
          className="w-4 h-4"
        />
        <span className="text-sm text-ink">식사 여부 물어보기</span>
      </label>

      <label className="flex items-center gap-2 p-3 bg-bg rounded-md cursor-pointer min-h-[44px]">
        <input
          type="checkbox"
          name="rsvp_field_side"
          defaultChecked={fields.side ?? false}
          className="w-4 h-4"
        />
        <span className="text-sm text-ink">신랑측·신부측 구분 물어보기</span>
      </label>

      <label className="flex items-center gap-2 p-3 bg-bg rounded-md cursor-pointer min-h-[44px]">
        <input
          type="checkbox"
          name="rsvp_field_parking"
          defaultChecked={fields.parking ?? false}
          className="w-4 h-4"
        />
        <span className="text-sm text-ink">주차 필요 여부 물어보기</span>
      </label>
    </Card>
  );
}
