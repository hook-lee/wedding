"use client";
import { Card, CardHeader } from "@/app/_ui/Card";
import { Field } from "@/app/_ui/Field";
import { Input } from "@/app/_ui/Input";

export function FlowerDeclineSection({
  enabled,
  note,
}: {
  enabled: boolean;
  note: string;
}) {
  return (
    <Card>
      <CardHeader title="화환 사양 안내" />

      <label className="flex items-center gap-2 text-sm text-secondary">
        <input
          type="checkbox"
          name="flower_decline"
          defaultChecked={enabled}
          className="w-4 h-4"
        />
        화환 사양 안내를 청첩장에 표시
      </label>

      <Field label="안내 문구" hint="비워두면 '화환은 정중히 사양하겠습니다.' 사용">
        <Input
          name="flower_decline_note"
          defaultValue={note}
          placeholder="화환은 정중히 사양하겠습니다."
        />
      </Field>
    </Card>
  );
}
