import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-5 max-w-md mx-auto bg-bg">
      <h1 className="text-3xl font-semibold tracking-tight">wedding-zip</h1>
      <p className="text-secondary leading-relaxed">
        싸이월드 미니홈피 감성 모바일 청첩장.<br />
        폼만 채우면 나만의 청첩장 사이트가 만들어져요.
      </p>
      <div className="flex gap-3">
        <Link href="/signup" className="px-5 py-2.5 bg-ink text-bg rounded-pill text-sm">
          내 청첩장 만들기
        </Link>
        <Link href="/login" className="px-5 py-2.5 border border-ink rounded-pill text-sm">
          로그인
        </Link>
      </div>
      <p className="text-xs text-muted mt-8">
        싸이 미니홈피처럼 BGM·일촌평·다이어리 갖춘 모바일 청첩장.
      </p>
    </main>
  );
}
