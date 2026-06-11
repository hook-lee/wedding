import { LinkButton } from "@/app/_ui/Button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4 bg-bg">
      <p className="text-5xl font-semibold text-ink tracking-tight">404</p>
      <p className="text-secondary">청첩장을 찾을 수 없어요.</p>
      <LinkButton href="/" variant="secondary" className="mt-2">
        메인으로
      </LinkButton>
    </main>
  );
}
