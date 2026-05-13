"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { logout } from "@/lib/services/authService";
import { useAuth } from "@/components/providers/AuthProvider";
import { isInventoryManager } from "@/lib/services/inventoryService";
import {
  ClipboardCheck, Users, Map, Bus,
  Image, Zap, Phone,
  ChevronRight, Settings, LogOut, User, Vote,
  HelpCircle, MapPin, PackageSearch, Archive
} from "lucide-react";

type MenuItem = {
  icon: React.ReactNode;
  label: string;
  desc: string;
  color: string;
  href: string;
  target?: string;
};

const allMenuItems: MenuItem[] = [
  { icon: <Users className="text-blue-500" />, label: "우리 조", desc: "조원 및 조장", color: "text-blue-500", href: "/group" },
  { icon: <Map className="text-red-400" />, label: "리조트 안내", desc: "지도 및 식당", color: "text-red-400", href: "/resort" },
  { icon: <ClipboardCheck className="text-orange-500" />, label: "강의 신청", desc: "선택강의", color: "text-orange-500", href: "/lectures" },
  { icon: <MapPin className="text-purple-500" />, label: "아웃리치", desc: "나의 파송지 확인", color: "text-purple-500", href: "/dispatched-church" },
  { icon: <Vote className="text-indigo-500" />, label: "실시간 투표", desc: "참여하기", color: "text-indigo-500", href: "/vote" },
  { icon: <Zap className="text-rose-400" />, label: "실시간 추첨", desc: "추첨 확인하기", color: "text-rose-400", href: "/lucky-draw" },
  { icon: <Image className="text-blue-600" />, label: "포토앨범", desc: "수련회 사진첩", color: "text-blue-600", href: "/gallery" },
  { icon: <Phone className="text-green-500" />, label: "비상 연락처", desc: "도움이 필요할 때", color: "text-green-500", href: "/emergency" },
  { icon: <Bus className="text-orange-400" />, label: "버스 배정", desc: "출발 버스 번호 확인", color: "text-orange-400", href: "/bus-schedule" },
  { icon: <PackageSearch className="text-teal-500" />, label: "분실물", desc: "분실물 확인 및 수령", color: "text-teal-500", href: "/lost-items" },
];

export default function MorePage() {
  const { user, isGuest } = useAuth();
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    if (!user) return;
    isInventoryManager(user.uid).then(setIsManager);
  }, [user]);

  return (
    <div className="flex flex-col gap-6 pb-8 px-4">
      {/* 1. 프로필 요약 섹션 */}
      <Link href="/profile">
        <div className="bg-white dark:bg-surface rounded-toss p-5 shadow-[0_2px_8_rgba(0,0,0,0.04)] border border-toss-border/40 mt-2 flex justify-between items-center group cursor-pointer active:scale-[0.98] transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-toss-lightGray border border-toss-border/40 flex items-center justify-center text-toss-gray/40 group-hover:text-toss-blue group-hover:bg-toss-blue/5 transition-all">
              <User size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-lg font-bold text-toss-black flex items-center">{isGuest ? "게스트" : (user?.name || "참가자")}<span className="font-medium text-toss-gray ml-0.5">님</span></h2>
                {user?.group && (
                  <span className="text-[10px] font-bold bg-toss-blue/10 text-toss-blue px-1.5 py-0.5 rounded-md">{user.group}조</span>
                )}
              </div>
              <p className="text-xs text-toss-gray flex items-center gap-1">
                내 프로필 보기 <ChevronRight size={14} className="opacity-40" />
              </p>
            </div>
          </div>
          <div className="bg-toss-lightGray p-2.5 rounded-full text-toss-gray hover:text-toss-blue transition-colors shadow-sm">
            <Settings size={20} />
          </div>
        </div>
      </Link>

      {/* 2. 전체 메뉴 그리드 */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-toss-gray px-1 uppercase tracking-wider">전체 메뉴</h3>
        <div className="grid grid-cols-2 gap-3">
          {allMenuItems.map((item, idx) => (
            <Link href={item.href} key={idx} target={item.target}>
              <div className="bg-white dark:bg-surface p-4 rounded-toss shadow-sm border border-toss-border/40 flex items-center gap-3 transition-transform active:scale-[0.96] cursor-pointer h-full">
                <div className="bg-toss-lightGray w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                  <div className={item.color}>
                    {item.icon}
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-[13px] font-bold text-toss-black leading-tight truncate">{item.label}</p>
                  <p className="text-[10px] text-toss-gray truncate">{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. 푸터 섹션 */}
      <div className="flex flex-col gap-3 mt-2">
        <Link href="/inquiry" className="flex items-center justify-between w-full p-5 bg-white dark:bg-surface border border-toss-border/40 rounded-2xl active:scale-[0.98] transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-toss-blue">
              <HelpCircle size={22} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-toss-black">문의하기</p>
              <p className="text-xs text-toss-gray">궁금한 점이나 불편한 사항을 남겨주세요</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-toss-gray/30 group-hover:text-toss-blue transition-colors" />
        </Link>

        {isManager && !isGuest && (
          <Link href="/inventory" className="flex items-center justify-between w-full p-5 bg-white dark:bg-surface border border-toss-border/40 rounded-2xl active:scale-[0.98] transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Archive size={22} />
              </div>
              <div>
                <p className="text-[15px] font-bold text-toss-black">재고관리</p>
                <p className="text-xs text-toss-gray">물품 재고 등록 및 수정</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-toss-gray/30 group-hover:text-toss-blue transition-colors" />
          </Link>
        )}

        <button 
          onClick={() => logout()}
          className="flex items-center justify-center gap-2 w-full py-4 bg-toss-lightGray/50 text-toss-gray text-sm font-bold rounded-2xl hover:bg-toss-lightGray transition-colors"
        >
          <LogOut size={18} />
          로그아웃
        </button>
        <div className="text-center mt-2">
          <p className="text-[10px] text-toss-gray/50 uppercase tracking-widest font-bold">2026 Apostles Summer Retreat</p>
          <p className="text-[10px] text-toss-gray/30 mt-1">Version 1.0.0 (Build 260605)</p>
        </div>
      </div>
    </div>
  );
}
