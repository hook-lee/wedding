"use client";
import { useEffect, useRef, useState } from "react";
import { Card, CardHeader } from "@/app/_ui/Card";
import { Input } from "@/app/_ui/Input";
import { Textarea } from "@/app/_ui/Textarea";

type Profile = { mbti?: string; intro?: string; photo_url?: string };

function PhotoField({
  side,
  label,
  photoUrl,
  onChange,
}: {
  side: "groom" | "bride";
  label: string;
  photoUrl: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "profile");
      const r = await fetch("/api/admin/upload-photo", { method: "POST", body: fd });
      if (!r.ok) {
        const text = await r.text().catch(() => "");
        alert(`업로드 실패: ${text || r.status}`);
        return;
      }
      const json = (await r.json()) as { url?: string };
      if (json.url) onChange(json.url);
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      {photoUrl && (
        <div className="relative w-16 h-16 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl} alt="" className="w-full h-full object-cover rounded-md" />
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={busy}
            className="absolute -top-1.5 -right-1.5 bg-ink text-bg text-[10px] px-1.5 py-0.5 rounded-pill"
            aria-label={`${label} 사진 삭제`}
          >
            X
          </button>
        </div>
      )}
      <label className="cursor-pointer text-xs inline-flex">
        <span className="inline-flex items-center min-h-[44px] px-4 border border-border bg-surface rounded-md text-ink">
          {busy ? "업로드 중..." : photoUrl ? "사진 변경" : "+ 사진 추가 (선택)"}
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
          }}
        />
      </label>
    </div>
  );
}

function Block({
  side,
  label,
  p,
  photoUrl,
  onPhotoChange,
}: {
  side: "groom" | "bride";
  label: string;
  p: Profile;
  photoUrl: string;
  onPhotoChange: (url: string) => void;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-ink">{label}</h3>
      <PhotoField side={side} label={label} photoUrl={photoUrl} onChange={onPhotoChange} />
      <Input
        name={`${side}_mbti`}
        defaultValue={p.mbti ?? ""}
        placeholder="MBTI"
        aria-label={`${label} MBTI`}
      />
      <Textarea
        name={`${side}_intro`}
        rows={3}
        defaultValue={p.intro ?? ""}
        placeholder="간단한 소개"
        aria-label={`${label} 소개`}
      />
    </div>
  );
}

export function ProfileSection({
  groom,
  bride,
}: {
  groom: Profile;
  bride: Profile;
}) {
  const [groomPhoto, setGroomPhoto] = useState(groom.photo_url ?? "");
  const [bridePhoto, setBridePhoto] = useState(bride.photo_url ?? "");
  const groomRef = useRef<HTMLInputElement>(null);
  const brideRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);

  // Photo upload/remove only changes React state — no native <input> event
  // fires from that, so the admin's live-preview listener (which watches
  // for real input/change events bubbling from the form) wouldn't otherwise
  // notice. Same fix as StorySection/SponsorSection.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    groomRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
    brideRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [groomPhoto, bridePhoto]);

  return (
    <Card>
      <CardHeader title="신랑·신부 프로필" />
      <div className="grid md:grid-cols-2 gap-4">
        <Block side="groom" label="신랑" p={groom} photoUrl={groomPhoto} onPhotoChange={setGroomPhoto} />
        <Block side="bride" label="신부" p={bride} photoUrl={bridePhoto} onPhotoChange={setBridePhoto} />
      </div>
      <input ref={groomRef} type="hidden" name="groom_photo_url" value={groomPhoto} readOnly />
      <input ref={brideRef} type="hidden" name="bride_photo_url" value={bridePhoto} readOnly />
    </Card>
  );
}
