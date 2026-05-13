"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, Loader2, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/components/providers/AuthProvider";
import { subscribeAttendanceSession, markAttendance } from "@/lib/services/attendanceService";
import { AttendanceSession, AttendanceGroup, AttendanceParticipant } from "@/types/database";

type FilterType = "all" | "attended" | "absent";

export default function AttendanceManagePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<AttendanceGroup | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const unsub = subscribeAttendanceSession(sessionId, (data) => {
      if (cancelled) return;
      if (!data) { router.replace("/attendance"); return; }
      const isManager = (data.managers ?? []).some((m) => m.id === user?.uid);
      if (!isManager) { router.replace(`/attendance/${sessionId}`); return; }
      setSession(data);
      // keep selectedGroup in sync with live data
      if (selectedGroup) {
        const updated = (data.groups ?? []).find((g) => g.id === selectedGroup.id);
        if (updated) setSelectedGroup(updated);
      }
      setLoading(false);
    });
    return () => { cancelled = true; unsub(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, user, router]);

  const handleToggle = async (p: AttendanceParticipant) => {
    if (!session || toggling) return;
    const current = (session.records ?? {})[p.id]?.attended === true;
    setToggling(p.id);
    try {
      await markAttendance(sessionId, p.id, !current);
    } finally {
      setToggling(null);
    }
  };

  const handleSelectGroup = (g: AttendanceGroup) => {
    setSelectedGroup(g);
    setFilter("all");
  };

  const handleBack = () => {
    if (selectedGroup) {
      setSelectedGroup(null);
    } else {
      router.back();
    }
  };

  if (loading || !session) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-background">
        <header className="sticky top-0 z-50 bg-white dark:bg-surface px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
          <button onClick={handleBack} className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
            <ArrowLeft size={24} className="text-toss-black" />
          </button>
          <h1 className="text-lg font-bold text-toss-black">출석 관리</h1>
        </header>
        <div className="flex justify-center items-center flex-1">
          <Loader2 className="animate-spin text-toss-blue" size={32} />
        </div>
      </div>
    );
  }

  const records = session.records ?? {};
  const groups = session.groups ?? [];

  /* ── Group list view ── */
  if (!selectedGroup) {
    const totalAll = groups.flatMap((g) => g.participants).length;
    const attendedAll = groups.flatMap((g) => g.participants).filter((p) => records[p.id]?.attended).length;
    const pctAll = totalAll > 0 ? Math.round((attendedAll / totalAll) * 100) : 0;

    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-background pb-20">
        <header className="sticky top-0 z-50 bg-white dark:bg-surface border-b border-toss-border/40">
          <div className="px-5 py-4 flex items-center gap-4">
            <button onClick={handleBack} className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
              <ArrowLeft size={24} className="text-toss-black" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-toss-black truncate">{session.name}</h1>
              <p className="text-[12px] text-toss-gray">분류를 선택하여 출석을 관리하세요.</p>
            </div>
          </div>
          <div className="px-4 pb-3">
            <div className="flex justify-between text-[12px] font-bold mb-1">
              <span className="text-toss-gray">전체 현황</span>
              <span className="text-emerald-600">{attendedAll}/{totalAll}명 ({pctAll}%)</span>
            </div>
            <div className="h-1.5 bg-toss-lightGray rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pctAll}%` }} />
            </div>
          </div>
        </header>

        <main className="p-4 flex flex-col gap-2">
          {groups.length === 0 ? (
            <div className="bg-white dark:bg-surface rounded-toss p-10 text-center border border-toss-border/40 text-toss-gray text-sm">
              등록된 분류가 없습니다.
            </div>
          ) : (
            groups.map((g) => {
              const gTotal = g.participants.length;
              const gAttended = g.participants.filter((p) => records[p.id]?.attended).length;
              const gPct = gTotal > 0 ? Math.round((gAttended / gTotal) * 100) : 0;

              return (
                <button
                  key={g.id}
                  onClick={() => handleSelectGroup(g)}
                  className="w-full bg-white dark:bg-surface rounded-toss border border-toss-border/40 p-4 flex items-center gap-4 text-left shadow-sm active:scale-[0.98] transition-all hover:border-toss-blue/30"
                >
                  <div className="w-10 h-10 rounded-xl bg-toss-blue/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={18} className="text-toss-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-toss-black">{g.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-toss-gray">{gTotal}명</span>
                      <span className="text-[11px] font-bold text-emerald-600">{gAttended}/{gTotal} 출석 ({gPct}%)</span>
                    </div>
                    {gTotal > 0 && (
                      <div className="h-1 bg-toss-lightGray rounded-full overflow-hidden mt-1.5">
                        <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${gPct}%` }} />
                      </div>
                    )}
                  </div>
                  <ChevronRight size={18} className="text-toss-border shrink-0" />
                </button>
              );
            })
          )}
        </main>
      </div>
    );
  }

  /* ── Single group management view ── */
  const gTotal = selectedGroup.participants.length;
  const gAttended = selectedGroup.participants.filter((p) => records[p.id]?.attended).length;
  const gAbsent = gTotal - gAttended;

  const filtered = selectedGroup.participants.filter((p) => {
    if (filter === "attended") return records[p.id]?.attended === true;
    if (filter === "absent") return !records[p.id]?.attended;
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white dark:bg-surface border-b border-toss-border/40">
        <div className="px-5 py-4 flex items-center gap-4">
          <button onClick={handleBack} className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
            <ArrowLeft size={24} className="text-toss-black" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-toss-black truncate">{selectedGroup.name}</h1>
            <p className="text-[12px] text-toss-gray">{session.name} · 출석 관리</p>
          </div>
        </div>

        <div className="px-4 pb-3 flex flex-col gap-2">
          <div className="flex justify-between text-[12px] font-bold mb-0.5">
            <span className="text-toss-gray">출석 현황</span>
            <span className="text-emerald-600">
              {gAttended}/{gTotal}명 ({gTotal > 0 ? Math.round((gAttended / gTotal) * 100) : 0}%)
            </span>
          </div>
          <div className="h-2 bg-toss-lightGray rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${gTotal > 0 ? (gAttended / gTotal) * 100 : 0}%` }}
            />
          </div>
          <div className="flex gap-2 mt-1">
            {([
              { key: "all", label: `전체 ${gTotal}` },
              { key: "attended", label: `출석 ${gAttended}` },
              { key: "absent", label: `미출석 ${gAbsent}` },
            ] as { key: FilterType; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={clsx(
                  "flex-1 py-2 rounded-xl text-[13px] font-bold transition-colors",
                  filter === key
                    ? key === "attended" ? "bg-emerald-500 text-white"
                      : key === "absent" ? "bg-red-400 text-white"
                      : "bg-toss-blue text-white"
                    : "bg-toss-lightGray text-toss-gray"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="p-4 flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-surface rounded-toss p-10 text-center border border-toss-border/40 text-toss-gray text-sm">
            해당 필터 결과가 없습니다.
          </div>
        ) : (
          filtered.map((p) => {
            const attended = records[p.id]?.attended === true;
            const isToggling = toggling === p.id;

            return (
              <button
                key={p.id}
                onClick={() => handleToggle(p)}
                disabled={!!toggling}
                className={clsx(
                  "w-full bg-white dark:bg-surface rounded-toss border p-4 flex items-center gap-4 text-left active:scale-[0.98] transition-all shadow-sm",
                  attended ? "border-emerald-200" : "border-toss-border/40",
                  toggling && toggling !== p.id && "opacity-60"
                )}
              >
                <div className={clsx(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                  attended ? "bg-emerald-50" : "bg-toss-lightGray"
                )}>
                  {isToggling
                    ? <Loader2 size={18} className="animate-spin text-toss-gray" />
                    : attended
                    ? <CheckCircle2 size={20} className="text-emerald-500" />
                    : <Circle size={20} className="text-toss-border" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-toss-black">{p.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {p.group && <span className="text-[11px] font-bold text-toss-gray">{p.group}조</span>}
                    {p.phone && <span className="text-[11px] text-toss-gray">{p.phone.slice(-4)}</span>}
                  </div>
                </div>
                <span className={clsx(
                  "text-[12px] font-bold px-3 py-1.5 rounded-xl shrink-0",
                  attended ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-toss-lightGray text-toss-gray"
                )}>
                  {attended ? "출석" : "미출석"}
                </span>
              </button>
            );
          })
        )}
      </main>
    </div>
  );
}
