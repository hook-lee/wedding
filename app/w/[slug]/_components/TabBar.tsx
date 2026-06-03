import Link from "next/link";
import { TAB_LABELS, type TabKey } from "../_lib/tabs";

export function TabBar({
  slug,
  tabs,
  active,
}: {
  slug: string;
  tabs: TabKey[];
  active: TabKey;
}) {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-bg border-t border-border flex">
      {tabs.map((t) => (
        <Link
          key={t}
          href={`/w/${slug}?tab=${t}`}
          className={`flex-1 flex flex-col items-center py-2 ${
            active === t ? "text-ink font-semibold" : "text-muted"
          }`}
        >
          <span>{TAB_LABELS[t].icon}</span>
          <span className="text-xs">{TAB_LABELS[t].label}</span>
        </Link>
      ))}
    </nav>
  );
}
