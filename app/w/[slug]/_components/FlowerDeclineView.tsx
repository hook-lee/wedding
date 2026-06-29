export function FlowerDeclineView({ note }: { note: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-5 sm:p-6 shadow-card text-center space-y-2">
      <p className="text-xs text-muted tracking-[0.3em]">FLOWER</p>
      <p className="text-sm text-ink leading-relaxed">{note}</p>
    </div>
  );
}
