import type { ParentsBlock, ParentEntry } from "@/lib/parents/types";

function Row({
  side,
  role,
  label,
  value,
}: {
  side: "groom" | "bride";
  role: "father" | "mother";
  label: string;
  value: ParentEntry | undefined;
}) {
  const baseName = `${side}_${role}`;
  const isMother = role === "mother";
  return (
    <div className="grid grid-cols-[100px_1fr_auto] gap-3 items-center">
      <span className="text-sm text-secondary">{label}</span>
      <input
        name={`${baseName}_name`}
        defaultValue={value?.name ?? ""}
        placeholder="이름"
        className="p-2 rounded-sm border border-border bg-surface"
      />
      <select
        name={`${baseName}_status`}
        defaultValue={value?.status ?? "alive"}
        className="p-2 rounded-sm border border-border bg-surface"
      >
        <option value="alive">생존</option>
        <option value="go">故</option>
        <option value="hyeon">{isMother ? "顯妣" : "顯考"}</option>
      </select>
    </div>
  );
}

export function ParentsSection({ parents }: { parents: ParentsBlock }) {
  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">양가 부모님</h2>
      <Row side="groom" role="father" label="신랑 아버지" value={parents.groom_father} />
      <Row side="groom" role="mother" label="신랑 어머니" value={parents.groom_mother} />
      <Row side="bride" role="father" label="신부 아버지" value={parents.bride_father} />
      <Row side="bride" role="mother" label="신부 어머니" value={parents.bride_mother} />
    </section>
  );
}
