import { Card } from "@/app/_ui/Card";
import { Icon } from "./Icon";
import type { ContactInfo } from "@/lib/extras/types";

/** Strips formatting so tel:/sms: get a clean dialable string. */
function dial(phone: string): string {
  return phone.replace(/[^0-9+]/g, "");
}

function Row({ role, name, phone }: { role: string; name: string; phone: string }) {
  const n = dial(phone);
  if (!n) return null;
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted">{role}</p>
        <p className="text-sm font-semibold text-ink truncate">{name}</p>
      </div>
      <a
        href={`tel:${n}`}
        className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 bg-ink text-bg rounded-pill text-xs font-medium shadow-card hover:opacity-90 active:opacity-80 transition-opacity"
      >
        <Icon name="phone" className="w-3.5 h-3.5 flex-shrink-0" />
        전화
      </a>
      <a
        href={`sms:${n}`}
        className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 bg-surface border border-border text-ink rounded-pill text-xs font-medium hover:bg-bg transition-colors"
      >
        <Icon name="chat" className="w-3.5 h-3.5 flex-shrink-0" />
        문자
      </a>
    </div>
  );
}

export function ContactView({
  contact,
  groomName,
  brideName,
}: {
  contact: Required<ContactInfo>;
  groomName: string;
  brideName: string;
}) {
  if (!dial(contact.groom_phone) && !dial(contact.bride_phone)) return null;
  return (
    <Card className="space-y-4">
      <Row role="신랑" name={groomName} phone={contact.groom_phone} />
      <Row role="신부" name={brideName} phone={contact.bride_phone} />
    </Card>
  );
}
