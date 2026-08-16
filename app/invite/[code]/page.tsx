import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { peekInvite } from "@/lib/db/collaborators";
import { Card, CardHeader } from "@/app/_ui/Card";
import { JoinForm } from "./JoinForm";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const invite = await peekInvite(code);

  if (!invite) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center bg-bg">
        <Card className="max-w-sm w-full space-y-3 text-center">
          <CardHeader title="초대 링크를 열 수 없어요" />
          <p className="text-sm text-secondary">
            링크가 만료됐거나 이미 사용된 것 같아요. 상대방에게 새 링크를 요청해주세요.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-[44px] px-5 bg-surface border border-border rounded-pill text-sm text-ink"
          >
            처음으로
          </Link>
        </Card>
      </main>
    );
  }

  // Not signed in yet — send them through login/signup first, then straight
  // back here so the invite isn't lost.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/invite/${code}`)}`);
  }

  const names = [invite.groomName, invite.brideName].filter(Boolean).join(" · ");

  return (
    <main className="min-h-screen p-4 flex items-center justify-center bg-bg">
      <Card className="max-w-sm w-full space-y-4">
        <CardHeader
          title="청첩장 함께 만들기"
          hint={names ? `${names} 님의 청첩장이에요.` : undefined}
        />
        <p className="text-sm text-secondary leading-relaxed">
          수락하면 이 청첩장을 함께 편집할 수 있어요. 두 사람이 각자 계정으로
          같은 청첩장을 수정하게 됩니다.
        </p>
        <p className="text-xs text-muted">
          로그인됨: <span className="text-secondary">{user.email}</span>
        </p>
        <JoinForm code={code} />
      </Card>
    </main>
  );
}
