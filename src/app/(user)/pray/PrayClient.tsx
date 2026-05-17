"use client";

import { useState } from "react";
import { PenLine, Sparkles, User, Users, Globe, ChevronRight, Heart, Loader2, Moon, Sun, Lock, X } from "lucide-react";
import Link from "next/link";
import { DailyPrayer } from "@/types/database";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { addPrayerRequest } from "@/lib/services/prayService";

export default function PrayClient({ 
  todayPrayer, 
  dDay 
}: { 
  todayPrayer: DailyPrayer | null, 
  dDay: number 
}) {
  const { user, isGuest } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPrayedToday, setHasPrayedToday] = useState(false);
  const [prayerSheetOpen, setPrayerSheetOpen] = useState(false);

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
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center gap-2 w-full text-sm font-bold mt-2 py-3.5 rounded-2xl border transition-all active:scale-[0.98] shadow-sm
          bg-white dark:bg-surface
          text-toss-black dark:text-toss-black
          border-toss-border dark:border-toss-border"
      >
        {theme === 'dark'
          ? <><Sun size={15} className="text-yellow-400" />화면 밝게 보기</>
          : <><Moon size={15} className="text-toss-blue" />화면 어둡게 보기</>
        }
      </button>
      {/* 1. 오늘의 기도제목 (Pinned) */}
      <div className="bg-white dark:bg-surface rounded-toss p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-toss-blue/10 relative overflow-hidden mt-2">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles size={40} className="text-toss-blue" />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold bg-toss-blue/10 text-toss-blue px-2 py-1 rounded-md uppercase tracking-wider">오늘의 기도제목</span>
          <span className="text-xs font-medium text-toss-gray">D-{dDay > 0 ? dDay : 'DAY'}</span>
        </div>
        <h3 className="text-lg font-bold text-toss-black mb-1.5 leading-tight">
          {todayPrayer?.title || "수련회를 위한 마음 준비"}
        </h3>
        <p className="text-sm text-toss-gray leading-relaxed line-clamp-1">
          {todayPrayer?.content || "참석자 한 사람 한 사람이 기대와 갈망을 품고 올 수 있도록 기도해주세요."}
        </p>
        <button
          onClick={() => setPrayerSheetOpen(true)}
          className="mt-1.5 text-[12px] font-semibold text-toss-blue/70 hover:text-toss-blue transition-colors"
        >
          전체보기 →
        </button>
      </div>

      {/* 기도제목 바텀시트 */}
      {prayerSheetOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setPrayerSheetOpen(false)}>
          <div className="bg-white dark:bg-surface w-full max-w-[420px] rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0 pr-3">
                <span className="text-[10px] font-bold bg-toss-blue/10 text-toss-blue px-2 py-1 rounded-md">오늘의 기도제목</span>
                <h2 className="text-lg font-bold text-toss-black dark:text-toss-black mt-2 leading-tight">{todayPrayer?.title || "수련회를 위한 마음 준비"}</h2>
              </div>
              <button onClick={() => setPrayerSheetOpen(false)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors shrink-0">
                <X size={20} className="text-toss-gray" />
              </button>
            </div>
            <div className="text-sm text-toss-gray leading-relaxed whitespace-pre-line py-4 max-h-[45vh] overflow-y-auto">
              {todayPrayer?.content || "참석자 한 사람 한 사람이 기대와 갈망을 품고 올 수 있도록 기도해주세요."}
            </div>
            <button
              onClick={() => { setHasPrayedToday(!hasPrayedToday); setPrayerSheetOpen(false); }}
              className={`w-full py-4 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm mt-6 ${
                hasPrayedToday
                ? "bg-red-50 text-red-500 shadow-red-500/10"
                : "bg-toss-blue text-white shadow-toss-blue/20"
              }`}
            >
              <Heart size={16} fill={hasPrayedToday ? "currentColor" : "none"} />
              {hasPrayedToday ? "함께 기도했습니다" : "함께 기도하기"}
            </button>
          </div>
        </div>
      )}

      {/* 2. 기도제목 작성 섹션 */}
      <div className="bg-white dark:bg-surface rounded-toss p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-toss-border/40">
        <h3 className="text-sm font-bold text-toss-black mb-4 flex items-center gap-2">
          <PenLine size={16} className="text-toss-blue" />
          기도제목 나누기
        </h3>
        {isGuest ? (
          <div className="flex items-center gap-3 p-4 bg-toss-lightGray/60 rounded-xl border border-toss-border/40">
            <div className="w-9 h-9 rounded-xl bg-toss-border/30 flex items-center justify-center shrink-0">
              <Lock size={16} className="text-toss-gray" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-toss-black">게스트 모드에서 제한된 기능입니다</p>
            </div>
          </div>
        ) : (
          <>
            <textarea
              placeholder="나누고 싶은 기도제목을 적어주세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-toss-lightGray/50 dark:bg-surface text-toss-black border border-toss-border/30 rounded-xl p-4 text-sm min-h-[100px] focus:ring-1 focus:ring-toss-blue/20 focus:outline-none transition-all placeholder:text-toss-gray/40 mb-3"
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
          </>
        )}
      </div>

      {/* 3. 이동 버튼들 (나의 기도 / 조 기도 / 모두의 기도) */}
      <div className="grid grid-cols-1 gap-3 mt-2">
        {isGuest ? (
          <GuestNavBlock
            icon={<User size={20} className="text-blue-500" />}
            title="나의 기도제목"
            desc="게스트 모드에서 제한된 기능입니다"
          />
        ) : (
          <PrayNavButton
            href="/pray/my"
            icon={<User size={20} className="text-blue-500" />}
            title="나의 기도제목"
            desc="내가 올린 기도제목 모아보기"
          />
        )}
        {isGuest ? (
          <GuestNavBlock
            icon={<Users size={20} className="text-green-500" />}
            title="우리 조 기도제목"
            desc="게스트 모드에서 제한된 기능입니다"
          />
        ) : (
          <PrayNavButton
            href="/pray/group"
            icon={<Users size={20} className="text-green-500" />}
            title="우리 조 기도제목"
            desc="내 조원들이 나누는 기도제목"
          />
        )}
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
      <div className="bg-white dark:bg-surface p-4 rounded-toss shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-toss-border/40 flex items-center justify-between active:scale-[0.98] transition-all group">
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

function GuestNavBlock({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white dark:bg-surface p-4 rounded-toss border border-toss-border/40 flex items-center justify-between opacity-60">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-toss-lightGray flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h4 className="text-[15px] font-bold text-toss-black leading-tight mb-1">{title}</h4>
          <p className="text-xs text-toss-gray flex items-center gap-1">
            <Lock size={10} />
            {desc}
          </p>
        </div>
      </div>
      <Lock size={16} className="text-toss-gray/40 shrink-0" />
    </div>
  );
}
