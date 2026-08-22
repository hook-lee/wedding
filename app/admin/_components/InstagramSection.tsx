"use client";
import { Card, CardHeader } from "@/app/_ui/Card";
import { Input } from "@/app/_ui/Input";
import { Textarea } from "@/app/_ui/Textarea";
import type { Instagram } from "@/lib/extras/types";

export function InstagramSection({ instagram }: { instagram: Required<Instagram> }) {
  return (
    <Card>
      <CardHeader
        title="인스타그램"
        hint="두 분의 인스타그램 계정을 청첩장에 연결해요. 기본 위치는 방명록 바로 아래이고, '섹션 순서'에서 옮길 수 있어요."
      />

      <label className="flex items-center gap-2 p-3 bg-bg rounded-md cursor-pointer min-h-[44px]">
        <input
          type="checkbox"
          name="instagram_enabled"
          defaultChecked={instagram.enabled}
          className="w-4 h-4"
        />
        <span className="text-sm text-ink">인스타그램 링크 보이기</span>
      </label>

      <div>
        <p className="text-sm text-secondary font-medium mb-1">계정 아이디</p>
        <Input
          name="instagram_username"
          defaultValue={instagram.username}
          placeholder="예) our_wedding_day"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <p className="text-[11px] text-muted mt-1">
          @나 주소 전체를 붙여넣어도 알아서 아이디만 남겨요. 비워두면 켜져 있어도 안 보입니다.
        </p>
      </div>

      <div>
        <p className="text-sm text-secondary font-medium mb-1">안내 문구 (선택)</p>
        <Textarea
          name="instagram_note"
          rows={2}
          defaultValue={instagram.note}
          placeholder="예) 두 사람의 일상을 인스타그램에서도 만나보세요."
        />
      </div>
    </Card>
  );
}
