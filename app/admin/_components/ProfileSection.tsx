import { Card, CardHeader } from "@/app/_ui/Card";
import { Input } from "@/app/_ui/Input";
import { Textarea } from "@/app/_ui/Textarea";

type Profile = { mbti?: string; intro?: string };

function Block({
  side,
  label,
  p,
}: {
  side: "groom" | "bride";
  label: string;
  p: Profile;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-ink">{label}</h3>
      <Input
        name={`${side}_mbti`}
        defaultValue={p.mbti ?? ""}
        placeholder="MBTI"
        aria-label={`${label} MBTI`}
      />
      <Textarea
        name={`${side}_intro`}
        rows={3}
        defaultValue={p.intro ?? ""}
        placeholder="간단한 소개"
        aria-label={`${label} 소개`}
      />
    </div>
  );
}

export function ProfileSection({
  groom,
  bride,
}: {
  groom: Profile;
  bride: Profile;
}) {
  return (
    <Card>
      <CardHeader title="신랑·신부 프로필" />
      <div className="grid md:grid-cols-2 gap-4">
        <Block side="groom" label="신랑" p={groom} />
        <Block side="bride" label="신부" p={bride} />
      </div>
    </Card>
  );
}
