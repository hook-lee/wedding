import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-3 bg-bg">
      <p className="text-3xl font-semibold">404</p>
      <p className="text-secondary">청첩장을 찾을 수 없습니다.</p>
      <Link href="/" className="text-sm underline text-secondary">메인으로</Link>
    </main>
  );
}
