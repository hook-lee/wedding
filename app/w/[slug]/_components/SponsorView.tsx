import { sponsorTitleLabel, type SiteExtras } from "@/lib/extras/types";

export function SponsorView({ extras }: { extras: SiteExtras }) {
  const logos = extras.sponsor_logos ?? [];
  const slogan = (extras.sponsor_slogan ?? "").trim();

  return (
    <div className="text-center space-y-4">
      <p className="text-xs text-muted tracking-[0.3em] uppercase">
        {sponsorTitleLabel(extras)}
      </p>

      {logos.length === 0 ? (
        <p className="text-sm text-muted py-4">아직 등록된 스폰서가 없어요.</p>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-4">
          {logos.map((url, i) => (
            <div
              key={url + i}
              className="h-12 sm:h-16 flex items-center justify-center bg-surface border border-border rounded-md px-4 shadow-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="max-h-full max-w-[140px] object-contain" />
            </div>
          ))}
        </div>
      )}

      {slogan && (
        <p className="text-sm text-secondary whitespace-pre-line leading-relaxed max-w-xs mx-auto pt-1">
          {slogan}
        </p>
      )}
    </div>
  );
}
