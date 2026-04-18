import type { Metadata } from "next";
import "./globals.css";
import { BottomNav, GlobalHeader } from "@/components/Navigation";

export const metadata: Metadata = {
  metadataBase: new URL("https://apostles-rebone.pages.dev"),
  title: "Re:본 - 2026 아포슬 여름수련회",
  description: "",
  openGraph: {
    title: "Re:본 - 2026 아포슬 여름수련회",
    description: "",
    url: "https://apostles-rebone.pages.dev",
    siteName: "Re:본",
    images: [
      {
        url: "/og-image.png",
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
    description: "",
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
