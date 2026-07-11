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
import { TAB_LABELS, type TabKey } from "@/app/w/[slug]/_lib/tabs";

type IconName = React.ComponentProps<typeof Icon>["name"];

function Tile({ id }: { id: TabKey }) {
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

export function TabOrderSection({ order }: { order: TabKey[] }) {
  const [list, setList] = useState<TabKey[]>(order);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    hiddenRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [list]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = list.indexOf(active.id as TabKey);
    const newIndex = list.indexOf(over.id as TabKey);
    if (oldIndex < 0 || newIndex < 0) return;
    setList((prev) => arrayMove(prev, oldIndex, newIndex));
  }

  return (
    <Card>
      <CardHeader
        title="하단 탭바 순서"
        hint="드래그해서 청첩장 화면 맨 아래 탭바의 왼쪽부터 순서를 정할 수 있어요. 꺼둔 섹션(스토리·사진첩·일촌평)의 탭은 자동으로 숨겨져요."
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={list} strategy={horizontalListSortingStrategy}>
          <div className="flex gap-2 flex-wrap">
            {list.map((key) => (
              <Tile key={key} id={key} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <input ref={hiddenRef} type="hidden" name="tab_order_json" value={JSON.stringify(list)} readOnly />
    </Card>
  );
}
