"use client";
import { HomeTab } from "@/app/w/[slug]/_components/HomeTab";
import type { Tables } from "@/lib/supabase/types";

/**
 * Read-only render of the real public HomeTab, fed a draft (possibly
 * unsaved) site row. Deliberately skips TabShell/TabBar — those contain
 * next/link navigation that would otherwise carry the admin browser tab
 * away to the public site instead of just previewing it.
 */
export function PreviewPane({ draft }: { draft: Tables<"wedding_sites"> }) {
  return (
    <div
      className="bg-bg overflow-y-auto h-full"
      data-theme={draft.theme}
      style={{ colorScheme: "light" }}
    >
      <div className="px-4 sm:px-5 pb-10">
        <HomeTab site={draft} initialGuestbook={[]} />
      </div>
    </div>
  );
}
