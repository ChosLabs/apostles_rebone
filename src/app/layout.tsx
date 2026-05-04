import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
// ... existing metadata
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
      <head>
        <link rel="stylesheet" as="style" crossOrigin="" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" />
      </head>
      <body className="bg-background text-toss-black antialiased selection:bg-toss-blue/20 font-['Pretendard',_sans-serif]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
