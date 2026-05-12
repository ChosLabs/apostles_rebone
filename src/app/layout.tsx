import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { NotificationProvider } from "@/components/providers/NotificationProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
// ... existing metadata
  metadataBase: new URL("https://apostles-rebone.pages.dev"),
  title: "RE:BON - 2026 아포슬 여름수련회",
  description: "",
  openGraph: {
    title: "RE:BON - 2026 아포슬 여름수련회",
    description: "",
    url: "https://apostles-rebone.pages.dev",
    siteName: "RE:BON",
    images: [
      {
        url: "/applogo.svg",
        alt: "RE:BON 수련회 메인 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RE:BON - 2026 아포슬 여름수련회",
    description: "",
    images: ["/applogo.svg"],
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3182f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RE:BON" />
      </head>
      <body className="bg-background text-toss-black antialiased selection:bg-toss-blue/20 font-['Pretendard',_sans-serif]">
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
