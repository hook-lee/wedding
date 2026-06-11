import type { ReactNode } from "react";

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <label className="block space-y-1" htmlFor={htmlFor}>
      {label && (
        <span className="text-sm text-secondary font-medium">{label}</span>
      )}
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </label>
  );
}
