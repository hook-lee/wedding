"use client";
import { useState } from "react";
import { Card, CardHeader } from "@/app/_ui/Card";
import { Input } from "@/app/_ui/Input";
import { Textarea } from "@/app/_ui/Textarea";
import { Button } from "@/app/_ui/Button";
import type { InfoItem } from "@/lib/extras/types";

export function InfoItemsSection({ items }: { items: InfoItem[] }) {
  const [list, setList] = useState<InfoItem[]>(
    items.length ? items : [],
  );

  function update(i: number, key: keyof InfoItem, val: string) {
    setList((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)),
    );
  }

  function add() {
    setList((prev) => [...prev, { title: "", body: "" }]);
  }

  function remove(i: number) {
    setList((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <Card>
      <CardHeader
        title="예식 정보 및 안내사항"
        hint="포토부스·식사안내·기타 안내 등 자유롭게 추가하세요. 비워두면 청첩장에 안 보여요."
      />

      {list.length === 0 && (
        <p className="text-xs text-muted">아직 추가된 안내가 없어요.</p>
      )}

      {list.map((it, i) => (
        <div
          key={i}
          className="bg-bg border border-border rounded-md p-3 space-y-2"
        >
          <div className="grid grid-cols-[1fr_auto] gap-2 items-start">
            <Input
              value={it.title}
              onChange={(e) => update(i, "title", e.target.value)}
              placeholder="제목 (예: 포토부스)"
              aria-label="제목"
              className="text-sm"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-red-600 text-sm self-start px-2 min-h-[44px]"
              aria-label="항목 삭제"
            >
              ✕
            </button>
          </div>
          <Textarea
            value={it.body}
            onChange={(e) => update(i, "body", e.target.value)}
            placeholder="안내 본문"
            rows={3}
            aria-label="본문"
            className="text-sm"
          />
        </div>
      ))}

      <Button type="button" onClick={add} variant="ghost">
        + 항목 추가
      </Button>
      <input type="hidden" name="info_items_json" value={JSON.stringify(list)} />
    </Card>
  );
}
