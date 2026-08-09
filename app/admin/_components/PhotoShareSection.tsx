"use client";
import { Card, CardHeader } from "@/app/_ui/Card";
import { Textarea } from "@/app/_ui/Textarea";
import type { PhotoShare } from "@/lib/extras/types";

export function PhotoShareSection({ share }: { share: Required<PhotoShare> }) {
  return (
    <Card>
      <CardHeader
        title="사진 공유하기"
        hint="하객이 결혼식 당일 찍은 사진을 직접 올릴 수 있어요. '표시할 섹션'에서 '사진 공유'도 함께 켜야 보입니다."
      />

      <label className="flex items-center gap-2 p-3 bg-bg rounded-md cursor-pointer min-h-[44px]">
        <input
          type="checkbox"
          name="photo_share_enabled"
          defaultChecked={share.enabled}
          className="w-4 h-4"
        />
        <span className="text-sm text-ink">하객 사진 업로드 받기</span>
      </label>

      <label className="flex items-center gap-2 p-3 bg-bg rounded-md cursor-pointer min-h-[44px]">
        <input
          type="checkbox"
          name="photo_share_open_at_wedding"
          defaultChecked={share.open_at_wedding}
          className="w-4 h-4"
        />
        <span className="text-sm text-ink">예식 시작 시간부터 열기</span>
      </label>
      <p className="text-[11px] text-muted -mt-1">
        꺼두면 청첩장을 공개하는 즉시 사진을 받아요.
      </p>

      <div>
        <p className="text-sm text-secondary font-medium mb-1">안내 문구 (선택)</p>
        <Textarea
          name="photo_share_note"
          rows={3}
          defaultValue={share.note}
          placeholder="예) 오늘 담아주신 순간들을 나눠주세요. 소중히 간직하겠습니다."
        />
      </div>
    </Card>
  );
}
