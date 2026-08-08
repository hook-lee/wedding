"use client";
import { Card, CardHeader } from "@/app/_ui/Card";
import type { GalleryStyle } from "@/lib/extras/types";

const STYLES: { key: GalleryStyle; label: string; hint: string }[] = [
  { key: "grid", label: "격자", hint: "3열 타일 · 한눈에 많이" },
  { key: "swipe", label: "슬라이드", hint: "가로로 넘기는 큰 카드" },
  { key: "masonry", label: "매거진", hint: "원본 비율 2열 · 잡지 느낌" },
  { key: "film", label: "필름", hint: "크게 한 장 + 아래 썸네일" },
];

export function GalleryStyleSection({ style }: { style: GalleryStyle }) {
  return (
    <Card>
      <CardHeader
        title="사진첩 스타일"
        hint="같은 사진이라도 배치에 따라 분위기가 달라져요. 사진을 넣고 미리보기로 비교해보세요."
      />
      <div className="grid grid-cols-2 gap-2">
        {STYLES.map((s) => (
          <label key={s.key} className="cursor-pointer">
            <input
              type="radio"
              name="gallery_style"
              value={s.key}
              defaultChecked={style === s.key}
              className="peer sr-only"
            />
            <span className="flex flex-col justify-center min-h-[56px] px-4 py-2 rounded-md border border-border peer-checked:border-ink peer-checked:bg-bg transition-colors">
              <span className="text-sm font-medium text-ink">{s.label}</span>
              <span className="text-[11px] text-muted">{s.hint}</span>
            </span>
          </label>
        ))}
      </div>
    </Card>
  );
}
