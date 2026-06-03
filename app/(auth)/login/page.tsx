"use client";
import { useState } from "react";
import { loginAction } from "./actions";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handle(formData: FormData) {
    setPending(true);
    const result = await loginAction(formData);
    if (result?.error) setError(result.error);
    setPending(false);
  }

  return (
    <form action={handle} className="space-y-4">
      <h1 className="text-2xl font-semibold mb-6">로그인</h1>
      <input
        name="email"
        type="email"
        required
        placeholder="이메일"
        className="w-full p-3 rounded-sm border border-border bg-surface"
      />
      <input
        name="password"
        type="password"
        required
        placeholder="비밀번호"
        className="w-full p-3 rounded-sm border border-border bg-surface"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full p-3 bg-ink text-bg rounded-pill disabled:opacity-50"
      >
        {pending ? "로그인 중..." : "로그인"}
      </button>
      <p className="text-sm text-center text-secondary">
        처음 오셨나요?{" "}
        <Link href="/signup" className="underline">
          가입하기
        </Link>
      </p>
    </form>
  );
}
