import { Card, CardHeader } from "@/app/_ui/Card";
import { Input } from "@/app/_ui/Input";

type Acc = { bank?: string; account?: string; holder?: string } | null;
type AccountInfo = {
  groom?: { self?: Acc; father?: Acc; mother?: Acc };
  bride?: { self?: Acc; father?: Acc; mother?: Acc };
};

function Row({
  prefix,
  label,
  value,
}: {
  prefix: string;
  label: string;
  value: Acc | undefined;
}) {
  return (
    <div className="space-y-2 pb-2 border-b border-border last:border-0">
      <span className="text-xs text-secondary font-semibold">{label}</span>
      <div className="grid grid-cols-[110px_1fr_110px] gap-2 items-center">
        <Input
          name={`${prefix}_bank`}
          defaultValue={value?.bank ?? ""}
          placeholder="은행"
          aria-label={`${label} 은행`}
          className="text-sm"
        />
        <Input
          name={`${prefix}_account`}
          defaultValue={value?.account ?? ""}
          placeholder="계좌번호"
          aria-label={`${label} 계좌번호`}
          className="text-sm"
        />
        <Input
          name={`${prefix}_holder`}
          defaultValue={value?.holder ?? ""}
          placeholder="예금주"
          aria-label={`${label} 예금주`}
          className="text-sm"
        />
      </div>
    </div>
  );
}

export function AccountSection({ info }: { info: AccountInfo }) {
  return (
    <Card>
      <CardHeader
        title="마음전하기"
        hint="빈칸은 공개 사이트에서 숨김"
      />
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-ink">신랑측</h3>
        <Row prefix="acc_groom_self" label="본인" value={info.groom?.self ?? null} />
        <Row prefix="acc_groom_father" label="아버지" value={info.groom?.father ?? null} />
        <Row prefix="acc_groom_mother" label="어머니" value={info.groom?.mother ?? null} />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-ink">신부측</h3>
        <Row prefix="acc_bride_self" label="본인" value={info.bride?.self ?? null} />
        <Row prefix="acc_bride_father" label="아버지" value={info.bride?.father ?? null} />
        <Row prefix="acc_bride_mother" label="어머니" value={info.bride?.mother ?? null} />
      </div>
    </Card>
  );
}
