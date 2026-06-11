import type { TextareaHTMLAttributes } from "react";

export function Textarea({
  className = "",
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full min-w-0 px-3 py-2.5 rounded-md border border-border bg-bg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/15 focus:border-ink/40 transition-colors resize-y leading-relaxed ${className}`}
      {...rest}
    />
  );
}
