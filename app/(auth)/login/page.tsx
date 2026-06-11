"use client";
import { useState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";
import { Field } from "@/app/_ui/Field";
import { Input } from "@/app/_ui/Input";
import { Button } from "@/app/_ui/Button";

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
    <form action={handle} className="space-y-5">
      <header className="space-y-2 mb-2">
        <h1 className="text-2xl font-semibold text-ink">로그인</h1>
        <p className="text-sm text-secondary">
          이메일과 비밀번호로 어드민에 들어와요.
        </p>
      </header>

      <Field label="이메일">
        <Input
          name="email"
          type="email"
          required
          placeholder="example@email.com"
          autoComplete="email"
        />
      </Field>

      <Field label="비밀번호">
        <Input
          name="password"
          type="password"
          required
          placeholder="비밀번호"
          autoComplete="current-password"
        />
      </Field>

      {error && (
        <p
          role="alert"
          className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3"
        >
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} variant="primary" className="w-full">
        {pending ? "로그인 중..." : "로그인"}
      </Button>

      <p className="text-sm text-center text-secondary">
        처음 오셨나요?{" "}
        <Link
          href="/signup"
          className="text-ink underline underline-offset-2 hover:opacity-80"
        >
          가입하기
        </Link>
      </p>
    </form>
  );
}
