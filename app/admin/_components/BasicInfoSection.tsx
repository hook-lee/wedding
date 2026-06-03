import { SlugField } from "./SlugField";
import type { Tables } from "@/lib/supabase/types";

export function BasicInfoSection({ site }: { site: Tables<"wedding_sites"> }) {
  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">기본 정보</h2>
      <SlugField defaultValue={site.slug} />

      <label className="block">
        <span className="text-sm text-secondary">신랑 이름</span>
        <input
          name="groom_name"
          defaultValue={site.groom_name ?? ""}
          className="w-full mt-1 p-2 rounded-sm border border-border bg-surface"
        />
      </label>

      <label className="block">
        <span className="text-sm text-secondary">신부 이름</span>
        <input
          name="bride_name"
          defaultValue={site.bride_name ?? ""}
          className="w-full mt-1 p-2 rounded-sm border border-border bg-surface"
        />
      </label>

      <label className="block">
        <span className="text-sm text-secondary">결혼식 일시</span>
        <input
          name="wedding_at"
          type="datetime-local"
          defaultValue={site.wedding_at ? new Date(site.wedding_at).toISOString().slice(0, 16) : ""}
          className="w-full mt-1 p-2 rounded-sm border border-border bg-surface"
        />
      </label>

      <label className="block">
        <span className="text-sm text-secondary">이름 사이 구분</span>
        <select
          name="name_joiner"
          defaultValue={site.name_joiner}
          className="w-full mt-1 p-2 rounded-sm border border-border bg-surface"
        >
          <option value=" ♡ ">창환 ♡ 지영</option>
          <option value=" · ">창환 · 지영</option>
          <option value=" & ">창환 &amp; 지영</option>
          <option value="  ">창환  지영 (공백)</option>
        </select>
      </label>
    </section>
  );
}
