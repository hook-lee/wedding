"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { Button } from "@/app/_ui/Button";

type Entry = { name: string; status: "alive" | "go" | "hyeon" };
type Profile = { mbti?: string; intro?: string; photo_url?: string };

function prefix(role: "father" | "mother", status: Entry["status"]) {
  if (status === "go") return <span className="text-deceased font-semibold">故 </span>;
  if (status === "hyeon") {
    return (
      <span className="text-deceased font-semibold">
        {role === "father" ? "顯考" : "顯妣"}{" "}
      </span>
    );
  }
  return null;
}

function ProfileModal({
  roleLabel,
  name,
  profile,
  onClose,
}: {
  roleLabel: string;
  name: string;
  profile: Profile;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${name} 프로필`}
    >
      <div
        className="bg-surface rounded-lg w-full max-w-sm shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-ink">{roleLabel} 프로필</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-ink p-1 -m-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 rounded"
            aria-label="닫기"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-2">
          {profile.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.photo_url}
              alt=""
              className="w-full aspect-square object-cover rounded-md mb-1"
            />
          )}
          <p className="text-lg font-semibold text-ink">{name}</p>
          {profile.mbti && <p className="text-sm text-accent">{profile.mbti}</p>}
          {profile.intro && (
            <p className="text-sm text-secondary whitespace-pre-line leading-relaxed pt-1">
              {profile.intro}
            </p>
          )}
        </div>

        <div className="px-5 pb-4">
          <Button type="button" variant="secondary" onClick={onClose} className="w-full">
            닫기
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ParentsLine({
  father,
  mother,
  childLabel,
  childName,
  roleLabel,
  profile,
}: {
  father?: Entry;
  mother?: Entry;
  childLabel: string;
  childName: string;
  /** "신랑" or "신부" — used as the profile popup's title. */
  roleLabel?: string;
  /** If given and non-empty, the bold name becomes tappable to open a profile popup. */
  profile?: Profile;
}) {
  const [open, setOpen] = useState(false);

  if (!father && !mother) return null;

  const hasProfile = !!(profile && (profile.mbti || profile.intro || profile.photo_url));

  return (
    <p className="text-sm text-secondary">
      {father && (
        <>
          {prefix("father", father.status)}
          {father.name}
        </>
      )}
      {father && mother && <span> · </span>}
      {mother && (
        <>
          {prefix("mother", mother.status)}
          {mother.name}
        </>
      )}
      <span> 의 {childLabel} </span>
      {hasProfile ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-ink font-semibold underline decoration-dotted decoration-muted underline-offset-4 hover:decoration-ink"
        >
          {childName}
        </button>
      ) : (
        <strong className="text-ink">{childName}</strong>
      )}
      {open && hasProfile && (
        <ProfileModal
          roleLabel={roleLabel ?? childLabel}
          name={childName}
          profile={profile!}
          onClose={() => setOpen(false)}
        />
      )}
    </p>
  );
}
