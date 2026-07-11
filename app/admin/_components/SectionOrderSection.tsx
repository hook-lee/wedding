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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader } from "@/app/_ui/Card";
import { Icon } from "@/app/w/[slug]/_components/Icon";
import type { SectionKey } from "@/lib/extras/types";

type IconName = React.ComponentProps<typeof Icon>["name"];

const LABELS: Record<SectionKey, { label: string; icon: IconName }> = {
  calendar: { label: "캘린더", icon: "calendar" },
  story: { label: "우리 스토리", icon: "book" },
  gallery: { label: "사진첩", icon: "image" },
  guestbook: { label: "일촌평", icon: "chat" },
  info: { label: "오시는길", icon: "pin" },
  extras_info: { label: "예식 정보 및 안내사항", icon: "clipboard" },
  rsvp: { label: "참석 의사 (RSVP)", icon: "clipboard" },
  account: { label: "마음 전하기", icon: "heart" },
  profile: { label: "신랑·신부 프로필", icon: "user" },
};

function Row({ id }: { id: SectionKey }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-bg border border-border rounded-md select-none"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-muted hover:text-ink cursor-grab active:cursor-grabbing p-1 -m-1 touch-none"
        aria-label={`${LABELS[id].label} 순서 변경 — 드래그하세요`}
      >
        <Icon name="grip" className="w-4 h-4" />
      </button>
      <Icon name={LABELS[id].icon} className="w-4 h-4 text-secondary flex-shrink-0" />
      <span className="text-sm text-ink">{LABELS[id].label}</span>
    </div>
  );
}

export function SectionOrderSection({ order }: { order: SectionKey[] }) {
  const [list, setList] = useState<SectionKey[]>(order);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);

  // Dragging updates React state only — no native <input> event fires from
  // that, so the admin's live-preview listener (which watches for real
  // input/change events bubbling from the form) wouldn't otherwise notice.
  // Dispatch one manually after each reorder so the preview stays live.
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
    const oldIndex = list.indexOf(active.id as SectionKey);
    const newIndex = list.indexOf(over.id as SectionKey);
    if (oldIndex < 0 || newIndex < 0) return;
    setList((prev) => arrayMove(prev, oldIndex, newIndex));
  }

  return (
    <Card>
      <CardHeader
        title="섹션 순서"
        hint="드래그해서 청첩장에 표시되는 순서를 바꿀 수 있어요. 대문(이름·날짜·인사말·부모님)은 항상 맨 위에 고정돼요."
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={list} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {list.map((key) => (
              <Row key={key} id={key} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <input ref={hiddenRef} type="hidden" name="section_order_json" value={JSON.stringify(list)} readOnly />
    </Card>
  );
}
