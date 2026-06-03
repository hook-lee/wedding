type Entry = { name: string; status: "alive" | "go" | "hyeon" };

function prefix(role: "father" | "mother", status: Entry["status"]) {
  if (status === "go") return <span className="text-deceased font-semibold">故 </span>;
  if (status === "hyeon") {
    return (
      <span className="text-deceased font-semibold">
        {role === "father" ? "顯考" : "顯妣"}{" "}
      </span>
    );
  }
  return null;
}

export function ParentsLine({
  father,
  mother,
  childLabel,
  childName,
}: {
  father?: Entry;
  mother?: Entry;
  childLabel: string;
  childName: string;
}) {
  if (!father && !mother) return null;
  return (
    <p className="text-sm text-secondary">
      {father && (
        <>
          {prefix("father", father.status)}
          {father.name}
        </>
      )}
      {father && mother && <span> · </span>}
      {mother && (
        <>
          {prefix("mother", mother.status)}
          {mother.name}
        </>
      )}
      <span> 의 {childLabel} </span>
      <strong className="text-ink">{childName}</strong>
    </p>
  );
}
