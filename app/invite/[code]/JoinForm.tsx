"use client";
import { useActionState } from "react";
import { joinSite, type JoinResult } from "./actions";
import { Button } from "@/app/_ui/Button";

export function JoinForm({ code }: { code: string }) {
  const [state, action, pending] = useActionState<JoinResult | null>(
    joinSite.bind(null, code),
    null,
  );

  return (
    <form action={action} className="space-y-2">
      <Button type="submit" variant="primary" disabled={pending} className="w-full">
        {pending ? "참여하는 중..." : "수락하고 함께 만들기"}
      </Button>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
