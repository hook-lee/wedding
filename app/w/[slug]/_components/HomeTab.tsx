import { ParentsLine } from "./ParentsLine";
import { daysUntil } from "@/lib/date/dday";
import type { Tables } from "@/lib/supabase/types";
import type { ParentsBlock } from "@/lib/parents/types";

export function HomeTab({ site }: { site: Tables<"wedding_sites"> }) {
  const dday = site.wedding_at ? daysUntil(site.wedding_at) : null;
  const parents = (site.parents as unknown as ParentsBlock) ?? {};
  return (
    <div className="text-center space-y-4 pt-4">
      {dday !== null && dday >= 0 && (
        <span className="inline-block bg-ink text-bg px-3 py-1 rounded-pill text-xs tracking-widest">
          D - {dday}
        </span>
      )}
      {site.main_photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={site.main_photo_url}
          alt=""
          className="w-full max-w-xs mx-auto aspect-[4/5] object-cover rounded-sm"
        />
      )}
      <h1 className="text-xl font-medium">
        {site.groom_name}
        {site.name_joiner}
        {site.bride_name}
      </h1>
      {site.greeting && (
        <p className="text-sm text-secondary whitespace-pre-line max-w-xs mx-auto leading-relaxed">
          {site.greeting}
        </p>
      )}
      <div className="space-y-2 pt-4 border-t border-border max-w-xs mx-auto">
        <ParentsLine
          father={parents.groom_father}
          mother={parents.groom_mother}
          childLabel="장남"
          childName={site.groom_name}
        />
        <ParentsLine
          father={parents.bride_father}
          mother={parents.bride_mother}
          childLabel="장녀"
          childName={site.bride_name}
        />
      </div>
    </div>
  );
}
