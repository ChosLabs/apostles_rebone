"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bell,
  BellRing,
  Calendar,
  MessageSquare,
  Users,
  LogOut,
  User,
  Home,
  Menu,
  X,
  BookOpen,
  Vote,
  Image,
  MapPin,
  Ticket,
  Heart,
  Phone,
  Stamp,
  PackageSearch,
  Archive,
  Bus,
  ClipboardCheck,
  KeyRound,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { login, logout } from "@/lib/services/authService";

function AdminLoginGate() {
  const { loginState } = useAuth();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password) { setError("아이디와 비밀번호를 입력해주세요."); return; }
    setIsSubmitting(true);
    setError("");
    try {
      const user = await login(name, password);
      if (user?.role === "admin") {
        loginState(user);
      } else {
        setError("관리자 계정이 아닙니다.");
      }
    } catch {
      setError("로그인 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-toss-black flex items-center justify-center p-6">
      <div className="w-full max-w-[360px] space-y-8">
        <div className="text-center">
          <p className="text-toss-blue font-black text-2xl italic mb-1">Re:본 ADMIN</p>
          <p className="text-white/40 text-sm font-medium">관리자 계정으로 로그인해주세요.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-3">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-toss-blue transition-colors" size={20} />
            <input
              type="text"
              placeholder="아이디"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-toss-blue outline-none transition-all font-bold text-white placeholder:text-white/20"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="relative group">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-toss-blue transition-colors" size={20} />
            <input
              type="password"
              placeholder="비밀번호"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-toss-blue outline-none transition-all font-bold text-white placeholder:text-white/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-xs font-bold text-red-400 text-center">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-toss-blue text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-toss-blue/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><ArrowRight size={20} />로그인</>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Handle sidebar initial state and window resizing
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const menuItems = [
    { name: "대시보드", icon: <LayoutDashboard size={20} />, href: "/admin" },
    { name: "참가자 관리", icon: <User size={20} />, href: "/admin/users" },
    { name: "조 관리", icon: <Users size={20} />, href: "/admin/groups" },
    { name: "숙소 관리", icon: <Home size={20} />, href: "/admin/accommodations" },
    { name: "알림 관리", icon: <BellRing size={20} />, href: "/admin/notifications" },
    { name: "공지사항 관리", icon: <Bell size={20} />, href: "/admin/notices" },
    { name: "타임테이블 관리", icon: <Calendar size={20} />, href: "/admin/timetable" },
    { name: "문의 관리", icon: <MessageSquare size={20} />, href: "/admin/inquiry" },
    { name: "기도제목 관리", icon: <MessageSquare size={20} />, href: "/admin/pray" },
    { name: "오늘의 기도제목 관리", icon: <Heart size={20} />, href: "/admin/daily-prayers" },
    { name: "강의 관리", icon: <BookOpen size={20} />, href: "/admin/lectures" },
    { name: "아웃리치 관리", icon: <MapPin size={20} />, href: "/admin/dispatched-church" },
    { name: "버스 배정 관리", icon: <Bus size={20} />, href: "/admin/bus-assignment" },
    { name: "출석체크 관리", icon: <ClipboardCheck size={20} />, href: "/admin/attendance" },
    { name: "콜링존 관리", icon: <Stamp size={20} />, href: "/admin/calling-zone" },
    { name: "추첨 관리", icon: <Ticket size={20} />, href: "/admin/lucky-draw" },
    { name: "투표 관리", icon: <Vote size={20} />, href: "/admin/vote" },
    { name: "비상연락처 관리", icon: <Phone size={20} />, href: "/admin/emergency-contacts" },
    { name: "포토앨범 관리", icon: <Image size={20} />, href: "/admin/gallery" },
    { name: "분실물 관리", icon: <PackageSearch size={20} />, href: "/admin/lost-items" },
    { name: "재고 관리", icon: <Archive size={20} />, href: "/admin/inventory" },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-between">
        <Link href="/admin" className={`font-black text-xl italic text-toss-blue transition-opacity ${!sidebarOpen && "lg:opacity-0 lg:w-0 overflow-hidden"}`}>
          Re:본 ADMIN
        </Link>
        <button 
          onClick={() => window.innerWidth < 1024 ? setIsMobileMenuOpen(false) : setSidebarOpen(!sidebarOpen)}
          className="p-1 hover:bg-white/10 rounded-lg lg:block hidden"
        >
          <Menu size={20} />
        </button>
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="p-1 hover:bg-white/10 rounded-lg lg:hidden block text-white"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto admin-nav-scroll">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                isActive 
                  ? "bg-toss-blue text-white" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className={`font-bold text-sm transition-opacity ${!sidebarOpen && "lg:opacity-0 lg:w-0 overflow-hidden whitespace-nowrap"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-3 w-full text-white/60 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span className={`font-bold text-sm transition-opacity ${!sidebarOpen && "lg:opacity-0 lg:w-0 overflow-hidden"}`}>
            로그아웃
          </span>
        </button>
      </div>
    </>
  );

  if (!user || user.role !== "admin") {
    return <AdminLoginGate />;
  }

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-toss-black text-white transition-all duration-300 hidden lg:flex flex-col z-50`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <div className={`lg:hidden fixed inset-0 z-[100] transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        <aside className={`absolute left-0 top-0 bottom-0 w-72 bg-toss-black text-white transition-transform duration-300 flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <SidebarContent />
        </aside>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-toss-border flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-toss-gray hover:bg-toss-lightGray rounded-lg lg:hidden"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-base lg:text-lg font-bold text-toss-black truncate">
              {menuItems.find(item => item.href === pathname)?.name || "관리자"}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="p-2 text-toss-gray hover:bg-toss-lightGray rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-6 w-px bg-toss-border mx-1 lg:mx-2"></div>
            <div className="flex items-center gap-2 lg:gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-toss-black leading-none">{user?.name || "관리자"}</p>
                <p className="text-[10px] lg:text-[11px] text-toss-gray mt-1">관리자 계정</p>
              </div>
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-toss-lightGray flex items-center justify-center text-toss-gray">
                <User size={18} className="lg:size-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#f8f9fa]">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
