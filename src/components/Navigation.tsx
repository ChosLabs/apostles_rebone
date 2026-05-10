"use client";

import { Home, Calendar, Heart, Zap, Menu, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-white dark:bg-surface border-t border-toss-border px-4 py-2 flex justify-between items-center z-50">
      <NavItem href="/" icon={<Home size={22} />} label="홈" active={pathname === "/"} />
      <NavItem href="/timetable" icon={<Calendar size={22} />} label="타임테이블" active={pathname === "/timetable"} />
      <NavItem href="/pray" icon={<Heart size={22} />} label="기도" active={pathname.startsWith("/pray")} />
      <NavItem href="/calling" icon={<Zap size={22} />} label="콜링존" active={pathname === "/calling"} />
      <NavItem href="/more" icon={<Menu size={22} />} label="더보기" active={pathname === "/more"} />
    </nav>
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

import { useAuth } from "@/components/providers/AuthProvider";

export function GlobalHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  // 상세 페이지들은 각자 헤더를 가짐
  const hideGlobalHeader = ["/timetable", "/notices", "/pray/my", "/pray/group", "/pray/all", "/login"].some(path => pathname === path);
  if (hideGlobalHeader) return null;

  return (
    <header className="sticky top-0 z-50 bg-background px-5 py-4 flex justify-between items-center h-16">
      <h1>
        <Image src="/rebon_logo_blue.png" alt="RE:BON" height={64} width={64} className="object-contain translate-y-1" />
      </h1>
      <div className="flex gap-4 items-center">
        <Link href="/profile" className="flex items-center gap-2 cursor-pointer group bg-white dark:bg-surface border border-toss-border/50 py-1 pl-3 pr-1 rounded-full hover:border-toss-blue/20 transition-all shadow-sm">
          <span className="text-[13px] font-bold text-toss-gray group-hover:text-toss-blue transition-colors">
            {user?.name || "참가자"}<span className="font-medium opacity-60 ml-0.5">님</span>
          </span>
          <div className="w-7 h-7 rounded-full bg-toss-lightGray flex items-center justify-center text-toss-gray/60 group-hover:text-toss-blue transition-all">
            <User size={15} />
          </div>
        </Link>
      </div>
    </header>
  );
}
