"use client";
import { Card, CardHeader } from "@/app/_ui/Card";
import type { CalendarButtons } from "@/lib/extras/types";

const ITEMS: { key: keyof CalendarButtons; name: string; label: string }[] = [
  { key: "google", name: "calendar_button_google", label: "Google 캘린더 버튼" },
  { key: "ics", name: "calendar_button_ics", label: "iOS·삼성 캘린더 버튼" },
];

export function CalendarButtonsSection({ buttons }: { buttons: Required<CalendarButtons> }) {
  return (
    <Card>
      <CardHeader
        title="캘린더 저장 버튼"
        hint="식장·날짜를 하객 캘린더 앱에 저장할 수 있는 버튼이에요. 필요 없는 쪽은 꺼두세요."
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
              defaultChecked={buttons[item.key]}
              className="w-4 h-4"
            />
            <span className="text-sm text-ink">{item.label}</span>
          </label>
        ))}
      </div>
    </Card>
  );
}
