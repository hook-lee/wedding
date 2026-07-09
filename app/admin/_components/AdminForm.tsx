"use client";
import { useActionState, useRef } from "react";
import { saveAdminForm, type SaveResult } from "../actions";
import { Button } from "@/app/_ui/Button";

export function AdminForm({
  children,
  onDraftChange,
}: {
  children: React.ReactNode;
  /**
   * Fired (debounced) whenever any field in the form changes, with a live
   * FormData snapshot — purely for the read-only preview pane. Optional:
   * omitting it changes nothing about save behavior.
   */
  onDraftChange?: (formData: FormData) => void;
}) {
  const [state, formAction, pending] = useActionState<SaveResult | null, FormData>(
    saveAdminForm,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleLiveChange() {
    if (!onDraftChange || !formRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const form = formRef.current;
    debounceRef.current = setTimeout(() => {
      onDraftChange(new FormData(form));
    }, 250);
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      onInput={handleLiveChange}
      onChange={handleLiveChange}
      className="space-y-6"
    >
      {children}

      <div className="sticky bottom-3 z-20 space-y-2">
        {state?.error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3 text-center">
            ⚠️ {state.error}
          </p>
        )}
        {state?.ok && !pending && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3 text-center">
            ✓ 저장됨
          </p>
        )}
        <Button
          type="submit"
          disabled={pending}
          variant="primary"
          className="w-full"
        >
          {pending ? "저장 중..." : "내 청첩장 저장"}
        </Button>
      </div>
    </form>
  );
}
