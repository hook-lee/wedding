import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Tables } from "@/lib/supabase/types";

export async function loadSite(slug: string): Promise<Tables<"wedding_sites">> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("wedding_sites")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (!data) notFound();
  return data;
}
