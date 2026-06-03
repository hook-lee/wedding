import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/supabase/types";

export async function getOrCreateSiteForOwner(ownerId: string): Promise<Tables<"wedding_sites">> {
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
  if (error) throw error;
  return created;
}

/** Service-role check — bypasses RLS so we can see ALL slugs (drafts + published).
 *  Only use server-side. */
export async function isSlugAvailable(slug: string, excludeOwnerId: string): Promise<boolean> {
  const admin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { data } = await admin
    .from("wedding_sites")
    .select("owner_id")
    .eq("slug", slug)
    .maybeSingle<{ owner_id: string }>();
  if (!data) return true;
  return data.owner_id === excludeOwnerId;
}
