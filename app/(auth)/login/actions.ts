"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Only ever follow same-origin paths. An attacker could otherwise craft
 * /login?redirect=https://evil.example and use our login page to launder a
 * phishing hop. "//host" is rejected too — the browser reads it as
 * protocol-relative and leaves the site.
 */
function safeRedirect(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/admin";
  return raw;
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeRedirect(String(formData.get("redirect") ?? "") || null);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };

  redirect(next);
}
