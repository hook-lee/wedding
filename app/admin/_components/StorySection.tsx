"use client";
import { useState } from "react";

type StoryItem = { date: string; title: string; body: string };

export function StorySection({ items }: { items: StoryItem[] }) {
  const [list, setList] = useState<StoryItem[]>(
    items.length ? items : [{ date: "", title: "", body: "" }]
  );

  function update(i: number, key: keyof StoryItem, val: string) {
    setList((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, [key]: val } : it))
    );
  }
  function add() {
    setList((prev) => [...prev, { date: "", title: "", body: "" }]);
  }
  function remove(i: number) {
    setList((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">우리 스토리</h2>
      {list.map((it, i) => (
        <div key={i} className="grid grid-cols-[100px_1fr_auto] gap-2">
          <input
            value={it.date}
            onChange={(e) => update(i, "date", e.target.value)}
            placeholder="2023.05"
            className="p-2 rounded-sm border border-border bg-surface"
          />
          <div className="space-y-1">
            <input
              value={it.title}
              onChange={(e) => update(i, "title", e.target.value)}
              placeholder="제목"
              className="w-full p-2 rounded-sm border border-border bg-surface"
            />
            <textarea
              value={it.body}
              onChange={(e) => update(i, "body", e.target.value)}
              placeholder="내용"
              rows={2}
              className="w-full p-2 rounded-sm border border-border bg-surface"
            />
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-red-600 text-sm"
          >
            X
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-sm underline">
        + 항목 추가
      </button>
      <input
        type="hidden"
        name="story_items_json"
        value={JSON.stringify(list)}
      />
    </section>
  );
}
