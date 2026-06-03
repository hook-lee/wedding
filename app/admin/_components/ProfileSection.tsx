type Profile = { mbti?: string; intro?: string };

export function ProfileSection({
  groom,
  bride,
}: {
  groom: Profile;
  bride: Profile;
}) {
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
        <h3 className="text-sm font-semibold">{label}</h3>
        <input
          name={`${side}_mbti`}
          defaultValue={p.mbti ?? ""}
          placeholder="MBTI"
          className="w-full p-2 rounded-sm border border-border bg-surface"
        />
        <textarea
          name={`${side}_intro`}
          rows={3}
          defaultValue={p.intro ?? ""}
          placeholder="간단한 소개"
          className="w-full p-2 rounded-sm border border-border bg-surface"
        />
      </div>
    );
  }
  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">신랑·신부 프로필</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Block side="groom" label="신랑" p={groom} />
        <Block side="bride" label="신부" p={bride} />
      </div>
    </section>
  );
}
