type Item = { date: string; title: string; body: string; photo_url?: string };

export function StoryTab({ items }: { items: Item[] }) {
  if (!items.length)
    return <p className="text-center text-muted py-8">아직 스토리가 없습니다.</p>;
  return (
    <ol className="relative max-w-md mx-auto py-4">
      {items.map((it, i) => (
        <li key={i} className="grid grid-cols-[16px_1fr] gap-3 relative pb-8">
          <div className="flex flex-col items-center">
            <span className="w-2 h-2 rounded-pill bg-ink mt-1.5" />
            {i < items.length - 1 && <span className="flex-1 w-px bg-border mt-1" />}
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted tracking-widest">{it.date}</p>
            <h3 className="text-sm font-semibold">{it.title}</h3>
            {it.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={it.photo_url}
                alt=""
                className="w-full max-w-xs aspect-[4/3] object-cover rounded-md shadow-card"
              />
            )}
            {it.body && (
              <p className="text-sm text-secondary whitespace-pre-line leading-relaxed">
                {it.body}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
