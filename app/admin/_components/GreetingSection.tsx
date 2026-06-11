import type { Tables } from "@/lib/supabase/types";
import { Card, CardHeader } from "@/app/_ui/Card";
import { Field } from "@/app/_ui/Field";
import { Input } from "@/app/_ui/Input";
import { Textarea } from "@/app/_ui/Textarea";

export function GreetingSection({ site }: { site: Tables<"wedding_sites"> }) {
  return (
    <Card>
      <CardHeader title="인사말" />

      <Field label="텍스트 인사말">
        <Textarea
          name="greeting"
          rows={5}
          defaultValue={site.greeting ?? ""}
          placeholder="저희 두 사람이 새로운 시작을 함께합니다..."
        />
      </Field>

      <Field
        label="YouTube 영상 링크 (선택)"
        hint="영상이 있으면 손님 화면 인사말 위에 자동 재생 가능한 플레이어로 표시됩니다."
      >
        <Input
          name="greeting_video_url"
          defaultValue={
            site.greeting_video_id
              ? `https://youtu.be/${site.greeting_video_id}`
              : ""
          }
          placeholder="예: https://youtu.be/xxxxxxx 또는 https://www.youtube.com/watch?v=xxxxxxx"
        />
      </Field>
    </Card>
  );
}
