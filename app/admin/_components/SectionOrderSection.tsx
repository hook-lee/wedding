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
  guestbook: { label: "방명록", icon: "chat" },
  info: { label: "오시는길", icon: "pin" },
  extras_info: { label: "예식 정보 및 안내사항", icon: "clipboard" },
  rsvp: { label: "참석 의사 (RSVP)", icon: "clipboard" },
  account: { label: "마음 전하기", icon: "heart" },
  profile: { label: "신랑·신부 프로필", icon: "user" },
  sponsor: { label: "스폰서", icon: "award" },
};

// Sections gated by a separate master switch ("표시할 섹션" checkboxes in
// 디자인·섹션·공개). Toggling 노출/숨김 here does nothing until that master
// switch is also on — flag it inline so this isn't confusing twice in a row.
const MASTER_GATED: SectionKey[] = [
  "story",
  "gallery",
  "guestbook",
  "rsvp",
  "account",
  "profile",
  "sponsor",
];

function Row({
  id,
  visible,
  masterOff,
  onToggleVisible,
}: {
  id: SectionKey;
  visible: boolean;
  masterOff: boolean;
  onToggleVisible: () => void;
}) {
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
      className={`border rounded-md select-none transition-colors ${
        visible ? "bg-bg border-border" : "bg-bg/40 border-border/60"
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-muted hover:text-ink cursor-grab active:cursor-grabbing p-1 -m-1 touch-none"
          aria-label={`${LABELS[id].label} 순서 변경 — 드래그하세요`}
        >
          <Icon name="grip" className="w-4 h-4" />
        </button>
        <Icon
          name={LABELS[id].icon}
          className={`w-4 h-4 flex-shrink-0 ${visible ? "text-secondary" : "text-muted"}`}
        />
        <span className={`text-sm flex-1 ${visible ? "text-ink" : "text-muted"}`}>
          {LABELS[id].label}
        </span>
        <button
          type="button"
          onClick={onToggleVisible}
          className={`inline-flex items-center gap-1 text-xs px-2 py-1.5 rounded-md min-h-[32px] ${
            visible ? "text-secondary hover:text-ink" : "text-muted hover:text-ink"
          }`}
          aria-pressed={visible}
          aria-label={`${LABELS[id].label} 홈 화면 노출 ${visible ? "끄기" : "켜기"}`}
        >
          <Icon name={visible ? "eye" : "eyeOff"} className="w-4 h-4" />
          {visible ? "노출" : "숨김"}
        </button>
      </div>
      {masterOff && (
        <p className="text-[11px] text-accent px-3 pb-2 -mt-1">
          ⚠ &apos;표시할 섹션&apos;에서 이 항목이 꺼져 있어요 — 아래에서 먼저 켜야 실제로 보여요.
        </p>
      )}
    </div>
  );
}

export function SectionOrderSection({
  order,
  visible,
  sectionsEnabled,
}: {
  order: SectionKey[];
  visible: Record<SectionKey, boolean>;
  sectionsEnabled: Record<string, boolean>;
}) {
  const [list, setList] = useState<SectionKey[]>(order);
  const [visMap, setVisMap] = useState<Record<SectionKey, boolean>>(visible);
  const orderRef = useRef<HTMLInputElement>(null);
  const visRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);

  // Dragging / toggling updates React state only — no native <input> event
  // fires from that, so the admin's live-preview listener (which watches for
  // real input/change events bubbling from the form) wouldn't otherwise
  // notice. Dispatch one manually after each change so the preview stays live.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    orderRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
    visRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [list, visMap]);

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
        hint="드래그해서 청첩장에 표시되는 순서를 바꿀 수 있어요. 대문(이름·날짜·인사말·부모님)은 항상 맨 위에 고정돼요. '숨김'으로 두면 홈 화면 스크롤에는 안 보이고, 하단 탭바나 더보기로 들어갔을 때만 보여요."
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={list} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {list.map((key) => (
              <Row
                key={key}
                id={key}
                visible={visMap[key] ?? true}
                masterOff={MASTER_GATED.includes(key) && !sectionsEnabled[key]}
                onToggleVisible={() =>
                  setVisMap((prev) => ({ ...prev, [key]: !(prev[key] ?? true) }))
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <input
        ref={orderRef}
        type="hidden"
        name="section_order_json"
        value={JSON.stringify(list)}
        readOnly
      />
      <input
        ref={visRef}
        type="hidden"
        name="section_home_visible_json"
        value={JSON.stringify(visMap)}
        readOnly
      />
    </Card>
  );
}
