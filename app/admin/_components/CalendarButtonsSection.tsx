"use client";
import { Card, CardHeader } from "@/app/_ui/Card";
import { Select } from "@/app/_ui/Select";
import type { CalendarButtons, CalendarReminders } from "@/lib/extras/types";

const ITEMS: { key: keyof CalendarButtons; name: string; label: string }[] = [
  { key: "google", name: "calendar_button_google", label: "Google 캘린더 버튼" },
  { key: "ics", name: "calendar_button_ics", label: "iOS·삼성 캘린더 버튼" },
];

const REMINDER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "사용 안 함" },
  { value: "10m", label: "10분 전" },
  { value: "30m", label: "30분 전" },
  { value: "1h", label: "1시간 전" },
  { value: "3h", label: "3시간 전" },
  { value: "6h", label: "6시간 전" },
  { value: "12h", label: "12시간 전" },
  { value: "1d", label: "하루 전" },
  { value: "2d", label: "이틀 전" },
  { value: "1w", label: "일주일 전" },
];

export function CalendarButtonsSection({
  buttons,
  reminders,
}: {
  buttons: Required<CalendarButtons>;
  reminders: Required<CalendarReminders>;
}) {
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

      <div>
        <p className="text-sm text-secondary font-medium mb-2">
          알림 시간 (캘린더 등록 버튼에만 적용)
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Select name="calendar_reminder_first" defaultValue={reminders.first} aria-label="첫 번째 알림">
            {REMINDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Select name="calendar_reminder_second" defaultValue={reminders.second} aria-label="두 번째 알림">
            {REMINDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </Card>
  );
}
