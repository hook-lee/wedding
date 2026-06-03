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
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">디자인·섹션·공개</h2>

      <div>
        <p className="text-sm text-secondary mb-2">테마</p>
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
              <span className="px-3 py-1.5 rounded-pill border border-border peer-checked:bg-ink peer-checked:text-bg text-sm">
                {t.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-secondary mb-2">표시할 섹션</p>
        <div className="grid grid-cols-2 gap-2">
          {SECTIONS.map((s) => (
            <label
              key={s.key}
              className="flex items-center gap-2 p-2 bg-bg rounded-sm"
            >
              <input
                type="checkbox"
                name={`section_${s.key}`}
                defaultChecked={sectionsEnabled[s.key] ?? true}
              />
              <span className="text-sm">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 p-3 bg-bg rounded-sm cursor-pointer">
        <input type="checkbox" name="published" defaultChecked={published} />
        <span className="text-sm font-semibold">공개 사이트 활성화</span>
      </label>
    </section>
  );
}
