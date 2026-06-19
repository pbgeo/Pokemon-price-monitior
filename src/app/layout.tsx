import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kream 가격 차액 검색기",
  description: "Kream 검색 결과를 목표가로 필터링하고 VND·CNY 환산 가격을 보여줍니다.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
