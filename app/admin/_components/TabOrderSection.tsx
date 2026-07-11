"use client";
import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader } from "@/app/_ui/Card";
import { Icon } from "@/app/w/[slug]/_components/Icon";
import { MAX_PRIMARY_TABS, PRIMARY_KEYS, TAB_LABELS, type PrimaryKey } from "@/app/w/[slug]/_lib/tabs";

type IconName = React.ComponentProps<typeof Icon>["name"];

function Tile({ id }: { id: PrimaryKey }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none",
  };
  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex flex-col items-center gap-1 p-3 bg-bg border border-border rounded-md cursor-grab active:cursor-grabbing select-none min-w-[76px]"
    >
      <Icon name={TAB_LABELS[id].iconName as IconName} className="w-5 h-5 text-secondary" />
      <span className="text-xs text-ink">{TAB_LABELS[id].label}</span>
    </button>
  );
}

export function TabOrderSection({ initial }: { initial: PrimaryKey[] }) {
  const [selected, setSelected] = useState<PrimaryKey[]>(initial);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    hiddenRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [selected]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function toggle(key: PrimaryKey) {
    setSelected((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= MAX_PRIMARY_TABS) {
        alert(
          `하단 탭바에는 홈·더보기를 빼고 최대 ${MAX_PRIMARY_TABS}개까지만 추가할 수 있어요. 다른 항목을 먼저 빼주세요.`,
        );
        return prev;
      }
      return [...prev, key];
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = selected.indexOf(active.id as PrimaryKey);
    const newIndex = selected.indexOf(over.id as PrimaryKey);
    if (oldIndex < 0 || newIndex < 0) return;
    setSelected((prev) => arrayMove(prev, oldIndex, newIndex));
  }

  return (
    <Card>
      <CardHeader
        title="하단 탭바 구성"
        hint={`홈은 항상 첫 칸, 더보기는 선택 안 한 항목이 있을 때 자동으로 마지막 칸에 추가돼요. 그 사이에 넣을 항목을 최대 ${MAX_PRIMARY_TABS}개 골라보세요.`}
      />

      <div className="flex flex-wrap gap-2">
        {PRIMARY_KEYS.map((key) => {
          const on = selected.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              className={`inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-pill border text-sm transition-colors ${
                on
                  ? "bg-ink text-bg border-ink"
                  : "bg-bg text-ink border-border hover:bg-surface"
              }`}
            >
              <Icon name={TAB_LABELS[key].iconName as IconName} className="w-4 h-4" />
              {TAB_LABELS[key].label}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted">탭바 순서 (왼쪽부터 · 드래그로 변경)</p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={selected} strategy={horizontalListSortingStrategy}>
              <div className="flex gap-2 flex-wrap">
                <div className="flex flex-col items-center gap-1 p-3 bg-surface border border-border rounded-md min-w-[76px] opacity-60">
                  <Icon name="home" className="w-5 h-5 text-secondary" />
                  <span className="text-xs text-ink">홈</span>
                </div>
                {selected.map((key) => (
                  <Tile key={key} id={key} />
                ))}
                <div className="flex flex-col items-center gap-1 p-3 bg-surface border border-border rounded-md min-w-[76px] opacity-60">
                  <Icon name="more" className="w-5 h-5 text-secondary" />
                  <span className="text-xs text-ink">더보기</span>
                </div>
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <p className="text-xs text-muted">
        선택하지 않은 항목은 &apos;더보기&apos; 탭 안에서 볼 수 있어요.
      </p>

      <input
        ref={hiddenRef}
        type="hidden"
        name="primary_tabs_json"
        value={JSON.stringify(selected)}
        readOnly
      />
    </Card>
  );
}
