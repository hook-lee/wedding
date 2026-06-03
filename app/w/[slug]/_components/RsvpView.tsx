"use client";
import { useState } from "react";
import { postRsvp } from "../_actions/rsvp";

export function RsvpView({ siteId }: { siteId: string }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handle(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await postRsvp(siteId, formData);
    setPending(false);
    if (result.error) setError(result.error);
    else setDone(true);
  }

  if (done)
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-lg">참석 알려주셔서 감사합니다 💛</p>
        <p className="text-sm text-secondary">결혼식에서 만나요</p>
      </div>
    );

  return (
    <form
      action={handle}
      className="bg-surface border border-border rounded-md p-4 space-y-3 shadow-card"
    >
      <p className="text-sm text-secondary">뒤풀이 참석 여부를 알려주세요</p>
      <input
        name="name"
        required
        maxLength={30}
        placeholder="이름"
        className="w-full p-2 rounded-sm border border-border bg-bg text-sm"
      />
      <input
        name="phone"
        placeholder="연락처 (선택)"
        className="w-full p-2 rounded-sm border border-border bg-bg text-sm"
      />

      <div className="flex gap-3">
        <label className="flex-1 flex items-center gap-2 p-2 bg-bg rounded-sm cursor-pointer">
          <input type="radio" name="attending" value="yes" required /> 참석
        </label>
        <label className="flex-1 flex items-center gap-2 p-2 bg-bg rounded-sm cursor-pointer">
          <input type="radio" name="attending" value="no" required /> 불참
        </label>
      </div>

      <label className="block">
        <span className="text-xs text-secondary">인원수</span>
        <input
          name="party_size"
          type="number"
          min={1}
          max={20}
          defaultValue={1}
          className="w-full p-2 rounded-sm border border-border bg-bg text-sm"
        />
      </label>

      <textarea
        name="message"
        maxLength={200}
        placeholder="메시지 (선택)"
        className="w-full p-2 rounded-sm border border-border bg-bg text-sm h-16"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        disabled={pending}
        className="w-full p-2 bg-ink text-bg rounded-pill text-sm"
      >
        {pending ? "보내는 중..." : "응답 보내기"}
      </button>
    </form>
  );
}
