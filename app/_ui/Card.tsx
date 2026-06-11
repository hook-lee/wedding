import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`bg-surface border border-border rounded-lg p-5 sm:p-6 space-y-4 shadow-card ${className}`}
    >
      {children}
    </section>
  );
}

export function CardHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <header className="space-y-1">
      <h2 className="text-base sm:text-lg font-semibold text-ink">{title}</h2>
      {hint && <p className="text-xs text-muted leading-relaxed">{hint}</p>}
    </header>
  );
}
