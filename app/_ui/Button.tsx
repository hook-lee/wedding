import type {
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
  ReactNode,
} from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-ink text-bg shadow-card hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed",
  secondary:
    "bg-bg text-ink border border-ink hover:bg-ink/5 active:bg-ink/10 disabled:opacity-50 disabled:cursor-not-allowed",
  ghost:
    "text-secondary hover:text-ink underline underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
};

const BASE =
  "inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-pill text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ink/30 focus:ring-offset-2 focus:ring-offset-bg";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  const cls =
    variant === "ghost"
      ? `text-sm ${VARIANT_CLASSES.ghost}`
      : `${BASE} ${VARIANT_CLASSES[variant]}`;
  return (
    <button className={`${cls} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({
  variant = "primary",
  className = "",
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  const cls =
    variant === "ghost"
      ? `text-sm ${VARIANT_CLASSES.ghost}`
      : `${BASE} ${VARIANT_CLASSES[variant]}`;
  return (
    <a className={`${cls} ${className}`} {...rest}>
      {children}
    </a>
  );
}
