"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Bus, Calendar, X, Save, Loader2, ChevronRight, Users, FileDown } from "lucide-react";
import { clsx } from "clsx";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import {
  subscribeBuses, addBus, updateBus, deleteBus,
  subscribeBusSchedules, addBusSchedule, deleteBusSchedule,
} from "@/lib/services/busService";
import { Bus as BusType, BusSchedule } from "@/types/database";

function downloadScheduleExcel(schedule: BusSchedule, allBuses: BusType[]) {
  type Row = (string | number | null)[];
  const wb = XLSX.utils.book_new();

  for (const busId of schedule.busIds) {
    const bus = allBuses.find((b) => b.id === busId);
    const roster = schedule.assignments[busId];
    if (!bus || !roster) continue;

    const total = roster.participants.length;
    const data: Row[] = [];

    data.push([`[${schedule.name}] ${bus.name} 탑승 명단`]);
    data.push([`출력일: ${new Date().toLocaleDateString("ko-KR")}`]);
    data.push([null]);
    data.push([`차량 번호: ${bus.busNumber || "(미입력)"}`]);
    data.push([`담당자: ${roster.managerName || "(미지정)"}`]);
    data.push([`총 탑승 인원: ${total}명`]);
    data.push([null]);

    if (total > 0) {
      data.push(["번호", "이름", "소속 조", "전화번호 뒷 4자리"]);
      roster.participants.forEach((p, i) => {
        data.push([
          i + 1,
          p.name,
          p.group ? `${p.group}조` : "미배정",
          p.phone ? p.phone.slice(-4) : "—",
        ]);
      });
    } else {
      data.push(["", "(배정된 참가자 없음)"]);
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = [{ wch: 6 }, { wch: 14 }, { wch: 10 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, bus.name.slice(0, 31));
  }

  XLSX.writeFile(wb, `${schedule.name}_버스명단.xlsx`);
}

export default function AdminBusAssignmentPage() {
  const router = useRouter();
  const [buses, setBuses] = useState<BusType[]>([]);
  const [schedules, setSchedules] = useState<BusSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  // Bus modal
  const [busModal, setBusModal] = useState(false);
  const [editingBusId, setEditingBusId] = useState<string | null>(null);
  const [busForm, setBusForm] = useState({ name: "", busNumber: "", order: 0 });
  const [savingBus, setSavingBus] = useState(false);

  // Schedule modal
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduleName, setScheduleName] = useState("");
  const [savingSchedule, setSavingSchedule] = useState(false);

  useEffect(() => {
    let busLoaded = false, scheduleLoaded = false;
    const check = () => { if (busLoaded && scheduleLoaded) setLoading(false); };

    const u1 = subscribeBuses((data) => { setBuses(data); busLoaded = true; check(); });
    const u2 = subscribeBusSchedules((data) => { setSchedules(data); scheduleLoaded = true; check(); });
    return () => { u1(); u2(); };
  }, []);

  // Bus handlers
  const openAddBus = () => {
    setEditingBusId(null);
    setBusForm({ name: "", busNumber: "", order: buses.length + 1 });
    setBusModal(true);
  };
  const openEditBus = (bus: BusType) => {
    setEditingBusId(bus.id);
    setBusForm({ name: bus.name, busNumber: bus.busNumber, order: bus.order });
    setBusModal(true);
  };
  const handleSaveBus = async () => {
    if (!busForm.name) { alert("버스 이름을 입력해주세요."); return; }
    try {
      setSavingBus(true);
      if (editingBusId) {
        await updateBus(editingBusId, busForm);
      } else {
        await addBus({ ...busForm, createdAt: null });
      }
      setBusModal(false);
    } catch { alert("저장 실패"); } finally { setSavingBus(false); }
  };
  const handleDeleteBus = async (id: string) => {
    if (!confirm("버스를 삭제하시겠습니까?")) return;
    await deleteBus(id).catch(() => alert("삭제 실패"));
  };

  // Schedule handlers
  const handleAddSchedule = async () => {
    if (!scheduleName.trim()) { alert("스케줄 이름을 입력해주세요."); return; }
    try {
      setSavingSchedule(true);
      await addBusSchedule(scheduleName.trim());
      setScheduleModal(false);
      setScheduleName("");
    } catch { alert("저장 실패"); } finally { setSavingSchedule(false); }
  };
  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("스케줄을 삭제하시겠습니까?")) return;
    await deleteBusSchedule(id).catch(() => alert("삭제 실패"));
  };

  const totalAssigned = (s: BusSchedule) =>
    Object.values(s.assignments).reduce((sum, r) => sum + r.participants.length, 0);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-toss-blue" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-black text-toss-black">버스 배정 관리</h1>
        <p className="text-sm text-toss-gray mt-1">버스를 등록하고 스케줄별로 참가자를 배정합니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── 버스 목록 ── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-toss-black flex items-center gap-2">
              <Bus size={20} className="text-toss-blue" />
              버스 목록
              <span className="text-sm font-bold text-toss-gray">({buses.length}대)</span>
            </h2>
            <button
              onClick={openAddBus}
              className="flex items-center gap-1.5 text-sm font-bold text-white bg-toss-blue px-3 py-2 rounded-xl hover:bg-blue-600 transition-colors"
            >
              <Plus size={16} /> 버스 추가
            </button>
          </div>

          {buses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-toss-border p-8 text-center text-toss-gray text-sm">
              등록된 버스가 없습니다.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {buses.map((bus) => (
                <div
                  key={bus.id}
                  className="bg-white rounded-2xl border border-toss-border p-4 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                    <Bus size={20} className="text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-toss-black">{bus.name}</p>
                    <p className="text-xs text-toss-gray mt-0.5">{bus.busNumber || "번호 미입력"}</p>
                  </div>
                  <span className="text-[11px] font-bold text-toss-gray bg-toss-lightGray px-2 py-0.5 rounded-lg">
                    #{bus.order}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => openEditBus(bus)} className="p-2 text-toss-gray hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteBus(bus.id)} className="p-2 text-toss-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 스케줄 목록 ── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-toss-black flex items-center gap-2">
              <Calendar size={20} className="text-toss-blue" />
              스케줄
              <span className="text-sm font-bold text-toss-gray">({schedules.length}개)</span>
            </h2>
            <button
              onClick={() => setScheduleModal(true)}
              disabled={buses.length === 0}
              className="flex items-center gap-1.5 text-sm font-bold text-white bg-toss-blue px-3 py-2 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={buses.length === 0 ? "버스를 먼저 등록해주세요" : undefined}
            >
              <Plus size={16} /> 스케줄 추가
            </button>
          </div>

          {buses.length === 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-700 font-medium">
              버스를 먼저 등록해야 스케줄을 만들 수 있습니다.
            </div>
          )}

          {schedules.length === 0 ? (
            <div className="bg-white rounded-2xl border border-toss-border p-8 text-center text-toss-gray text-sm">
              등록된 스케줄이 없습니다.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {schedules.map((s) => {
                const assigned = totalAssigned(s);
                return (
                  <div key={s.id} className="bg-white rounded-2xl border border-toss-border overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-toss-blue/10 flex items-center justify-center shrink-0">
                        <Calendar size={20} className="text-toss-blue" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-toss-black">{s.name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[11px] text-toss-gray">버스 {s.busIds.length}대</span>
                          <span className="text-[11px] text-toss-gray">참가자 {assigned}명 배정</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDeleteSchedule(s.id)} className="p-2 text-toss-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="스케줄 삭제">
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => downloadScheduleExcel(s, buses)}
                          className="p-2 text-toss-gray hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="엑셀 다운로드"
                        >
                          <FileDown size={16} />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/bus-assignment/${s.id}`)}
                          className="flex items-center gap-1 text-xs font-bold text-toss-blue bg-toss-blue/10 px-3 py-2 rounded-lg hover:bg-toss-blue/20 transition-colors"
                        >
                          배정 관리
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>

                    {/* 버스 요약 */}
                    {s.busIds.length > 0 && (
                      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                        {s.busIds.map((busId) => {
                          const bus = buses.find((b) => b.id === busId);
                          const roster = s.assignments[busId];
                          return bus ? (
                            <span key={busId} className="inline-flex items-center gap-1 text-[11px] font-bold bg-toss-lightGray text-toss-black px-2 py-1 rounded-lg">
                              <Bus size={11} className="text-orange-400" />
                              {bus.name}
                              {roster && (
                                <span className="text-toss-gray ml-0.5">
                                  {roster.participants.length}명
                                </span>
                              )}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Bus Modal */}
      {busModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-toss-border flex justify-between items-center">
              <h2 className="text-lg font-bold text-toss-black">{editingBusId ? "버스 수정" : "버스 추가"}</h2>
              <button onClick={() => setBusModal(false)}><X size={22} className="text-toss-gray" /></button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="버스 이름">
                <input
                  type="text"
                  value={busForm.name}
                  onChange={(e) => setBusForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="예: 1호 버스"
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none text-sm font-medium"
                />
              </Field>
              <Field label="차량 번호">
                <input
                  type="text"
                  value={busForm.busNumber}
                  onChange={(e) => setBusForm((f) => ({ ...f, busNumber: e.target.value }))}
                  placeholder="예: 경기 12가 3456"
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none text-sm font-medium"
                />
              </Field>
              <Field label="순서">
                <input
                  type="number"
                  value={busForm.order}
                  onChange={(e) => setBusForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none text-sm font-medium"
                />
              </Field>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setBusModal(false)} className="flex-1 py-3 bg-toss-lightGray text-toss-gray font-bold rounded-xl text-sm">취소</button>
              <button onClick={handleSaveBus} disabled={savingBus} className="flex-1 py-3 bg-toss-blue text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {savingBus ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-toss-border flex justify-between items-center">
              <h2 className="text-lg font-bold text-toss-black">스케줄 추가</h2>
              <button onClick={() => setScheduleModal(false)}><X size={22} className="text-toss-gray" /></button>
            </div>
            <div className="p-6">
              <Field label="스케줄 이름">
                <input
                  type="text"
                  value={scheduleName}
                  onChange={(e) => setScheduleName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSchedule()}
                  placeholder="예: 첫째날 출발"
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none text-sm font-medium"
                  autoFocus
                />
              </Field>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setScheduleModal(false)} className="flex-1 py-3 bg-toss-lightGray text-toss-gray font-bold rounded-xl text-sm">취소</button>
              <button onClick={handleAddSchedule} disabled={savingSchedule} className="flex-1 py-3 bg-toss-blue text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {savingSchedule ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                생성
              </button>
            </div>
          </div>
        </div>
      )}
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
