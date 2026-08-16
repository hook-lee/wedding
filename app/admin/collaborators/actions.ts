"use server";
import { requireUser } from "@/lib/auth/require-user";
import { resolveAdminSite } from "@/lib/db/wedding-site";
import { createInvite, removeCollaborator, isSiteOwner } from "@/lib/db/collaborators";
import { revalidatePath } from "next/cache";

export type InviteState = { code?: string; error?: string };

export async function generateInvite(
  _prev: InviteState | null,
): Promise<InviteState> {
  const user = await requireUser();
  const site = await resolveAdminSite(user.id);
  // Only the owner hands out access — a collaborator shouldn't be able to
  // pull more people into someone else's invitation.
  if (!(await isSiteOwner(site.id, user.id))) {
    return { error: "청첩장을 만든 사람만 초대할 수 있어요." };
  }
  try {
    const code = await createInvite(site.id, user.id);
    revalidatePath("/admin");
    return { code };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "초대 링크를 만들지 못했어요." };
  }
}

export async function kickCollaborator(userId: string) {
  const user = await requireUser();
  const site = await resolveAdminSite(user.id);
  if (!(await isSiteOwner(site.id, user.id))) return;
  await removeCollaborator(site.id, userId);
  revalidatePath("/admin");
}
