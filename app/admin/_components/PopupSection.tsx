"use client";
import { useEffect, useRef, useState } from "react";
import { Card, CardHeader } from "@/app/_ui/Card";
import { Input } from "@/app/_ui/Input";
import { Select } from "@/app/_ui/Select";
import { Textarea } from "@/app/_ui/Textarea";
import {
  POPUP_LINK_TARGETS,
  type PopupAction,
  type PopupConfig,
  type PopupLinkTarget,
  type PopupTiming,
} from "@/lib/extras/types";

const TIMINGS: {
  key: PopupTiming;
  label: string;
  hint: string;
  recommended?: boolean;
}[] = [
  {
    key: "after",
    label: "'청첩장 열기'를 누른 뒤",
    hint: "하객이 들어온 다음에 떠요. 첫 화면을 가리지 않아요.",
    recommended: true,
  },
  {
    key: "before",
    label: "'청첩장 열기'를 누르기 전",
    hint: "들어오자마자 떠서 아무도 놓치지 않아요. 대신 하객이 청첩장을 보기 전에 팝업부터 닫아야 해요.",
  },
];

export function PopupSection({ popup }: { popup: Required<PopupConfig> }) {
  const [action, setAction] = useState<PopupAction>(popup.action);
  const [timing, setTiming] = useState<PopupTiming>(popup.timing);
  const [imageUrl, setImageUrl] = useState(popup.image_url);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);

  // Uploading or removing the image only changes React state, and no native
  // <input> event fires from that, so the live preview wouldn't notice.
  // Same fix as SponsorSection/StorySection.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    hiddenRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [imageUrl]);

  async function uploadImage(file: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "popup");
      const r = await fetch("/api/admin/upload-photo", { method: "POST", body: fd });
      if (!r.ok) {
        const text = await r.text().catch(() => "");
        alert(`업로드 실패: ${text || r.status}`);
        return;
      }
      const json = (await r.json()) as { url?: string };
      if (json.url) setImageUrl(json.url);
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <Card>
      <CardHeader
        title="팝업 설정"
        hint="청첩장에 들어오면 바로 뜨는 안내 팝업이에요. 주차 안내, 식사 안내 등 원하는 내용을 넣을 수 있어요. 제목·이미지·설명은 모두 선택이고, 하객은 '닫기' 또는 '오늘 하루 보지 않기'로 닫아요."
      />

      <label className="flex items-center gap-2 p-3 bg-bg rounded-md cursor-pointer min-h-[44px]">
        <input
          type="checkbox"
          name="popup_enabled"
          defaultChecked={popup.enabled}
          className="w-4 h-4"
        />
        <span className="text-sm text-ink">입장할 때 팝업 보여주기</span>
      </label>

      <div>
        <p className="text-sm text-secondary font-medium mb-1">팝업 띄우는 시점</p>
        {/* Both options stay on screen with their consequence spelled out. A
            dropdown hid whichever one wasn't selected, which made this the
            easiest setting in the form to misread. */}
        <div className="space-y-2">
          {TIMINGS.map((t) => (
            <label
              key={t.key}
              className={`flex gap-2.5 p-3 rounded-md cursor-pointer border transition-colors ${
                timing === t.key ? "border-ink bg-bg" : "border-border bg-surface"
              }`}
            >
              <input
                type="radio"
                name="popup_timing"
                value={t.key}
                checked={timing === t.key}
                onChange={() => setTiming(t.key)}
                className="w-4 h-4 mt-0.5 flex-shrink-0"
              />
              <span className="min-w-0">
                <span className="block text-sm text-ink font-medium">
                  {t.label}
                  {t.recommended && (
                    <span className="ml-1.5 text-[10px] text-muted font-normal">추천</span>
                  )}
                </span>
                <span className="block text-[11px] text-muted mt-0.5 leading-relaxed">
                  {t.hint}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-secondary font-medium mb-1">제목 (선택)</p>
        <Input name="popup_title" defaultValue={popup.title} placeholder="예) 주차 안내" />
      </div>

      <div>
        <p className="text-sm text-secondary font-medium mb-1">이미지 (선택)</p>
        {imageUrl ? (
          <div className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className="w-full max-w-[200px] rounded-md border border-border object-contain"
            />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="text-xs text-muted hover:text-ink underline underline-offset-2 min-h-[32px]"
            >
              이미지 삭제
            </button>
          </div>
        ) : (
          <label className="cursor-pointer text-xs inline-flex">
            <span className="inline-flex items-center min-h-[44px] px-4 border border-border bg-surface rounded-md text-ink">
              {busy ? "업로드 중..." : "+ 이미지 추가"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadImage(f);
              }}
            />
          </label>
        )}
        <p className="text-[11px] text-muted mt-1">
          주차장 약도처럼 글로 설명하기 어려운 건 이미지가 훨씬 잘 전달돼요.
        </p>
      </div>

      <div>
        <p className="text-sm text-secondary font-medium mb-1">영상 (선택)</p>
        <Input
          name="popup_video_url"
          defaultValue={popup.video_id ? `https://youtu.be/${popup.video_id}` : ""}
          placeholder="유튜브 주소 붙여넣기"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <p className="text-[11px] text-muted mt-1">
          영상을 넣으면 이미지 대신 영상이 나와요. 소리는 하객이 직접 눌러야 나오니
          배경음악과 겹치지 않아요.
        </p>
      </div>

      <div>
        <p className="text-sm text-secondary font-medium mb-1">설명글 (선택)</p>
        <Textarea
          name="popup_body"
          rows={4}
          defaultValue={popup.body}
          placeholder={"예) 예식장 지하주차장을 이용하실 수 있습니다.\n2시간 무료이며, 안내데스크에서 주차권을 받아주세요."}
        />
      </div>

      <div>
        <p className="text-sm text-secondary font-medium mb-1">버튼 (선택)</p>
        <Select
          name="popup_action"
          defaultValue={popup.action}
          onChange={(e) => setAction(e.target.value as PopupAction)}
        >
          <option value="none">버튼 없음</option>
          <option value="link">다른 곳으로 이동하기</option>
          <option value="rsvp">참석 의사 전달받기</option>
        </Select>

        {action === "link" && (
          <div className="mt-2 space-y-2">
            <Select name="popup_link_target" defaultValue={popup.link_target}>
              {(Object.keys(POPUP_LINK_TARGETS) as PopupLinkTarget[]).map((k) => (
                <option key={k} value={k}>
                  {POPUP_LINK_TARGETS[k].label}
                </option>
              ))}
            </Select>
            <Input
              name="popup_link_label"
              defaultValue={popup.link_label}
              placeholder="버튼 문구 (비우면 '오시는길 보기'처럼 자동)"
            />
          </div>
        )}

        <p className="text-[11px] text-muted mt-1">
          {action === "rsvp"
            ? "팝업 안에서 바로 참석 여부를 받아요. 'RSVP' 섹션이 켜져 있어야 보입니다."
            : action === "link"
              ? "버튼을 누르면 선택한 곳으로 바로 이동해요."
              : "닫기 버튼만 있는 단순한 안내 팝업이 돼요."}
        </p>
      </div>

      <input
        ref={hiddenRef}
        type="hidden"
        name="popup_image_url"
        value={imageUrl}
        readOnly
      />
    </Card>
  );
}
