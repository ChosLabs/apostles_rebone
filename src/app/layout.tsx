import type { Metadata } from "next";
import "./globals.css";
import { BottomNav, GlobalHeader } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Re:본 - 2026 아포슬 여름수련회",
  description: "대구동신교회 청년부 아포슬 2026 수련회 공식 웹앱",
  openGraph: {
    title: "Re:본 - 2026 아포슬 여름수련회",
    description: "대구에서 평창까지, 우리를 다시 묶으시는 하나님의 부르심",
    url: "https://apostles-rebone.pages.dev", // 나중에 실제 Cloudflare 주소로 수정하세요
    siteName: "Re:본",
    images: [
      {
        url: "/og-image.png", // public 폴더에 og-image.png 파일을 넣어야 합니다
        width: 1200,
        height: 630,
        alt: "Re:본 수련회 메인 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Re:본 - 2026 아포슬 여름수련회",
    description: "대구에서 평창까지, 우리를 다시 묶으시는 하나님의 부르심",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-background text-toss-black antialiased selection:bg-toss-blue/20 font-sans">
        <div className="max-w-[420px] mx-auto min-h-screen bg-background relative shadow-xl pb-24">
          <GlobalHeader />
          <main className="">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
