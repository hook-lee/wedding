import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import crypto from "node:crypto";

/** Days an invite link stays valid. Long enough to sit in a KakaoTalk thread. */
const INVITE_TTL_DAYS = 14;

/** Unambiguous alphabet — no 0/O/1/I/l, since these get read aloud or retyped. */
const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

function generateCode(len = 10): string {
  const bytes = crypto.randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

export type Collaborator = { user_id: string; email: string | null; created_at: string };

/**
 * Create (or replace) the active invite for a site.
 *
 * Uses the service-role client throughout: invites are looked up *before*
 * the accepting user has any relationship to the site, so RLS has nothing
 * to grant them access by. Every caller below therefore re-checks
 * authorization itself.
 */
export async function createInvite(siteId: string, createdBy: string): Promise<string> {
  const admin = createSupabaseAdminClient();
  // One live invite per site — issuing a new link quietly retires the old
  // one, so a link shared by mistake stops working.
  await admin.from("site_invites").delete().eq("site_id", siteId).is("used_at", null);

  const code = generateCode();
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 86400_000).toISOString();
  const { error } = await admin.from("site_invites").insert({
    code,
    site_id: siteId,
    created_by: createdBy,
    expires_at: expiresAt,
  });
  if (error) throw error;
  return code;
}

export type InvitePreview = {
  siteId: string;
  groomName: string;
  brideName: string;
};

/** Look up an invite for display, without consuming it. */
export async function peekInvite(code: string): Promise<InvitePreview | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("site_invites")
    .select("site_id, expires_at, used_at")
    .eq("code", code)
    .maybeSingle();
  if (!data || data.used_at || new Date(data.expires_at) < new Date()) return null;

  const { data: site } = await admin
    .from("wedding_sites")
    .select("id, groom_name, bride_name")
    .eq("id", data.site_id)
    .maybeSingle();
  if (!site) return null;
  return {
    siteId: site.id,
    groomName: site.groom_name ?? "",
    brideName: site.bride_name ?? "",
  };
}

export type AcceptResult = { ok: true } | { ok: false; error: string };

/** Consume an invite and add the user as a collaborator. */
export async function acceptInvite(code: string, userId: string): Promise<AcceptResult> {
  const admin = createSupabaseAdminClient();
  const { data: invite } = await admin
    .from("site_invites")
    .select("site_id, expires_at, used_at")
    .eq("code", code)
    .maybeSingle();

  if (!invite) return { ok: false, error: "초대 링크를 찾을 수 없어요." };
  if (invite.used_at) return { ok: false, error: "이미 사용된 초대 링크예요." };
  if (new Date(invite.expires_at) < new Date())
    return { ok: false, error: "만료된 초대 링크예요. 새로 받아주세요." };

  const { data: site } = await admin
    .from("wedding_sites")
    .select("owner_id")
    .eq("id", invite.site_id)
    .maybeSingle();
  if (!site) return { ok: false, error: "청첩장을 찾을 수 없어요." };
  if (site.owner_id === userId)
    return { ok: false, error: "본인이 만든 청첩장이에요." };

  const { error: insErr } = await admin
    .from("site_collaborators")
    .upsert({ site_id: invite.site_id, user_id: userId });
  if (insErr) return { ok: false, error: insErr.message };

  // Mark used only after the membership lands, so a failure leaves the link
  // usable rather than burning it.
  await admin
    .from("site_invites")
    .update({ used_at: new Date().toISOString(), used_by: userId })
    .eq("code", code);

  return { ok: true };
}

/** Everyone who can edit this site besides its owner. */
export async function listCollaborators(siteId: string): Promise<Collaborator[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("site_collaborators")
    .select("user_id, created_at")
    .eq("site_id", siteId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];

  // Emails live in auth.users, which PostgREST doesn't expose — fetch them
  // through the admin auth API instead.
  return Promise.all(
    data.map(async (row) => {
      const { data: u } = await admin.auth.admin.getUserById(row.user_id);
      return {
        user_id: row.user_id,
        email: u?.user?.email ?? null,
        created_at: row.created_at,
      };
    }),
  );
}

export async function removeCollaborator(siteId: string, userId: string): Promise<void> {
  const admin = createSupabaseAdminClient();
  await admin
    .from("site_collaborators")
    .delete()
    .eq("site_id", siteId)
    .eq("user_id", userId);
}

/** Is this user the site's owner (as opposed to an invited collaborator)? */
export async function isSiteOwner(siteId: string, userId: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("wedding_sites")
    .select("owner_id")
    .eq("id", siteId)
    .maybeSingle();
  return data?.owner_id === userId;
}
