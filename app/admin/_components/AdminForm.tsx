"use client";
import { useActionState } from "react";
import { saveAdminForm, type SaveResult } from "../actions";
import { Button } from "@/app/_ui/Button";

export function AdminForm({ children }: { children: React.ReactNode }) {
  const [state, formAction, pending] = useActionState<SaveResult | null, FormData>(
    saveAdminForm,
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
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
