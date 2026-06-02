import type { Metadata } from "next";
import { pretendard } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "wedding-zip",
  description: "싸이월드 미니홈피 감성 모바일 청첩장",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable} data-theme="ivory">
      <body className="bg-bg text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
