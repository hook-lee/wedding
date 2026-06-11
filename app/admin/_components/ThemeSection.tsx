import { Card, CardHeader } from "@/app/_ui/Card";

const THEMES = [
  { key: "ivory", label: "🪶 Ivory" },
  { key: "sage", label: "🌿 Sage" },
  { key: "pink", label: "🌸 Pink" },
  { key: "cobalt", label: "🔵 Cobalt" },
  { key: "mocha", label: "☕ Mocha" },
  { key: "ash", label: "🌫 Ash" },
];

const SECTIONS = [
  { key: "story", label: "📖 우리 스토리" },
  { key: "gallery", label: "📷 사진첩" },
  { key: "guestbook", label: "💬 일촌평" },
  { key: "rsvp", label: "📋 RSVP" },
  { key: "account", label: "💝 마음전하기" },
  { key: "profile", label: "👤 프로필" },
];

export function ThemeSection({
  theme,
  sectionsEnabled,
  published,
}: {
  theme: string;
  sectionsEnabled: Record<string, boolean>;
  published: boolean;
}) {
  return (
    <Card>
      <CardHeader title="디자인·섹션·공개" />

      <div>
        <p className="text-sm text-secondary font-medium mb-2">테마</p>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((t) => (
            <label key={t.key} className="cursor-pointer">
              <input
                type="radio"
                name="theme"
                value={t.key}
                defaultChecked={theme === t.key}
                className="peer sr-only"
              />
              <span className="inline-flex items-center min-h-[44px] px-4 rounded-pill border border-border peer-checked:bg-ink peer-checked:text-bg text-sm transition-colors">
                {t.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-secondary font-medium mb-2">표시할 섹션</p>
        <div className="grid grid-cols-2 gap-2">
          {SECTIONS.map((s) => (
            <label
              key={s.key}
              className="flex items-center gap-2 p-3 bg-bg rounded-md cursor-pointer min-h-[44px]"
            >
              <input
                type="checkbox"
                name={`section_${s.key}`}
                defaultChecked={sectionsEnabled[s.key] ?? true}
              />
              <span className="text-sm text-ink">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 p-3 bg-bg rounded-md cursor-pointer min-h-[44px]">
        <input type="checkbox" name="published" defaultChecked={published} />
        <span className="text-sm font-semibold text-ink">공개 사이트 활성화</span>
      </label>
    </Card>
  );
}
