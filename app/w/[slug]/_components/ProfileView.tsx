type Profile = { mbti?: string; intro?: string };

export function ProfileView({
  groom,
  groomName,
  bride,
  brideName,
}: {
  groom: Profile;
  groomName: string;
  bride: Profile;
  brideName: string;
}) {
  function Card({
    label,
    name,
    p,
  }: {
    label: string;
    name: string;
    p: Profile;
  }) {
    if (!p.mbti && !p.intro) return null;
    return (
      <div className="bg-surface border border-border rounded-md p-4 shadow-card">
        <p className="text-xs text-muted">{label}</p>
        <p className="text-base font-semibold mt-1">{name}</p>
        {p.mbti && <p className="text-sm text-accent mt-1">{p.mbti}</p>}
        {p.intro && (
          <p className="text-sm text-secondary mt-2 whitespace-pre-line">
            {p.intro}
          </p>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <Card label="신랑" name={groomName} p={groom} />
      <Card label="신부" name={brideName} p={bride} />
    </div>
  );
}
