import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Tables } from "@/lib/supabase/types";

/**
 * Load a wedding site by slug.
 * RLS rules:
 *  - Anonymous visitors only see rows with `published = true`
 *  - The owner sees their own row regardless of `published`
 * So we deliberately omit the `.eq("published", true)` filter — RLS handles it.
 * This lets the owner hit `/w/{slug}` in draft mode as a live preview.
 */
export async function loadSite(slug: string): Promise<Tables<"wedding_sites">> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("wedding_sites")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) notFound();
  return data;
}
