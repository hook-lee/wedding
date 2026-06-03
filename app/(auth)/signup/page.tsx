"use client";
import { useState } from "react";
import { signupAction } from "./actions";
import Link from "next/link";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handle(formData: FormData) {
    setPending(true);
    const result = await signupAction(formData);
    if (result?.error) setError(result.error);
    setPending(false);
  }

  return (
    <form action={handle} className="space-y-4">
      <h1 className="text-2xl font-semibold mb-6">내 청첩장 만들기</h1>
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
        minLength={8}
        placeholder="비밀번호 (8자 이상)"
        className="w-full p-3 rounded-sm border border-border bg-surface"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full p-3 bg-ink text-bg rounded-pill disabled:opacity-50"
      >
        {pending ? "가입 중..." : "가입하기"}
      </button>
      <p className="text-sm text-center text-secondary">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
