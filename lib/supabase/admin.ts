import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Service-role client. Bypasses RLS entirely, so it may only be used from
 * server code that does its own authorization checks first.
 *
 * It exists for one case: guests uploading photos to the day-of photo share.
 * Those uploads are genuinely anonymous — there's no session to attach an
 * RLS policy to — so the API route validates everything itself (site is
 * published, sharing is on and open, file type/size, per-site cap) and only
 * then writes with this client.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL 환경변수가 필요합니다.",
    );
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
