"use server";
import { requireUser } from "@/lib/auth/require-user";
import { acceptInvite } from "@/lib/db/collaborators";
import { redirect } from "next/navigation";

export type JoinResult = { error?: string };

export async function joinSite(
  code: string,
  _prev: JoinResult | null,
): Promise<JoinResult> {
  const user = await requireUser();
  const result = await acceptInvite(code, user.id);
  if (!result.ok) return { error: result.error };
  redirect("/admin");
}
