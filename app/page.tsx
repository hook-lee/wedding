import { LinkButton } from "@/app/_ui/Button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-bg">
      <div className="w-full max-w-md space-y-6">
        <p className="text-[11px] tracking-[0.4em] text-muted uppercase">
          Wedding Invitation Builder
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
          wedding-zip
        </h1>
        <p className="text-secondary leading-relaxed">
          싸이월드 미니홈피 감성 모바일 청첩장.
          <br />폼만 채우면 나만의 청첩장 사이트가 만들어져요.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <LinkButton href="/signup" variant="primary" className="w-full sm:w-auto">
            내 청첩장 만들기
          </LinkButton>
          <LinkButton href="/login" variant="secondary" className="w-full sm:w-auto">
            로그인
          </LinkButton>
        </div>

        <p className="text-xs text-muted pt-6">
          BGM · 일촌평 · 다이어리 · 캘린더까지 한 페이지에.
        </p>
      </div>
    </main>
  );
}
