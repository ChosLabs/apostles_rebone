"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ClipboardCheck, ChevronRight, Loader2, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { useAuth } from "@/components/providers/AuthProvider";
import { subscribeAttendanceSessions } from "@/lib/services/attendanceService";
import { AttendanceSession } from "@/types/database";

export default function AttendancePage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return subscribeAttendanceSessions((data) => {
      setSessions(data);
      setLoading(false);
    });
  }, []);

  const mySessions = sessions.filter((s) =>
    (s.groups ?? []).some((g) => g.participants.some((p) => p.id === user?.uid)) ||
    (s.managers ?? []).some((m) => m.id === user?.uid)
  );

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-background">
        <Header />
        <div className="flex justify-center items-center flex-1">
          <Loader2 className="animate-spin text-toss-blue" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-background pb-20">
      <Header />
      <main className="p-4 flex flex-col gap-3">
        {mySessions.length === 0 ? (
          <div className="bg-white dark:bg-surface rounded-toss p-10 text-center border border-toss-border/40 text-toss-gray text-sm">
            배정된 출석체크 항목이 없습니다.
          </div>
        ) : (
          mySessions.map((s) => {
            const myGroup = (s.groups ?? []).find(
              (g) => g.participants.some((p) => p.id === user?.uid)
            );
            const isManager = (s.managers ?? []).some((m) => m.id === user?.uid);
            const attended = myGroup ? s.records?.[user!.uid]?.attended === true : false;

            const totalInSession = (s.groups ?? []).reduce((acc, g) => acc + g.participants.length, 0);
            const attendedInSession = Object.values(s.records ?? {}).filter((r) => r.attended).length;
            const pct = totalInSession > 0 ? Math.round((attendedInSession / totalInSession) * 100) : 0;

            return (
              <Link key={s.id} href={`/attendance/${s.id}`}>
                <div className={clsx(
                  "bg-white dark:bg-surface rounded-toss border overflow-hidden shadow-sm active:scale-[0.98] transition-all cursor-pointer",
                  myGroup && attended ? "border-emerald-200" : "border-toss-border/40"
                )}>
                  <div className="p-5 flex items-center gap-4">
                    <div className={clsx(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                      myGroup && attended ? "bg-emerald-50" : "bg-toss-blue/10"
                    )}>
                      <ClipboardCheck size={22} className={myGroup && attended ? "text-emerald-500" : "text-toss-blue"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-toss-black">{s.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {myGroup && (
                          <span className="text-[11px] font-bold bg-toss-lightGray text-toss-black px-1.5 py-0.5 rounded-md">
                            {myGroup.name}
                          </span>
                        )}
                        {myGroup && (
                          <span className={clsx("text-[12px] font-bold flex items-center gap-0.5", attended ? "text-emerald-600" : "text-toss-gray")}>
                            {attended ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                            {attended ? "출석 완료" : "미출석"}
                          </span>
                        )}
                        {isManager && (
                          <span className="text-[11px] font-bold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-md">담당자</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-toss-border shrink-0" />
                  </div>
                  {totalInSession > 0 && (
                    <div className="px-5 pb-4">
                      <div className="flex justify-between text-[11px] font-bold text-toss-gray mb-1">
                        <span>전체 출석 현황</span>
                        <span className="text-emerald-600">{attendedInSession}/{totalInSession}명</span>
                      </div>
                      <div className="h-1.5 bg-toss-lightGray rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-surface px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
      <Link href="/" className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
        <ArrowLeft size={24} className="text-toss-black" />
      </Link>
      <h1 className="text-lg font-bold text-toss-black">출석체크</h1>
    </header>
  );
}
