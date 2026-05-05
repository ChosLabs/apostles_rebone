"use client";

import React from "react";
import { 
  User, 
  Phone, 
  Users, 
  Home, 
  Tag, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Settings
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { logout } from "@/lib/services/authService";

export default function MyProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* Header */}
      <div className="bg-white px-5 pt-8 pb-6 border-b border-toss-border/50">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => router.back()}
            className="p-1 -ml-1 text-toss-gray"
          >
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <h1 className="text-lg font-bold text-toss-black absolute left-1/2 -translate-x-1/2">내 정보</h1>
          <button className="text-toss-gray">
            <Settings size={22} />
          </button>
        </div>

        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-toss-lightGray flex items-center justify-center text-toss-gray/40 relative">
            <User size={40} />
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full border border-toss-border shadow-sm flex items-center justify-center text-toss-gray">
              <Tag size={14} />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-black text-toss-black flex items-center gap-2">
              {user.name}
              <span className="text-xs bg-toss-blue/10 text-toss-blue px-2 py-0.5 rounded-lg font-bold">
                {user.role === 'admin' ? '관리자' : '참가자'}
              </span>
            </h2>
            <p className="text-sm text-toss-gray font-medium mt-1">{user.phone || "-"}</p>
          </div>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="px-5 py-6 space-y-4">
        {/* Retreat Info */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-toss-border/30">
          <h3 className="text-xs font-black text-toss-gray uppercase tracking-widest mb-5 italic flex items-center gap-2">
            <ShieldCheck size={14} className="text-toss-blue" />
            수련회 배정 정보
          </h3>
          <div className="grid grid-cols-2 gap-y-6">
            <InfoItem icon={<Users size={18} />} label="소속 팀" value={user.team || "미배정"} />
            <InfoItem icon={<Users size={18} />} label="또래" value={user.birthYear ? `${user.birthYear}또래` : "미배정"} />
            <InfoItem icon={<Users size={18} />} label="배정 조" value={user.group ? `${user.group}조` : "미배정"} />
            <InfoItem icon={<Home size={18} />} label="배정 숙소" value={user.room || "미배정"} />
            <InfoItem icon={<Tag size={18} />} label="참석 구분" value={user.attendanceType || "미배정"} />
          </div>
        </section>

        {/* Action List */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-toss-border/30">
          <MenuLink icon={<CreditCard size={18} />} label="회비 납부 확인" />
          <MenuLink icon={<Settings size={18} />} label="알림 설정" />
          <MenuLink 
            icon={<LogOut size={18} />} 
            label="로그아웃" 
            danger 
            onClick={() => logout()}
          />
        </div>

        {/* Footer Info */}
        <p className="text-center text-[11px] text-toss-gray pt-4 leading-relaxed">
          정보가 실제와 다를 경우 <br />
          <span className="font-bold underline cursor-pointer">운영국(임원단)</span>에 문의해 주세요.
        </p>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-toss-gray">
        <span className="opacity-60">{icon}</span>
        <span className="text-[11px] font-bold uppercase tracking-tight">{label}</span>
      </div>
      <p className="text-[15px] font-black text-toss-black ml-7">{value}</p>
    </div>
  );
}

function MenuLink({ icon, label, danger = false, onClick }: { icon: React.ReactNode; label: string; danger?: boolean; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full px-6 py-5 flex items-center justify-between hover:bg-toss-lightGray/30 transition-colors border-b border-toss-border/30 last:border-0"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl ${danger ? 'bg-red-50 text-red-500' : 'bg-toss-lightGray/50 text-toss-gray'}`}>
          {icon}
        </div>
        <span className={`text-[15px] font-bold ${danger ? 'text-red-500' : 'text-toss-black'}`}>{label}</span>
      </div>
      <ChevronRight size={18} className="text-toss-border" />
    </button>
  );
}
