import Link from "next/link";
import { TAB_LABELS, type TabKey } from "../_lib/tabs";
import { Icon } from "./Icon";

type IconName = React.ComponentProps<typeof Icon>["name"];

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
          className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
            active === t ? "text-ink font-semibold" : "text-muted hover:text-secondary"
          }`}
        >
          <Icon name={TAB_LABELS[t].iconName as IconName} className="w-5 h-5" />
          <span className="text-[10px]">{TAB_LABELS[t].label}</span>
        </Link>
      ))}
    </nav>
  );
}
