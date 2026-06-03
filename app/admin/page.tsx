import { requireUser } from "@/lib/auth/require-user";

export default async function AdminHome() {
  const user = await requireUser();
  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">내 청첩장 편집</h1>
        <form action="/admin/logout" method="POST">
          <button className="text-sm text-secondary underline">로그아웃</button>
        </form>
      </header>
      <p className="text-secondary">
        로그인됨: <strong className="text-ink">{user.email}</strong>
      </p>
      <p className="text-sm text-muted mt-4">
        Phase 3에서 콘텐츠 편집 폼이 여기에 들어옵니다.
      </p>
    </main>
  );
}
