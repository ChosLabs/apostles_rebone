"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, Circle, Loader2, UserCheck,
  ChevronDown, ChevronUp, ClipboardCheck,
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { useAuth } from "@/components/providers/AuthProvider";
import { subscribeAttendanceSession } from "@/lib/services/attendanceService";
import { AttendanceSession, AttendanceGroup } from "@/types/database";

export default function AttendanceSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();

  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  useEffect(() => {
    return subscribeAttendanceSession(sessionId, (data) => {
      setSession(data);
      setLoading(false);
    });
  }, [sessionId]);

  if (loading || !session) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-background">
        <Header title="출석체크" onBack={null} />
        <div className="flex justify-center items-center flex-1">
          <Loader2 className="animate-spin text-toss-blue" size={32} />
        </div>
      </div>
    );
  }

  const records = session.records ?? {};
  const myGroup = (session.groups ?? []).find((g) => g.participants.some((p) => p.id === user?.uid));
  const myAttended = myGroup ? records[user!.uid]?.attended === true : false;
  const isManager = (session.managers ?? []).some((m) => m.id === user?.uid);

  const groupStats = (g: AttendanceGroup) => {
    const attended = g.participants.filter((p) => records[p.id]?.attended).length;
    return { attended, total: g.participants.length };
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-background pb-20">
      <Header title={session.name} onBack="/attendance" />

      <main className="p-4 flex flex-col gap-4">
        {/* My group card */}
        {myGroup && (
          <section className={clsx(
            "bg-white dark:bg-surface rounded-toss border overflow-hidden shadow-sm",
            myAttended ? "border-emerald-200" : "border-toss-blue/20"
          )}>
            <div className={clsx("px-5 py-3 border-b", myAttended ? "bg-emerald-50/50 border-emerald-100" : "bg-toss-blue/5 border-toss-blue/10")}>
              <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider text-white", myAttended ? "bg-emerald-500" : "bg-toss-blue")}>
                My Group
              </span>
              <h2 className="text-xl font-black text-toss-black mt-2">{myGroup.name}</h2>
            </div>
            <div className="px-5 py-4">
              <div className={clsx("flex items-center gap-2 text-lg font-bold", myAttended ? "text-emerald-600" : "text-toss-gray")}>
                {myAttended ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                {myAttended ? "출석 완료" : "미출석"}
              </div>
            </div>
          </section>
        )}

        {/* Manager action */}
        {isManager && (
          <Link
            href={`/attendance/${sessionId}/manage`}
            className="flex items-center justify-center gap-2 bg-toss-blue text-white font-bold text-sm py-3.5 rounded-2xl shadow-sm active:scale-[0.98] transition-all"
          >
            <UserCheck size={16} />
            출석 관리
          </Link>
        )}

        {/* All groups */}
        <div className="px-1">
          <h3 className="text-[15px] font-bold text-toss-black mb-1">전체 분류 현황</h3>
          <p className="text-xs text-toss-gray mb-3">탭하면 참가자 명단을 확인할 수 있습니다.</p>
        </div>

        <div className="flex flex-col gap-2">
          {(session.groups ?? []).map((g) => {
            const { attended, total } = groupStats(g);
            const pct = total > 0 ? Math.round((attended / total) * 100) : 0;
            const isExpanded = expandedGroupId === g.id;
            const isMine = g.id === myGroup?.id;

            return (
              <div
                key={g.id}
                className={clsx(
                  "bg-white dark:bg-surface rounded-toss border overflow-hidden shadow-sm",
                  isMine ? "border-toss-blue/30" : "border-toss-border/40"
                )}
              >
                <div className="px-4 py-4 flex items-center gap-3">
                  <button
                    className="flex items-center gap-3 flex-1 text-left min-w-0"
                    onClick={() => setExpandedGroupId((prev) => (prev === g.id ? null : g.id))}
                  >
                    <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", isMine ? "bg-toss-blue/10" : "bg-toss-lightGray")}>
                      <ClipboardCheck size={18} className={isMine ? "text-toss-blue" : "text-toss-gray"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[15px] font-bold text-toss-black">{g.name}</span>
                        {isMine && <span className="text-[10px] font-bold bg-toss-blue text-white px-1.5 py-0.5 rounded-full">내 그룹</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-toss-gray">{total}명</span>
                        <span className="text-[11px] font-bold text-emerald-600">{attended}/{total} 출석 ({pct}%)</span>
                      </div>
                      {total > 0 && (
                        <div className="h-1 bg-toss-lightGray rounded-full overflow-hidden mt-1.5">
                          <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-toss-border shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="text-toss-border shrink-0" />
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-toss-border/40 px-4 pb-4 pt-3">
                    {total === 0 ? (
                      <p className="text-xs text-toss-gray italic">배정된 참가자가 없습니다.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {g.participants.map((p) => {
                          const isMe = p.id === user?.uid;
                          const pAttended = records[p.id]?.attended === true;
                          return (
                            <span
                              key={p.id}
                              className={clsx(
                                "text-[12px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1",
                                isMe
                                  ? "bg-toss-blue text-white"
                                  : pAttended
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-toss-lightGray text-toss-black"
                              )}
                            >
                              {pAttended
                                ? <CheckCircle2 size={11} className={isMe ? "text-white/80" : "text-emerald-500"} />
                                : <Circle size={11} className={isMe ? "text-white/60" : "text-toss-border"} />
                              }
                              {p.name}
                              {p.group && (
                                <span className={clsx("text-[10px]", isMe ? "text-white/70" : "text-toss-gray")}>
                                  {p.group}조
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function Header({ title, onBack }: { title: string; onBack: string | null }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-surface px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
      {onBack ? (
        <Link href={onBack} className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
          <ArrowLeft size={24} className="text-toss-black" />
        </Link>
      ) : (
        <button onClick={() => router.back()} className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
          <ArrowLeft size={24} className="text-toss-black" />
        </button>
      )}
      <h1 className="text-lg font-bold text-toss-black truncate">{title}</h1>
    </header>
  );
}
