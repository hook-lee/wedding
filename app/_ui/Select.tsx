import type { SelectHTMLAttributes, ReactNode } from "react";

export function Select({
  className = "",
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select
      className={`w-full min-w-0 min-h-[44px] px-3 rounded-md border border-border bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-ink/15 focus:border-ink/40 transition-colors ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}
