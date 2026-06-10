import type { Tables } from "@/lib/supabase/types";

export function GreetingSection({ site }: { site: Tables<"wedding_sites"> }) {
  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">인사말</h2>

      <label className="block">
        <span className="text-sm text-secondary">텍스트 인사말</span>
        <textarea
          name="greeting"
          rows={5}
          defaultValue={site.greeting ?? ""}
          placeholder="저희 두 사람이 새로운 시작을 함께합니다..."
          className="w-full mt-1 p-2 rounded-sm border border-border bg-surface"
        />
      </label>

      <label className="block">
        <span className="text-sm text-secondary">
          YouTube 영상 링크 <span className="text-muted">(선택 — 인사말 위에 영상 임베드)</span>
        </span>
        <input
          name="greeting_video_url"
          defaultValue={
            site.greeting_video_id
              ? `https://youtu.be/${site.greeting_video_id}`
              : ""
          }
          placeholder="예: https://youtu.be/xxxxxxx 또는 https://www.youtube.com/watch?v=xxxxxxx"
          className="w-full mt-1 p-2 rounded-sm border border-border bg-surface"
        />
        <p className="text-[10px] text-muted mt-1">
          영상이 있으면 손님 화면 인사말 위에 자동 재생 가능한 플레이어로 표시됩니다.
        </p>
      </label>
    </section>
  );
}
