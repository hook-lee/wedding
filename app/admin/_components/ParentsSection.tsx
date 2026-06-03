import type { ParentsBlock, ParentEntry } from "@/lib/parents/types";

const GROOM_ORDERS = ["장남", "차남", "삼남", "사남", "오남", "막내아들", "외아들"];
const BRIDE_ORDERS = ["장녀", "차녀", "삼녀", "사녀", "오녀", "막내딸", "외동딸"];

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
    <div className="grid grid-cols-[100px_1fr_90px] gap-2 items-center">
      <span className="text-sm text-secondary">{label}</span>
      <input
        name={`${baseName}_name`}
        defaultValue={value?.name ?? ""}
        placeholder="이름"
        className="w-full min-w-0 p-2 rounded-sm border border-border bg-surface"
      />
      <select
        name={`${baseName}_status`}
        defaultValue={value?.status ?? "alive"}
        className="w-full min-w-0 p-2 rounded-sm border border-border bg-surface text-sm"
      >
        <option value="alive">생존</option>
        <option value="go">故</option>
        <option value="hyeon">{isMother ? "顯妣" : "顯考"}</option>
      </select>
    </div>
  );
}

type Props = {
  parents: ParentsBlock;
  groomBirthOrder: string;
  brideBirthOrder: string;
};

export function ParentsSection({ parents, groomBirthOrder, brideBirthOrder }: Props) {
  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">양가 부모님</h2>

      {/* 신랑측 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">신랑측</h3>
          <select
            name="groom_birth_order"
            defaultValue={groomBirthOrder}
            className="p-1.5 rounded-sm border border-border bg-bg text-xs"
          >
            {GROOM_ORDERS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <Row side="groom" role="father" label="신랑 아버지" value={parents.groom_father} />
        <Row side="groom" role="mother" label="신랑 어머니" value={parents.groom_mother} />
      </div>

      {/* 신부측 */}
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">신부측</h3>
          <select
            name="bride_birth_order"
            defaultValue={brideBirthOrder}
            className="p-1.5 rounded-sm border border-border bg-bg text-xs"
          >
            {BRIDE_ORDERS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <Row side="bride" role="father" label="신부 아버지" value={parents.bride_father} />
        <Row side="bride" role="mother" label="신부 어머니" value={parents.bride_mother} />
      </div>
    </section>
  );
}
