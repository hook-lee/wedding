import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/supabase/types";

/**
 * Get the wedding_sites row for the owner, or create one if missing.
 *
 * Race-safe: two parallel calls (e.g. two admin tabs) both SELECT null at the
 * same time, both INSERT, the second hits the UNIQUE(owner_id) constraint
 * (Postgres error code 23505). On that path we re-SELECT and return the row
 * the first call inserted.
 */
export async function getOrCreateSiteForOwner(
  ownerId: string,
): Promise<Tables<"wedding_sites">> {
  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("wedding_sites")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (existing) return existing;

  const tempSlug = `draft-${ownerId.slice(0, 8)}`;
  const { data: created, error } = await supabase
    .from("wedding_sites")
    .insert({ owner_id: ownerId, slug: tempSlug })
    .select("*")
    .single();
  if (created) return created;

  // 23505 = unique_violation. Indicates a concurrent INSERT won the race.
  if (error && (error.code === "23505" || /duplicate key/i.test(error.message))) {
    const { data: winnerRow, error: reselectErr } = await supabase
      .from("wedding_sites")
      .select("*")
      .eq("owner_id", ownerId)
      .maybeSingle();
    if (winnerRow) return winnerRow;
    if (reselectErr) throw reselectErr;
  }

  if (error) throw error;
  throw new Error("getOrCreateSiteForOwner: unreachable — no row, no error");
}

/** Service-role check — bypasses RLS so we can see ALL slugs (drafts + published).
 *  Only use server-side. */
export async function isSlugAvailable(
  slug: string,
  excludeOwnerId: string,
): Promise<boolean> {
  const admin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data } = await admin
    .from("wedding_sites")
    .select("owner_id")
    .eq("slug", slug)
    .maybeSingle<{ owner_id: string }>();
  if (!data) return true;
  return data.owner_id === excludeOwnerId;
}
