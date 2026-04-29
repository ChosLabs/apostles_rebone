"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Bell, 
  Calendar, 
  MessageSquare, 
  Users, 
  Settings, 
  ChevronLeft,
  Menu,
  LogOut,
  User
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    { name: "대시보드", icon: <LayoutDashboard size={20} />, href: "/admin" },
    { name: "공지사항 관리", icon: <Bell size={20} />, href: "/admin/notices" },
    { name: "타임테이블 관리", icon: <Calendar size={20} />, href: "/admin/timetable" },
    { name: "기도제목 관리", icon: <MessageSquare size={20} />, href: "/admin/pray" },
    { name: "참가자 관리", icon: <Users size={20} />, href: "/admin/users" },
  ];

  return (
    <div className="flex h-screen bg-[#f8f9fa]">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-toss-black text-white transition-all duration-300 flex flex-col z-50`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link href="/admin" className={`font-black text-xl italic text-toss-blue transition-opacity ${!sidebarOpen && "opacity-0 w-0 overflow-hidden"}`}>
            Re:본 ADMIN
          </Link>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-white/10 rounded-lg"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? "bg-toss-blue text-white" 
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className={`font-bold text-sm transition-opacity ${!sidebarOpen && "opacity-0 w-0 overflow-hidden whitespace-nowrap"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="flex items-center gap-3 px-3 py-3 w-full text-white/60 hover:text-white transition-colors">
            <LogOut size={20} />
            <span className={`font-bold text-sm transition-opacity ${!sidebarOpen && "opacity-0 w-0 overflow-hidden"}`}>
              로그아웃
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-toss-border flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-toss-black">
              {menuItems.find(item => item.href === pathname)?.name || "관리자"}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-toss-gray hover:bg-toss-lightGray rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-toss-border mx-2"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right">
                <p className="text-sm font-bold text-toss-black leading-none">관리자</p>
                <p className="text-[11px] text-toss-gray mt-1">superadmin@test.com</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-toss-lightGray flex items-center justify-center text-toss-gray">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#f8f9fa]">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
