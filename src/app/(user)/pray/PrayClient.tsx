"use client";

import { useState } from "react";
import { PenLine, Sparkles, User, Users, Globe, ChevronRight, Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { DailyPrayer } from "@/types/database";
import { useAuth } from "@/components/providers/AuthProvider";
import { addPrayerRequest } from "@/lib/services/prayService";

export default function PrayClient({ 
  todayPrayer, 
  dDay 
}: { 
  todayPrayer: DailyPrayer | null, 
  dDay: number 
}) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPrayedToday, setHasPrayedToday] = useState(false);

  const handleSubmit = async () => {
    if (!user || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await addPrayerRequest(user, content, "all", isAnonymous);
      alert("기도제목이 공유되었습니다.");
      setContent("");
    } catch (error) {
      console.error(error);
      alert("기도제목 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-8 px-4">
      {/* 1. 오늘의 기도제목 (Pinned) */}
      <div className="bg-white rounded-toss p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-toss-blue/10 relative overflow-hidden mt-2">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles size={40} className="text-toss-blue" />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold bg-toss-blue/10 text-toss-blue px-2 py-1 rounded-md uppercase tracking-wider">Today's Topic</span>
          <span className="text-xs font-medium text-toss-gray">D-{dDay > 0 ? dDay : 'DAY'}</span>
        </div>
        <h3 className="text-lg font-bold text-toss-black mb-2 leading-tight">
          {todayPrayer?.title || "수련회를 위한 마음 준비"}
        </h3>
        <p className="text-sm text-toss-gray leading-relaxed mb-4">
          {todayPrayer?.content || "참석자 한 사람 한 사람이 기대와 갈망을 품고 올 수 있도록 기도해주세요."}
        </p>
        <button 
          onClick={() => setHasPrayedToday(!hasPrayedToday)}
          className={`w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm ${
            hasPrayedToday 
            ? "bg-red-50 text-red-500 shadow-red-500/10" 
            : "bg-toss-blue text-white shadow-toss-blue/20"
          }`}
        >
          <Heart size={16} fill={hasPrayedToday ? "currentColor" : "none"} />
          {hasPrayedToday ? "함께 기도했습니다" : "함께 기도하기"}
        </button>
      </div>

      {/* 2. 기도시기 작성 섹션 */}
      <div className="bg-white rounded-toss p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-toss-border/40">
        <h3 className="text-sm font-bold text-toss-black mb-4 flex items-center gap-2">
          <PenLine size={16} className="text-toss-blue" />
          기도제목 나누기
        </h3>
        <textarea 
          placeholder="나누고 싶은 기도제목을 적어주세요..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-toss-lightGray/50 border-none rounded-xl p-4 text-sm min-h-[100px] focus:ring-1 focus:ring-toss-blue/20 transition-all placeholder:text-toss-gray/40 mb-3"
        />
        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-toss-border text-toss-blue focus:ring-0 focus:ring-offset-0 transition-all" 
            />
            <span className="text-xs text-toss-gray group-hover:text-toss-black transition-colors font-medium">익명으로 올리기</span>
          </label>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
            className="bg-toss-blue text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm shadow-toss-blue/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            올리기
          </button>
        </div>
        <p className="text-[10px] text-toss-gray/50 mt-4 text-center">
          공유된 기도제목은 다른 참석자들이 함께 기도할 수 있습니다
        </p>
      </div>

      {/* 3. 이동 버튼들 (나의 기도 / 조 기도 / 모두의 기도) */}
      <div className="grid grid-cols-1 gap-3 mt-2">
        <PrayNavButton 
          href="/pray/my" 
          icon={<User size={20} className="text-blue-500" />} 
          title="나의 기도제목" 
          desc="내가 올린 기도제목 모아보기" 
        />
        <PrayNavButton 
          href="/pray/group" 
          icon={<Users size={20} className="text-green-500" />} 
          title="우리 조 기도제목" 
          desc="내 조원들이 나누는 기도제목" 
        />
        <PrayNavButton 
          href="/pray/all" 
          icon={<Globe size={20} className="text-indigo-500" />} 
          title="모두의 기도제목" 
          desc="모든 참석자들의 실시간 기도제목" 
        />
      </div>
    </div>
  );
}

function PrayNavButton({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link href={href}>
      <div className="bg-white p-4 rounded-toss shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-toss-border/40 flex items-center justify-between active:scale-[0.98] transition-all group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-toss-lightGray flex items-center justify-center group-hover:bg-toss-blue/5 transition-colors">
            {icon}
          </div>
          <div>
            <h4 className="text-[15px] font-bold text-toss-black leading-tight mb-1">{title}</h4>
            <p className="text-xs text-toss-gray">{desc}</p>
          </div>
        </div>
        <ChevronRight size={20} className="text-toss-gray/30 group-hover:text-toss-blue transition-colors" />
      </div>
    </Link>
  );
}
