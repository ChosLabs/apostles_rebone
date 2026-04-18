import type { Metadata } from "next";
import "./globals.css";
import { Home, Calendar, Heart, Zap, Menu, Bell, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Re:본 - 2026 아포슬 여름수련회",
  description: "대구동신교회 청년부 아포슬 여름수련회 웹앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-background text-toss-black antialiased selection:bg-toss-blue/20">
        <div className="max-w-[420px] mx-auto min-h-screen bg-background relative pb-20 shadow-xl overflow-x-hidden">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md px-5 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-black text-toss-blue tracking-tight italic">
              Re:본
            </h1>
            <div className="flex gap-4 items-center">
              <button className="p-1 text-toss-gray">
                <Bell size={24} />
              </button>
              <div className="w-8 height-8 rounded-full bg-toss-border border border-toss-border overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="profile" />
              </div>
            </div>
          </header>

          <main className="px-4 py-2">
            {children}
          </main>

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-white/90 backdrop-blur-lg border-t border-toss-border px-4 py-2 flex justify-between items-center z-50">
            <NavItem href="/" icon={<Home size={22} />} label="홈" active />
            <NavItem href="/timetable" icon={<Calendar size={22} />} label="타임테이블" />
            <NavItem href="/pray" icon={<Heart size={22} />} label="기도" />
            <NavItem href="/calling" icon={<Zap size={22} />} label="콜링존" />
            <NavItem href="/more" icon={<Menu size={22} />} label="더보기" />
          </nav>
        </div>
      </body>
    </html>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${active ? 'text-toss-blue' : 'text-toss-gray'}`}>
      {icon}
      <span className="text-[10px] font-bold">{label}</span>
    </Link>
  );
}
