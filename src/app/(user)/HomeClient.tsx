"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Users, MessageCircle, Map, Image, ClipboardCheck, Vote, X, Phone, MapPin, Zap, CheckSquare } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { db } from "@/lib/firebase/client";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { useReadNotices } from "@/lib/hooks/useReadNotices";

import { Notice, TimetableItem, DailyPrayer } from "@/types/database";

export default function Home({ 
  initialNotices, 
  initialTimetable,
  todayPrayer,
  dDay
}: { 
  initialNotices: Notice[], 
  initialTimetable: TimetableItem[],
  todayPrayer: DailyPrayer | null,
  dDay: number
}) {
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [timetable, setTimetable] = useState<TimetableItem[]>(initialTimetable);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [prayerSheetOpen, setPrayerSheetOpen] = useState(false);
  const { markAsRead, isUnread } = useReadNotices();

  const unreadCount = notices.filter((n) => isUnread(n.id)).length;

  useEffect(() => {
    const noticesQ = query(collection(db, "notices"), orderBy("createdAt", "desc"), limit(10));
    const unsubscribeNotices = onSnapshot(noticesQ, (snapshot) => {
      const updatedNotices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notice[];
      if (updatedNotices.length > 0) setNotices(updatedNotices);
    });

    const timetableQ = query(collection(db, "timetable"), orderBy("day", "asc"), orderBy("time", "asc"));
    const unsubscribeTimetable = onSnapshot(timetableQ, (snapshot) => {
      const updatedTimetable = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TimetableItem[];
      setTimetable(updatedTimetable);
    });

    return () => {
      unsubscribeNotices();
      unsubscribeTimetable();
    };
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
  };

  // Logic to find current and next programs
  const getPrograms = () => {
    if (timetable.length === 0) return { now: null, next: null };
    
    // For demo/retreat purpose, we'd normally use new Date()
    // But since dates are in the future, let's find the first two if "before"
    // or implement real logic if needed.
    return {
      now: timetable[0],
      next: timetable[1] || null
    };
  };

  const { now: currentProgram, next: nextProgram } = getPrograms();

  return (
    <div className="flex flex-col gap-6 pb-12 px-4">
      {/* 1. 오늘의 기도제목 */}
      <div className="toss-card !mb-0 bg-gradient-to-br from-toss-blue to-[#5d98f7] text-white border-none">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-md tracking-wider">🙏 오늘의 기도제목 D-{dDay > 0 ? dDay : 'DAY'}</span>
        </div>
        <h3 className="text-[17px] font-bold mb-1.5">{todayPrayer?.title || "수련회를 위한 마음 준비"}</h3>
        <div className="flex flex-col gap-0.5">
          {(todayPrayer?.content || "참석자 한 사람 한 사람이 기대와 갈망을 품고 올 수 있도록 기도해주세요.").split('\n').filter(l => l.trim()).slice(0, 2).map((line, i) => (
            <p key={i} className="text-[13px] text-white/80 leading-relaxed truncate">{line}</p>
          ))}
        </div>
        <button
          onClick={() => setPrayerSheetOpen(true)}
          className="mt-2 text-[12px] font-semibold text-white/60 hover:text-white transition-colors"
        >
          전체보기 →
        </button>
      </div>

      {/* 2. D-DAY COUNTER */}
      <div className="toss-card !mb-0 flex justify-between items-center border border-toss-border/40">
        <div>
          <p className="text-[11px] text-toss-gray font-bold uppercase tracking-wider mb-0.5">Retreat Countdown</p>
          <p className="text-[15px] font-bold">시작까지 <span className="text-toss-blue italic">D-{dDay > 0 ? dDay : 'DAY'}</span></p>
        </div>
        <div className="bg-toss-lightGray px-4 py-2 rounded-2xl font-mono font-black text-xl text-toss-blue">
          {dDay > 0 ? `${dDay} DAYS` : "READY"}
        </div>
      </div>

      {/* 3. 공지사항 */}
      <section>
        <div className="flex justify-between items-center mb-3 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold text-toss-black">공지사항</h2>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                {unreadCount}
              </span>
            )}
          </div>
          <Link href="/notices" className="text-xs text-toss-gray flex items-center hover:text-toss-blue transition-colors">더보기 <ChevronRight size={14} /></Link>
        </div>
        <div className="flex flex-col gap-2">
          {notices.length > 0 ? (
            <>
              <div
                className={clsx(
                  "p-5 rounded-toss shadow-sm border-l-4 active:scale-[0.98] transition-all cursor-pointer",
                  notices[0].type === "긴급"
                    ? "bg-red-50 dark:bg-red-950/40 border-red-500 dark:border-red-800"
                    : notices[0].type === "시간"
                    ? "bg-green-50 dark:bg-green-950/40 border-green-500 dark:border-green-800"
                    : "bg-white dark:bg-surface border-toss-blue border-y-toss-blue/10 border-r-toss-blue/10"
                )}
                onClick={() => { setSelectedNotice(notices[0]); markAsRead(notices[0].id); }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {notices[0].type === "긴급" ? (
                      <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded italic">URGENT</span>
                    ) : notices[0].type === "시간" ? (
                      <span className="text-[10px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded italic">TIME</span>
                    ) : (
                      <span className="text-[10px] font-bold bg-toss-blue text-white px-1.5 py-0.5 rounded italic">NEW</span>
                    )}
                    <span className={clsx(
                      "text-[15px] font-bold",
                      notices[0].type === "긴급" ? "text-red-900 dark:text-red-300" : notices[0].type === "시간" ? "text-green-900 dark:text-green-300" : "text-toss-black"
                    )}>{notices[0].title}</span>
                    {isUnread(notices[0].id) && (
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] text-toss-gray font-medium">{formatDate(notices[0].createdAt)}</span>
                </div>
                <p className={clsx(
                  "text-sm leading-relaxed line-clamp-1",
                  notices[0].type === "긴급" ? "text-red-700 dark:text-red-400" : notices[0].type === "시간" ? "text-green-700 dark:text-green-400" : "text-toss-gray"
                )}>{notices[0].content}</p>
              </div>
              <div className="bg-white dark:bg-surface rounded-toss overflow-hidden shadow-sm border border-toss-border/40">
                {notices.slice(1, 3).map((notice, idx) => (
                  <NoticeItem
                    key={notice.id}
                    title={notice.title}
                    time={formatDate(notice.createdAt)}
                    content={notice.content}
                    type={notice.type}
                    unread={isUnread(notice.id)}
                    border={idx !== Math.min(notices.length - 1, 2) - 1}
                    onClick={() => { setSelectedNotice(notice); markAsRead(notice.id); }}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-surface p-8 rounded-toss text-center border border-toss-border/40 text-toss-gray text-sm">
              등록된 공지사항이 없습니다.
            </div>
          )}
        </div>
      </section>

      {/* 4. 타임테이블 */}
      <section>
        <div className="flex justify-between items-center mb-3 px-1">
          <h2 className="text-[15px] font-bold text-toss-black">진행 중인 프로그램</h2>
          <Link href="/timetable" className="text-xs text-toss-gray flex items-center hover:text-toss-blue transition-colors">전체보기 <ChevronRight size={14} /></Link>
        </div>
        {currentProgram ? (
          <Link href="/timetable" className="flex flex-col gap-2">
            <div className="bg-white dark:bg-surface p-5 rounded-toss shadow-sm border border-toss-blue/10 flex justify-between items-center active:scale-[0.98] transition-all">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-toss-blue rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-bold text-toss-blue uppercase tracking-wider">NOW</span>
                </div>
                <p className="text-[16px] font-bold text-toss-black">{currentProgram.title}</p>
                <p className="text-[12px] text-toss-gray">{currentProgram.time} · {currentProgram.location}</p>
              </div>
              <span className="text-[10px] bg-toss-blue text-white px-2.5 py-1 rounded-lg font-bold shadow-sm shadow-toss-blue/20">진행중</span>
            </div>
            {nextProgram && (
              <div className="bg-white/60 dark:bg-surface/60 p-5 rounded-toss border border-toss-border/40 flex justify-between items-center active:scale-[0.98] transition-all">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-toss-gray/60 dark:text-toss-gray uppercase tracking-wider">NEXT</span>
                  <p className="text-[15px] font-bold text-toss-gray dark:text-toss-black">{nextProgram.title}</p>
                  <p className="text-[12px] text-toss-gray/60 dark:text-toss-gray">{nextProgram.time} · {nextProgram.location}</p>
                </div>
                <ChevronRight size={16} className="text-toss-gray/40 dark:text-toss-gray" />
              </div>
            )}
          </Link>
        ) : (
          <div className="bg-white dark:bg-surface p-8 rounded-toss text-center border border-toss-border/40 text-toss-gray text-sm">
            등록된 일정이 없습니다.
          </div>
        )}
      </section>

      {/* 5. Quick Access */}
      <section>
        <h2 className="text-[15px] font-bold text-toss-black mb-3 px-1">빠른 접근</h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickLink href="/group" icon={<Users className="text-blue-500" />} label="우리 조" desc="조원 및 조장" />
          <QuickLink href="/resort" icon={<Map className="text-red-400" />} label="리조트 안내" desc="지도 및 식당" />
          <QuickLink href="/lectures" icon={<ClipboardCheck className="text-orange-500" />} label="강의 신청" desc="선택강의" />
          <QuickLink href="/dispatched-church" icon={<MapPin className="text-purple-500" />} label="아웃리치" desc="나의 파송지 확인" />
          <QuickLink href="/vote" icon={<Vote className="text-indigo-500" />} label="실시간 투표" desc="참여하기" />
          <QuickLink href="/lucky-draw" icon={<Zap className="text-rose-400" />} label="실시간 추첨" desc="추첨 확인하기" />
          <QuickLink href="/gallery" icon={<Image className="text-blue-600" />} label="포토앨범" desc="수련회 사진첩" />
          <QuickLink href="/emergency" icon={<Phone className="text-green-500" />} label="비상 연락처" desc="도움이 필요할 때" />
        </div>
      </section>

      {/* 6. 출석체크 */}
      <section>
        <Link href="/attendance">
          <div className="bg-white dark:bg-surface p-4 rounded-toss shadow-sm border border-toss-border/40 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-toss-blue/10 flex items-center justify-center shrink-0">
              <CheckSquare size={22} className="text-toss-blue" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-toss-black">출석체크</p>
              <p className="text-[12px] text-toss-gray">내 출석 상태 확인하기</p>
            </div>
            <ChevronRight size={18} className="text-toss-border shrink-0" />
          </div>
        </Link>
      </section>

      {/* 기도제목 바텀시트 */}
      {prayerSheetOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setPrayerSheetOpen(false)}>
          <div className="bg-white w-full max-w-[420px] rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0 pr-3">
                <span className="text-[10px] font-bold bg-toss-blue/10 text-toss-blue px-2 py-1 rounded-md">🙏 오늘의 기도제목</span>
                <h2 className="text-lg font-bold text-toss-black mt-2 leading-tight">{todayPrayer?.title || "수련회를 위한 마음 준비"}</h2>
              </div>
              <button onClick={() => setPrayerSheetOpen(false)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors shrink-0">
                <X size={20} className="text-toss-gray" />
              </button>
            </div>
            <div className="text-sm text-toss-gray leading-relaxed whitespace-pre-line py-4 mb-6 max-h-[55vh] overflow-y-auto">
              {todayPrayer?.content || "참석자 한 사람 한 사람이 기대와 갈망을 품고 올 수 있도록 기도해주세요."}
            </div>
            <button onClick={() => setPrayerSheetOpen(false)} className="w-full bg-toss-blue text-white font-bold py-4 rounded-xl active:scale-95 transition-all">확인</button>
          </div>
        </div>
      )}

      {/* 공지사항 상세 모달 */}
      {selectedNotice && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedNotice(null)}>
          <div className="bg-white dark:bg-surface w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-toss-blue">{formatDate(selectedNotice.createdAt)}</span>
                <h2 className="text-xl font-bold text-toss-black">{selectedNotice.title}</h2>
              </div>
              <button onClick={() => setSelectedNotice(null)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors">
                <X size={24} className="text-toss-gray" />
              </button>
            </div>
            <div className="text-base text-toss-gray leading-relaxed whitespace-pre-wrap py-4 mb-8">
              {selectedNotice.content}
            </div>
            <button onClick={() => setSelectedNotice(null)} className="w-full bg-toss-blue text-white font-bold py-4 rounded-xl active:scale-95 transition-all">확인</button>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickLink({ href, icon, label, desc }: { href: string; icon: React.ReactNode; label: string; desc: string }) {
  return (
    <Link href={href}>
      <div className="bg-white dark:bg-surface p-4 rounded-toss shadow-sm border border-toss-border/40 flex items-center gap-3 transition-transform active:scale-[0.96] cursor-pointer h-full">
        <div className="bg-toss-lightGray w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-[13px] font-bold text-toss-black leading-tight truncate">{label}</p>
          <p className="text-[10px] text-toss-gray truncate">{desc}</p>
        </div>
      </div>
    </Link>
  );
}

function NoticeItem({ title, time, content, type = "일반", unread = false, border = true, onClick }: { title: string; time: string; content: string; type?: string; unread?: boolean; border?: boolean; onClick: () => void }) {
  return (
    <div
      className={clsx(
        "p-4 flex flex-col gap-1 active:bg-toss-lightGray transition-colors cursor-pointer",
        border && "border-b border-toss-border/40",
        type === "긴급" ? "bg-red-50/30 dark:bg-red-950/20" : type === "시간" ? "bg-green-50/30 dark:bg-green-950/20" : ""
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div className={clsx(
          "flex items-center gap-2 text-[14px] font-bold",
          type === "긴급" ? "text-red-700 dark:text-red-400" : type === "시간" ? "text-green-700 dark:text-green-400" : unread ? "text-toss-black" : "text-toss-black/50"
        )}>
          {type === "긴급" && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
          {type === "시간" && <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
          {type === "일반" && unread && <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />}
          {title}
        </div>
        <span className="text-[11px] text-toss-gray font-medium">{time}</span>
      </div>
      <p className="text-xs text-toss-gray truncate">{content}</p>
    </div>
  );
}
