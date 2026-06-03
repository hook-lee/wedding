import type { Tables } from "@/lib/supabase/types";

export function GreetingSection({ site }: { site: Tables<"wedding_sites"> }) {
  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">인사말</h2>
      <textarea
        name="greeting"
        rows={5}
        defaultValue={site.greeting ?? ""}
        placeholder="저희 두 사람이 새로운 시작을 함께합니다..."
        className="w-full p-2 rounded-sm border border-border bg-surface"
      />
    </section>
  );
}
