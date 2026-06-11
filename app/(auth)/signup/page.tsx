"use client";
import { useState } from "react";
import Link from "next/link";
import { signupAction } from "./actions";
import { Field } from "@/app/_ui/Field";
import { Input } from "@/app/_ui/Input";
import { Button } from "@/app/_ui/Button";

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
    <form action={handle} className="space-y-5">
      <header className="space-y-2 mb-2">
        <h1 className="text-2xl font-semibold text-ink">내 청첩장 만들기</h1>
        <p className="text-sm text-secondary">
          이메일로 가입하고, 폼을 채우면 청첩장이 만들어져요.
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

      <Field label="비밀번호" hint="8자 이상">
        <Input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="비밀번호"
          autoComplete="new-password"
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
        {pending ? "가입 중..." : "가입하기"}
      </Button>

      <p className="text-sm text-center text-secondary">
        이미 계정이 있으신가요?{" "}
        <Link
          href="/login"
          className="text-ink underline underline-offset-2 hover:opacity-80"
        >
          로그인
        </Link>
      </p>
    </form>
  );
}
