import { Card, CardHeader } from "@/app/_ui/Card";
import type { FontFamily } from "@/lib/extras/types";

// `css` renders each option's label in the font it selects, so the picker
// doubles as its own preview. Values match [data-font] in globals.css.
const FONTS: { key: FontFamily; label: string; hint: string; css: string }[] = [
  { key: "pretendard", label: "프리텐다드", hint: "모던 고딕", css: "var(--font-pretendard)" },
  { key: "nanum-myeongjo", label: "나눔명조", hint: "클래식 명조", css: "var(--font-nanum-myeongjo)" },
  { key: "gowun-batang", label: "고운바탕", hint: "우아한 명조", css: "var(--font-gowun-batang)" },
  { key: "gowun-dodum", label: "고운돋움", hint: "부드러운 고딕", css: "var(--font-gowun-dodum)" },
  { key: "nanum-pen", label: "나눔손글씨", hint: "손글씨", css: "var(--font-nanum-pen)" },
];

const THEMES = [
  { key: "ivory", label: "🪶 Ivory" },
  { key: "sage", label: "🌿 Sage" },
  { key: "pink", label: "🌸 Pink" },
  { key: "cobalt", label: "🔵 Cobalt" },
  { key: "mocha", label: "☕ Mocha" },
  { key: "ash", label: "🌫 Ash" },
];

const SECTIONS = [
  { key: "story", label: "📖 우리 스토리", defaultOn: true },
  { key: "gallery", label: "📷 사진첩", defaultOn: true },
  { key: "guestbook", label: "💬 방명록", defaultOn: true },
  { key: "rsvp", label: "📋 RSVP", defaultOn: true },
  { key: "account", label: "💝 마음전하기", defaultOn: true },
  { key: "profile", label: "👤 프로필", defaultOn: true },
  { key: "sponsor", label: "🤝 스폰서", defaultOn: false },
  { key: "photo_share", label: "📸 사진 공유", defaultOn: false },
];

export function ThemeSection({
  theme,
  fontFamily,
  sectionsEnabled,
  published,
}: {
  theme: string;
  fontFamily: FontFamily;
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
        <p className="text-sm text-secondary font-medium mb-2">글꼴</p>
        <div className="grid grid-cols-2 gap-2">
          {FONTS.map((f) => (
            <label key={f.key} className="cursor-pointer">
              <input
                type="radio"
                name="font_family"
                value={f.key}
                defaultChecked={fontFamily === f.key}
                className="peer sr-only"
              />
              <span className="flex flex-col justify-center min-h-[56px] px-4 py-2 rounded-md border border-border peer-checked:border-ink peer-checked:bg-bg transition-colors">
                <span className="text-base text-ink" style={{ fontFamily: f.css }}>
                  {f.label}
                </span>
                <span className="text-[11px] text-muted">{f.hint}</span>
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
                defaultChecked={sectionsEnabled[s.key] ?? s.defaultOn}
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
