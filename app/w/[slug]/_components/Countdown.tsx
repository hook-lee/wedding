"use client";
import { useEffect, useState } from "react";

type Diff = { days: number; hours: number; minutes: number; seconds: number };

function compute(targetIso: string): Diff {
  const total = Math.max(0, new Date(targetIso).getTime() - Date.now());
  const days = Math.floor(total / 86_400_000);
  const hours = Math.floor((total % 86_400_000) / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1_000);
  return { days, hours, minutes, seconds };
}

export function Countdown({ targetIso }: { targetIso: string }) {
  // Start as null to avoid SSR/client time mismatch (hydration safe).
  const [diff, setDiff] = useState<Diff | null>(null);

  useEffect(() => {
    setDiff(compute(targetIso));
    const id = setInterval(() => setDiff(compute(targetIso)), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  if (!diff) {
    // Empty skeleton matching final dimensions to avoid layout shift
    return <div aria-hidden className="grid grid-cols-4 gap-2 max-w-xs mx-auto h-16" />;
  }

  if (diff.days === 0 && diff.hours === 0 && diff.minutes === 0 && diff.seconds === 0) {
    return (
      <p className="text-center text-lg font-semibold py-3 animate-pulse">
        💍 결혼식 당일입니다
      </p>
    );
  }

  const cells = [
    { value: diff.days, label: "DAYS" },
    { value: diff.hours, label: "HOURS" },
    { value: diff.minutes, label: "MIN" },
    { value: diff.seconds, label: "SEC" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
      {cells.map(({ value, label }) => (
        <div
          key={label}
          className="bg-surface border border-border rounded-md p-2 text-center shadow-card"
        >
          <div className="text-xl font-semibold tabular-nums">
            {String(value).padStart(2, "0")}
          </div>
          <div className="text-[9px] text-muted tracking-widest mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}
