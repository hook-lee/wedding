import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full min-w-0 min-h-[44px] px-3 rounded-md border border-border bg-bg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/15 focus:border-ink/40 transition-colors ${className}`}
      {...rest}
    />
  );
}
