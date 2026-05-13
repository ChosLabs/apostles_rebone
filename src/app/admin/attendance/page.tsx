"use client";

import { useState, useEffect } from "react";
import {
  Plus, Trash2, ClipboardCheck, Users, CheckSquare,
  ChevronRight, Loader2, X, Save, Bus,
} from "lucide-react";
import { clsx } from "clsx";
import { useRouter } from "next/navigation";
import {
  subscribeAttendanceSessions,
  addAttendanceSession,
  addSessionFromBusSchedule,
  deleteAttendanceSession,
} from "@/lib/services/attendanceService";
import { subscribeBusSchedules, subscribeBuses } from "@/lib/services/busService";
import { AttendanceSession, BusSchedule, Bus as BusType } from "@/types/database";

type ModalTab = "general" | "bus";

export default function AdminAttendancePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [busSchedules, setBusSchedules] = useState<BusSchedule[]>([]);
  const [allBuses, setAllBuses] = useState<BusType[]>([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(false);
  const [tab, setTab] = useState<ModalTab>("general");
  const [formName, setFormName] = useState("");
  const [formOrder, setFormOrder] = useState(1);
  const [selectedSchedule, setSelectedSchedule] = useState<BusSchedule | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let n = 0;
    const done = () => { if (++n >= 3) setLoading(false); };
    const u1 = subscribeAttendanceSessions((d) => { setSessions(d); done(); });
    const u2 = subscribeBusSchedules((d) => { setBusSchedules(d); done(); });
    const u3 = subscribeBuses((d) => { setAllBuses(d); done(); });
    return () => { u1(); u2(); u3(); };
  }, []);

  const openModal = () => {
    setTab("general");
    setFormName("");
    setFormOrder(sessions.length + 1);
    setSelectedSchedule(null);
    setModal(true);
  };

  const handleCreate = async () => {
    if (!formName.trim()) { alert("항목 이름을 입력해주세요."); return; }
    try {
      setSaving(true);
      if (tab === "general") {
        await addAttendanceSession(formName.trim(), formOrder);
        setModal(false);
      } else {
        if (!selectedSchedule) { alert("스케줄을 선택해주세요."); return; }
        const id = await addSessionFromBusSchedule(formName.trim(), formOrder, selectedSchedule, allBuses);
        setModal(false);
        router.push(`/admin/attendance/${id}`);
      }
    } catch { alert("저장 실패"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("출석체크 항목을 삭제하시겠습니까?")) return;
    await deleteAttendanceSession(id).catch(() => alert("삭제 실패"));
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-toss-blue" size={32} /></div>;
  }

  const totalGroups = sessions.reduce((s, ses) => s + (ses.groups?.length ?? 0), 0);
  const totalParticipants = sessions.reduce(
    (s, ses) => s + (ses.groups ?? []).reduce((gs, g) => gs + (g.participants?.length ?? 0), 0), 0
  );
  const totalManagers = sessions.reduce((s, ses) => s + (ses.managers?.length ?? 0), 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-toss-black">출석체크 관리</h1>
          <p className="text-sm text-toss-gray mt-1">출석체크 항목과 세부 분류를 관리합니다.</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-1.5 text-sm font-bold text-white bg-toss-blue px-4 py-2.5 rounded-xl hover:bg-blue-600 transition-colors"
        >
          <Plus size={16} /> 항목 추가
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="전체 항목" value={`${sessions.length}개`} color="bg-toss-blue" icon={<ClipboardCheck size={16} className="text-white" />} />
        <StatCard label="세부 분류" value={`${totalGroups}개`} color="bg-violet-500" icon={<CheckSquare size={16} className="text-white" />} />
        <StatCard label="전체 참가자" value={`${totalParticipants}명`} color="bg-emerald-500" icon={<Users size={16} className="text-white" />} />
        <StatCard label="담당자" value={`${totalManagers}명`} color="bg-orange-400" icon={<Users size={16} className="text-white" />} />
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-toss-border p-12 text-center text-toss-gray text-sm">
          등록된 출석체크 항목이 없습니다.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((s) => {
            const totalInSession = (s.groups ?? []).reduce((acc, g) => acc + (g.participants?.length ?? 0), 0);
            const attendedInSession = Object.values(s.records ?? {}).filter((r) => r.attended).length;
            const pct = totalInSession > 0 ? Math.round((attendedInSession / totalInSession) * 100) : 0;

            return (
              <div key={s.id} className="bg-white rounded-2xl border border-toss-border overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-toss-blue/10 flex items-center justify-center shrink-0">
                    <ClipboardCheck size={20} className="text-toss-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-toss-black">{s.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-toss-gray">분류 {s.groups?.length ?? 0}개</span>
                      <span className="text-[11px] text-toss-gray">참가자 {totalInSession}명</span>
                      {totalInSession > 0 && (
                        <span className="text-[11px] font-bold text-emerald-600">
                          출석 {attendedInSession}/{totalInSession} ({pct}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-toss-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => router.push(`/admin/attendance/${s.id}`)}
                      className="flex items-center gap-1 text-xs font-bold text-toss-blue bg-toss-blue/10 px-3 py-2 rounded-lg hover:bg-toss-blue/20 transition-colors"
                    >
                      관리 <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
                {/* Group chips */}
                {(s.groups?.length ?? 0) > 0 && (
                  <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                    {(s.groups ?? []).map((g) => {
                      const gAttended = g.participants.filter((p) => s.records?.[p.id]?.attended).length;
                      return (
                        <span key={g.id} className="inline-flex items-center gap-1 text-[11px] font-bold bg-toss-lightGray text-toss-black px-2 py-1 rounded-lg">
                          {g.name}
                          <span className="text-toss-gray ml-0.5">{gAttended}/{g.participants.length}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
                {totalInSession > 0 && (
                  <div className="px-4 pb-3">
                    <div className="h-1.5 bg-toss-lightGray rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-toss-border flex justify-between items-center">
              <h2 className="text-lg font-bold text-toss-black">출석체크 항목 추가</h2>
              <button onClick={() => setModal(false)}><X size={22} className="text-toss-gray" /></button>
            </div>

            {/* Tab */}
            <div className="px-6 pt-5 flex gap-2">
              {(["general", "bus"] as ModalTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setSelectedSchedule(null); setFormName(""); }}
                  className={clsx(
                    "flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors",
                    tab === t ? "bg-toss-blue text-white" : "bg-toss-lightGray text-toss-gray"
                  )}
                >
                  {t === "general" ? "일반 항목" : "버스 스케줄"}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-4">
              <Field label="항목 이름">
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={tab === "general" ? "예: 첫째날 등록" : "예: 첫째날 버스"}
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none text-sm font-medium"
                  autoFocus
                />
              </Field>
              <Field label="순서">
                <input
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none text-sm font-medium"
                />
              </Field>

              {tab === "bus" && (
                <Field label="버스 스케줄 선택">
                  {busSchedules.length === 0 ? (
                    <p className="text-xs text-amber-600 font-medium bg-amber-50 px-3 py-2 rounded-xl">
                      등록된 버스 스케줄이 없습니다. 버스 배정 관리에서 먼저 추가해주세요.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {busSchedules.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setSelectedSchedule(s);
                            if (!formName) setFormName(s.name);
                          }}
                          className={clsx(
                            "flex items-center gap-3 p-3 rounded-xl border text-left transition-colors",
                            selectedSchedule?.id === s.id
                              ? "border-toss-blue bg-toss-blue/5"
                              : "border-toss-border hover:bg-toss-lightGray/50"
                          )}
                        >
                          <Bus size={16} className="text-orange-400 shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-toss-black">{s.name}</p>
                            <p className="text-[11px] text-toss-gray">버스 {s.busIds.length}대</p>
                          </div>
                          {selectedSchedule?.id === s.id && (
                            <span className="ml-auto text-[10px] font-bold text-toss-blue bg-toss-blue/10 px-2 py-0.5 rounded-md">선택됨</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </Field>
              )}
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setModal(false)} className="flex-1 py-3 bg-toss-lightGray text-toss-gray font-bold rounded-xl text-sm">취소</button>
              <button
                onClick={handleCreate}
                disabled={saving || (tab === "bus" && !selectedSchedule)}
                className="flex-1 py-3 bg-toss-blue text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {tab === "bus" ? "생성 후 담당자 배정" : "생성"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-toss-border p-4">
      <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center mb-3", color)}>{icon}</div>
      <p className="text-xs font-bold text-toss-gray">{label}</p>
      <p className="text-xl font-black text-toss-black">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-toss-gray ml-1 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
