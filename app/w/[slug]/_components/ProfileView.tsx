import { Card } from "@/app/_ui/Card";

type Profile = { mbti?: string; intro?: string; photo_url?: string };

function ProfileCard({
  label,
  name,
  p,
}: {
  label: string;
  name: string;
  p: Profile;
}) {
  if (!p.mbti && !p.intro && !p.photo_url) return null;
  return (
    <Card className="space-y-1">
      {p.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.photo_url}
          alt=""
          className="w-full aspect-square object-cover rounded-md mb-2"
        />
      )}
      <p className="text-xs text-muted">{label}</p>
      <p className="text-base font-semibold text-ink">{name}</p>
      {p.mbti && <p className="text-sm text-accent">{p.mbti}</p>}
      {p.intro && (
        <p className="text-sm text-secondary whitespace-pre-line pt-1">
          {p.intro}
        </p>
      )}
    </Card>
  );
}

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
  return (
    <div className="space-y-3">
      <ProfileCard label="신랑" name={groomName} p={groom} />
      <ProfileCard label="신부" name={brideName} p={bride} />
    </div>
  );
}
