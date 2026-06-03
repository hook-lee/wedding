"use client";
import { useEffect, useState } from "react";

export function SlugField({ defaultValue }: { defaultValue: string }) {
  const [slug, setSlug] = useState(defaultValue);
  const [status, setStatus] = useState<"idle" | "checking" | "ok" | "bad">("idle");
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || slug === defaultValue) {
      setStatus("idle");
      return;
    }
    setStatus("checking");
    const t = setTimeout(async () => {
      const r = await fetch(`/api/slug-check?slug=${encodeURIComponent(slug)}`);
      const json = await r.json();
      if (json.available) {
        setStatus("ok");
        setReason(null);
      } else {
        setStatus("bad");
        setReason(json.reason);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [slug, defaultValue]);

  return (
    <label className="block">
      <span className="text-sm text-secondary">슬러그 (URL의 마지막 부분)</span>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-muted text-sm">/w/</span>
        <input
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          pattern="[a-z0-9][a-z0-9-]{1,48}[a-z0-9]"
          className="flex-1 p-2 rounded-sm border border-border bg-surface"
        />
      </div>
      {status === "checking" && <p className="text-xs text-muted mt-1">확인 중…</p>}
      {status === "ok" && <p className="text-xs text-green-700 mt-1">사용 가능 ✓</p>}
      {status === "bad" && <p className="text-xs text-red-600 mt-1">{reason}</p>}
    </label>
  );
}
