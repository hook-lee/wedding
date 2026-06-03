type Item = { date: string; title: string; body: string };

export function StoryTab({ items }: { items: Item[] }) {
  if (!items.length)
    return <p className="text-center text-muted py-8">아직 스토리가 없습니다.</p>;
  return (
    <ol className="relative max-w-md mx-auto py-4">
      {items.map((it, i) => (
        <li key={i} className="grid grid-cols-[16px_1fr] gap-3 relative pb-6">
          <div className="flex flex-col items-center">
            <span className="w-2 h-2 rounded-pill bg-ink mt-1.5" />
            {i < items.length - 1 && <span className="flex-1 w-px bg-border mt-1" />}
          </div>
          <div>
            <p className="text-xs text-muted tracking-widest">{it.date}</p>
            <h3 className="text-sm font-semibold mt-1">{it.title}</h3>
            {it.body && (
              <p className="text-sm text-secondary mt-1 whitespace-pre-line">{it.body}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
