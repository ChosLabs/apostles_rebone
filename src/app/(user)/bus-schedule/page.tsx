"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Bus, Calendar, ChevronRight, Loader2, UserCheck, Users, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { useAuth } from "@/components/providers/AuthProvider";
import { subscribeBuses, subscribeBusSchedules } from "@/lib/services/busService";
import { Bus as BusType, BusSchedule } from "@/types/database";

export default function BusSchedulePage() {
  const { user } = useAuth();
  const [buses, setBuses] = useState<BusType[]>([]);
  const [schedules, setSchedules] = useState<BusSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState<BusSchedule | null>(null);
  const [expandedBusId, setExpandedBusId] = useState<string | null>(null);

  useEffect(() => {
    let b = false, s = false;
    const check = () => { if (b && s) setLoading(false); };
    const u1 = subscribeBuses((data) => { setBuses(data); b = true; check(); });
    const u2 = subscribeBusSchedules((data) => { setSchedules(data); s = true; check(); });
    return () => { u1(); u2(); };
  }, []);

  // Find my bus in selected schedule
  const myBusId = selectedSchedule
    ? Object.entries(selectedSchedule.assignments).find(([, roster]) =>
        roster.participants.some((p) => p.id === user?.uid)
      )?.[0] ?? null
    : null;

  const myBus = myBusId ? buses.find((b) => b.id === myBusId) ?? null : null;
  const myRoster = myBusId ? selectedSchedule?.assignments[myBusId] ?? null : null;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-background">
        <Header onBack={null} title="버스 배정" />
        <div className="flex justify-center items-center flex-1 py-20">
          <Loader2 className="animate-spin text-toss-blue" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-background pb-20">
      <Header
        onBack={selectedSchedule ? () => { setSelectedSchedule(null); setExpandedBusId(null); } : null}
        title={selectedSchedule ? selectedSchedule.name : "버스 배정"}
      />

      <main className="p-4 flex flex-col gap-4">
        {!selectedSchedule ? (
          /* ── 스케줄 목록 ── */
          <>
            {schedules.length === 0 ? (
              <div className="bg-white dark:bg-surface p-8 rounded-toss text-center border border-toss-border/40 text-toss-gray text-sm">
                등록된 스케줄이 없습니다.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-toss-gray px-1">스케줄을 선택하면 배정된 버스를 확인할 수 있습니다.</p>
                {schedules.map((s) => {
                  const myBusInSchedule = Object.entries(s.assignments).find(([, r]) =>
                    r.participants.some((p) => p.id === user?.uid)
                  );
                  const myBusObj = myBusInSchedule
                    ? buses.find((b) => b.id === myBusInSchedule[0])
                    : null;
                  const totalCount = Object.values(s.assignments).reduce(
                    (sum, r) => sum + r.participants.length, 0
                  );

                  return (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedSchedule(s); setExpandedBusId(null); }}
                      className="bg-white dark:bg-surface rounded-toss p-5 shadow-sm border border-toss-border/40 text-left flex items-center gap-4 active:scale-[0.98] transition-all"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                        <Bus size={22} className="text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-toss-black">{s.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[11px] text-toss-gray">버스 {s.busIds.length}대</span>
                          <span className="text-[11px] text-toss-gray">·</span>
                          <span className="text-[11px] text-toss-gray">총 {totalCount}명</span>
                          {myBusObj && (
                            <>
                              <span className="text-[11px] text-toss-gray">·</span>
                              <span className="text-[11px] font-bold text-toss-blue">
                                내 버스: {myBusObj.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-toss-border shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* ── 스케줄 상세 ── */
          <>
            {/* 내 버스 카드 */}
            {myBus && myRoster ? (
              <section className="bg-white dark:bg-surface rounded-toss border border-toss-blue/20 overflow-hidden shadow-sm">
                <div className="bg-toss-blue/5 border-b border-toss-blue/10 px-5 py-4">
                  <span className="text-[10px] font-bold bg-toss-blue text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                    My Bus
                  </span>
                  <h2 className="text-2xl font-black text-toss-black mt-2">{myBus.name}</h2>
                  <p className="text-xs text-toss-gray font-medium mt-0.5">{myBus.busNumber}</p>

                  {myRoster.managerName && (
                    <div className="flex items-center gap-1.5 mt-3">
                      <UserCheck size={13} className="text-toss-blue" />
                      <span className="text-xs font-bold text-toss-blue">담당자 {myRoster.managerName}</span>
                    </div>
                  )}
                </div>
                <div className="px-5 py-3">
                  <p className="text-[11px] font-bold text-toss-gray mb-2">
                    탑승 인원 {myRoster.participants.length}명
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {myRoster.participants.map((p) => (
                      <span
                        key={p.id}
                        className={clsx(
                          "text-[12px] font-bold px-2.5 py-1 rounded-lg",
                          p.id === user?.uid
                            ? "bg-toss-blue text-white"
                            : "bg-toss-lightGray text-toss-black"
                        )}
                      >
                        {p.name}
                        {p.group && (
                          <span className={clsx(
                            "ml-1 text-[10px]",
                            p.id === user?.uid ? "text-white/70" : "text-toss-gray"
                          )}>
                            {p.group}조
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            ) : (
              <div className="bg-amber-50 border border-amber-100 rounded-toss p-4 text-sm text-amber-700 font-medium">
                이 스케줄에서 배정된 버스가 없습니다. 관리자에게 문의하세요.
              </div>
            )}

            {/* 전체 버스 목록 */}
            <div className="px-1 mt-2">
              <h3 className="text-[15px] font-bold text-toss-black mb-1">전체 버스 명단</h3>
              <p className="text-xs text-toss-gray mb-3">버스를 탭하면 탑승자 명단을 확인할 수 있습니다.</p>
            </div>

            <div className="flex flex-col gap-3">
              {selectedSchedule.busIds.map((busId) => {
                const bus = buses.find((b) => b.id === busId);
                const roster = selectedSchedule.assignments[busId];
                if (!bus || !roster) return null;

                const isMine = busId === myBusId;
                const isExpanded = expandedBusId === busId;

                return (
                  <div
                    key={busId}
                    className={clsx(
                      "bg-white dark:bg-surface rounded-toss shadow-sm border overflow-hidden",
                      isMine ? "border-toss-blue/30" : "border-toss-border/40"
                    )}
                  >
                    <button
                      className="w-full px-4 py-4 flex items-center gap-3 text-left"
                      onClick={() => setExpandedBusId((prev) => (prev === busId ? null : busId))}
                    >
                      <div className={clsx(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        isMine ? "bg-toss-blue/10" : "bg-orange-50"
                      )}>
                        <Bus size={18} className={isMine ? "text-toss-blue" : "text-orange-400"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[15px] font-bold text-toss-black">{bus.name}</span>
                          {isMine && (
                            <span className="text-[10px] font-bold bg-toss-blue text-white px-1.5 py-0.5 rounded-full">
                              내 버스
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-toss-gray">{roster.participants.length}명</span>
                          {roster.managerName && (
                            <>
                              <span className="text-[11px] text-toss-gray">·</span>
                              <span className="text-[11px] text-toss-gray flex items-center gap-0.5">
                                <UserCheck size={10} />
                                {roster.managerName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-toss-border shrink-0" />
                      ) : (
                        <ChevronDown size={16} className="text-toss-border shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-toss-border/40 px-4 pb-4 pt-3">
                        <div className="flex flex-wrap gap-1.5">
                          {roster.participants.map((p) => (
                            <span
                              key={p.id}
                              className={clsx(
                                "text-[12px] font-bold px-2.5 py-1 rounded-lg",
                                p.id === user?.uid
                                  ? "bg-toss-blue text-white"
                                  : "bg-toss-lightGray text-toss-black"
                              )}
                            >
                              {p.name}
                              {p.group && (
                                <span className={clsx(
                                  "ml-1 text-[10px]",
                                  p.id === user?.uid ? "text-white/70" : "text-toss-gray"
                                )}>
                                  {p.group}조
                                </span>
                              )}
                            </span>
                          ))}
                          {roster.participants.length === 0 && (
                            <p className="text-xs text-toss-gray italic">배정된 참가자가 없습니다.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Header({ title, onBack }: { title: string; onBack: (() => void) | null }) {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-surface px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
      {onBack ? (
        <button onClick={onBack} className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
          <ArrowLeft size={24} className="text-toss-black" />
        </button>
      ) : (
        <Link href="/more" className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
          <ArrowLeft size={24} className="text-toss-black" />
        </Link>
      )}
      <h1 className="text-lg font-bold text-toss-black">{title}</h1>
    </header>
  );
}
