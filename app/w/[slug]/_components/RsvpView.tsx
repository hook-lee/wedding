"use client";
import { useState } from "react";
import { postRsvp } from "../_actions/rsvp";
import { Card } from "@/app/_ui/Card";
import { Field } from "@/app/_ui/Field";
import { Input } from "@/app/_ui/Input";
import { Textarea } from "@/app/_ui/Textarea";
import { Button } from "@/app/_ui/Button";
import type { RsvpFields } from "@/lib/extras/types";

export function RsvpView({
  siteId,
  fields = {},
}: {
  siteId: string;
  fields?: RsvpFields;
}) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handle(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await postRsvp(siteId, formData);
    setPending(false);
    if (result.error) setError(result.error);
    else setDone(true);
  }

  if (done)
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-lg text-ink">참석 알려주셔서 감사합니다 💛</p>
        <p className="text-sm text-secondary">결혼식에서 만나요</p>
      </div>
    );

  return (
    <form action={handle}>
      <Card className="space-y-3">
        <p className="text-sm text-secondary">참석 여부를 알려주세요</p>

        <Field label="이름">
          <Input
            name="name"
            required
            maxLength={30}
            placeholder="이름"
          />
        </Field>

        <Field label="연락처 (선택)">
          <Input
            name="phone"
            placeholder="010-0000-0000"
          />
        </Field>

        <fieldset>
          <legend className="text-sm text-secondary font-medium mb-1">
            참석 여부
          </legend>
          <div className="flex gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 min-h-[44px] px-3 bg-bg border border-border rounded-md cursor-pointer text-ink">
              <input type="radio" name="attending" value="yes" required /> 참석
            </label>
            <label className="flex-1 flex items-center justify-center gap-2 min-h-[44px] px-3 bg-bg border border-border rounded-md cursor-pointer text-ink">
              <input type="radio" name="attending" value="no" required /> 불참
            </label>
          </div>
        </fieldset>

        <Field label="인원수">
          <Input
            name="party_size"
            type="number"
            min={1}
            max={20}
            defaultValue={1}
          />
        </Field>

        {fields.side && (
          <fieldset>
            <legend className="text-sm text-secondary font-medium mb-1">
              신랑측·신부측
            </legend>
            <div className="flex gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 min-h-[44px] px-3 bg-bg border border-border rounded-md cursor-pointer text-ink">
                <input type="radio" name="guest_side" value="groom" required /> 신랑측
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 min-h-[44px] px-3 bg-bg border border-border rounded-md cursor-pointer text-ink">
                <input type="radio" name="guest_side" value="bride" required /> 신부측
              </label>
            </div>
          </fieldset>
        )}

        {fields.meal && (
          <fieldset>
            <legend className="text-sm text-secondary font-medium mb-1">
              식사 여부
            </legend>
            <div className="flex gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 min-h-[44px] px-3 bg-bg border border-border rounded-md cursor-pointer text-ink">
                <input type="radio" name="meal_attending" value="yes" required /> 식사함
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 min-h-[44px] px-3 bg-bg border border-border rounded-md cursor-pointer text-ink">
                <input type="radio" name="meal_attending" value="no" required /> 안 함
              </label>
            </div>
          </fieldset>
        )}

        {fields.parking && (
          <fieldset>
            <legend className="text-sm text-secondary font-medium mb-1">
              주차 필요 여부
            </legend>
            <div className="flex gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 min-h-[44px] px-3 bg-bg border border-border rounded-md cursor-pointer text-ink">
                <input type="radio" name="parking_needed" value="yes" required /> 필요
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 min-h-[44px] px-3 bg-bg border border-border rounded-md cursor-pointer text-ink">
                <input type="radio" name="parking_needed" value="no" required /> 불필요
              </label>
            </div>
          </fieldset>
        )}

        <Field label="메시지 (선택)">
          <Textarea
            name="message"
            maxLength={200}
            rows={3}
            placeholder="메시지 (선택)"
          />
        </Field>

        {error && <p className="text-xs text-red-600">{error}</p>}
        <Button
          type="submit"
          disabled={pending}
          variant="primary"
          className="w-full"
        >
          {pending ? "보내는 중..." : "응답 보내기"}
        </Button>
      </Card>
    </form>
  );
}
