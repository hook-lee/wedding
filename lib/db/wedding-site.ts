import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/supabase/types";

/** A draft nobody has actually filled in yet — safe to skip over. */
function isUntouchedDraft(site: Tables<"wedding_sites">): boolean {
  return (
    site.slug.startsWith("draft-") &&
    !site.published &&
    !site.groom_name?.trim() &&
    !site.bride_name?.trim()
  );
}

/**
 * The site this user edits in /admin — the one they own, or one a partner
 * invited them to.
 *
 * Order matters. A partner who opens /admin before accepting their invite
 * gets an empty draft auto-created for them; once they accept, the shared
 * site has to win or they'd keep landing on that stray draft. Conversely a
 * user who has really built their own site should never be bumped off it,
 * hence the "untouched draft" test rather than a blanket preference.
 *
 * Falls back to owner-only resolution if site_collaborators is missing, so
 * the app keeps working before the collaboration migration is run.
 */
export async function resolveAdminSite(
  userId: string,
): Promise<Tables<"wedding_sites">> {
  const supabase = await createSupabaseServerClient();

  const { data: owned } = await supabase
    .from("wedding_sites")
    .select("*")
    .eq("owner_id", userId)
    .maybeSingle();
  if (owned && !isUntouchedDraft(owned)) return owned;

  const { data: membership, error: collabErr } = await supabase
    .from("site_collaborators")
    .select("site_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (!collabErr && membership) {
    const { data: shared } = await supabase
      .from("wedding_sites")
      .select("*")
      .eq("id", membership.site_id)
      .maybeSingle();
    if (shared) return shared;
  }

  if (owned) return owned;

  const tempSlug = `draft-${userId.slice(0, 8)}`;
  const { data: created, error } = await supabase
    .from("wedding_sites")
    .insert({ owner_id: userId, slug: tempSlug })
    .select("*")
    .single();
  if (created) return created;

  // 23505 = unique_violation. Two parallel calls (e.g. two admin tabs) both
  // SELECT null, both INSERT, and the loser re-reads the winner's row.
  if (error && (error.code === "23505" || /duplicate key/i.test(error.message))) {
    const { data: winnerRow, error: reselectErr } = await supabase
      .from("wedding_sites")
      .select("*")
      .eq("owner_id", userId)
      .maybeSingle();
    if (winnerRow) return winnerRow;
    if (reselectErr) throw reselectErr;
  }

  if (error) throw error;
  throw new Error("resolveAdminSite: unreachable — no row, no error");
}

/**
 * Service-role check — bypasses RLS so we can see ALL slugs (drafts +
 * published). Compares against the *site* rather than its owner, so a
 * collaborator editing a partner's site doesn't get told their own slug is
 * taken. Server-side only.
 */
export async function isSlugAvailable(
  slug: string,
  excludeSiteId: string,
): Promise<boolean> {
  const admin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data } = await admin
    .from("wedding_sites")
    .select("id")
    .eq("slug", slug)
    .maybeSingle<{ id: string }>();
  if (!data) return true;
  return data.id === excludeSiteId;
}
