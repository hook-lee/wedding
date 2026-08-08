import { loadSite } from "./_lib/load-site";
import { readExtras, resolveFontFamily } from "@/lib/extras/types";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await loadSite(slug);
  return (
    <div
      data-theme={site.theme}
      data-font={resolveFontFamily(readExtras(site.extras))}
      className="min-h-screen bg-bg text-ink"
    >
      {children}
    </div>
  );
}
