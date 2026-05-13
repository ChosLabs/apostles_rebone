"use client";

import { useState, useEffect } from "react";
import {
  Plus, Edit2, Trash2, Users, Clock, X, Save, Hash, Loader2,
  Bus, DownloadCloud, AlertTriangle, Check, FileDown,
} from "lucide-react";
import { clsx } from "clsx";
import * as XLSX from "xlsx";
import {
  subscribeDispatchedChurches,
  addDispatchedChurch,
  updateDispatchedChurch,
  deleteDispatchedChurch,
} from "@/lib/services/dispatchedChurchService";
import { getParticipants } from "@/lib/services/participantService";
import { DispatchedChurch, ScheduleItem } from "@/types/database";
import { CHURCH_SEED_DATA } from "@/lib/data/churchSeedData";

async function downloadOutreachExcel(
  churches: DispatchedChurch[],
  setIsDownloading: (v: boolean) => void
) {
  try {
    setIsDownloading(true);
    const participants = await getParticipants();
    const wb = XLSX.utils.book_new();

    for (const church of churches) {
      type Row = (string | number | null)[];
      const data: Row[] = [];

      data.push([church.name]);
      data.push([`출발 시간: ${church.departureTime || "미정"}`]);
      data.push([`이동 시간: ${church.travelTime || "미정"}`]);
      data.push([null]);

      if (church.schedule?.length > 0) {
        data.push(["[일정]"]);
        for (const s of church.schedule) {
          data.push([s.time, s.description]);
        }
        data.push([null]);
      }

      if (church.ministries?.length > 0) {
        data.push(["[사역]", church.ministries.join(", ")]);
        data.push([null]);
      }

      if (church.note) {
        data.push(["[특이사항]", church.note]);
        data.push([null]);
      }

      data.push(["[배정 명단]"]);
      const sortedGroups = [...church.assignedGroups].sort((a, b) => a - b);

      for (const groupNum of sortedGroups) {
        const groupParticipants = participants
          .filter((p) => p.group === groupNum)
          .sort((a, b) => a.name.localeCompare(b.name));

        data.push([null]);
        data.push([`${groupNum}조 (${groupParticipants.length}명)`]);

        if (groupParticipants.length > 0) {
          data.push(["번호", "이름", "팀", "전화번호 뒷 4자리"]);
          groupParticipants.forEach((p, i) => {
            data.push([i + 1, p.name, p.team || "", p.phone ? p.phone.slice(-4) : "—"]);
          });
        } else {
          data.push(["", "(참가자 없음)"]);
        }
      }

      const ws = XLSX.utils.aoa_to_sheet(data);
      ws["!cols"] = [{ wch: 12 }, { wch: 16 }, { wch: 12 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(wb, ws, church.name.slice(0, 31));
    }

    const date = new Date().toLocaleDateString("ko-KR").replace(/\. /g, "-").replace(".", "");
    XLSX.writeFile(wb, `아웃리치_명단_${date}.xlsx`);
  } catch (e) {
    console.error(e);
    alert("다운로드에 실패했습니다.");
  } finally {
    setIsDownloading(false);
  }
}

type FormData = Omit<DispatchedChurch, "id">;

const EMPTY_FORM: FormData = {
  order: 0,
  name: "",
  departureTime: "",
  travelTime: "",
  assignedGroups: [],
  schedule: [],
  ministries: [],
  note: "",
};

function serializeSchedule(items: ScheduleItem[]): string {
  return items.map((s) => `${s.time}|${s.description}`).join("\n");
}

function parseSchedule(text: string): ScheduleItem[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const sep = l.indexOf("|");
      if (sep === -1) return { time: "", description: l };
      return { time: l.slice(0, sep).trim(), description: l.slice(sep + 1).trim() };
    });
}

function serializeMinis(m: string[]): string {
  return m.join("\n");
}

function parseMinis(text: string): string[] {
  return text.split("\n").map((s) => s.trim()).filter(Boolean);
}

export default function AdminDispatchedChurchPage() {
  const [churches, setChurches] = useState<DispatchedChurch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [groupInput, setGroupInput] = useState("");
  const [scheduleText, setScheduleText] = useState("");
  const [miniText, setMiniText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const unsub = subscribeDispatchedChurches((data) => {
      const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setChurches(sorted);
      setLoading(false);
    });
    return unsub;
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setGroupInput("");
    setScheduleText("");
    setMiniText("");
    setIsModalOpen(true);
  };

  const openEditModal = (church: DispatchedChurch) => {
    setEditingId(church.id);
    setForm({
      order: church.order ?? 0,
      name: church.name,
      departureTime: church.departureTime ?? "",
      travelTime: church.travelTime ?? "",
      assignedGroups: church.assignedGroups,
      schedule: church.schedule ?? [],
      ministries: church.ministries ?? [],
      note: church.note ?? "",
    });
    setGroupInput(church.assignedGroups.join(", "));
    setScheduleText(serializeSchedule(church.schedule ?? []));
    setMiniText(serializeMinis(church.ministries ?? []));
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      alert("교회명은 필수입니다.");
      return;
    }
    const groups = groupInput
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));

    const data: FormData = {
      ...form,
      assignedGroups: groups,
      schedule: parseSchedule(scheduleText),
      ministries: parseMinis(miniText),
    };

    try {
      setIsSaving(true);
      if (editingId) {
        await updateDispatchedChurch(editingId, data);
      } else {
        await addDispatchedChurch(data);
      }
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말로 이 아웃리치를 삭제하시겠습니까?")) return;
    try {
      await deleteDispatchedChurch(id);
    } catch {
      alert("삭제에 실패했습니다.");
    }
  };

  const handleSeed = async () => {
    if (
      !confirm(
        `PDF 데이터로 12개 교회를 등록합니다.\n기존에 등록된 교회와 이름이 같으면 덮어쓰지 않고 새로 추가됩니다.\n계속하시겠습니까?`
      )
    )
      return;

    try {
      setIsSeeding(true);
      setSeedResult(null);
      for (const seed of CHURCH_SEED_DATA) {
        await addDispatchedChurch(seed);
      }
      setSeedResult("12개 교회 데이터가 등록되었습니다.");
    } catch (e: any) {
      setSeedResult(`오류: ${e?.message ?? "알 수 없는 오류"}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const totalGroups = churches.reduce((acc, c) => acc + c.assignedGroups.length, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-toss-black">아웃리치 관리</h1>
          <p className="text-sm text-toss-gray mt-1">파송교회 정보와 일정을 관리하고 조를 배정합니다.</p>
        </div>
        <div className="flex gap-2">
          {churches.length === 0 && (
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-sm text-sm disabled:opacity-60"
            >
              {isSeeding ? <Loader2 size={16} className="animate-spin" /> : <DownloadCloud size={16} />}
              PDF 데이터 불러오기
            </button>
          )}
          {churches.length > 0 && (
            <button
              onClick={() => downloadOutreachExcel(churches, setIsDownloading)}
              disabled={isDownloading}
              className="bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-sm text-sm disabled:opacity-60"
            >
              {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
              엑셀 다운로드
            </button>
          )}
          <button
            onClick={openAddModal}
            className="bg-toss-blue text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-sm"
          >
            <Plus size={20} />
            교회 추가
          </button>
        </div>
      </div>

      {seedResult && (
        <div className={clsx(
          "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold",
          seedResult.startsWith("오류")
            ? "bg-red-50 text-red-600 border border-red-100"
            : "bg-emerald-50 text-emerald-700 border border-emerald-100"
        )}>
          {seedResult.startsWith("오류")
            ? <AlertTriangle size={16} />
            : <Check size={16} />}
          {seedResult}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="전체 교회" value={`${churches.length}개`} color="bg-blue-500" icon={<Clock size={24} />} />
        <StatCard title="배정 완료된 조" value={`${totalGroups}개 조`} color="bg-indigo-500" icon={<Users size={24} />} />
        <StatCard title="미배정 조" value={`${Math.max(0, 30 - totalGroups)}개 조`} color="bg-orange-500" icon={<Hash size={24} />} />
      </div>

      {/* Church List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-toss-blue" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {churches.map((church) => (
            <div
              key={church.id}
              className="bg-white rounded-3xl shadow-sm border border-toss-border overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5 border-b border-toss-border bg-toss-lightGray/20 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-toss-gray w-5">{church.order}</span>
                    <h3 className="text-lg font-black text-toss-black">{church.name}</h3>
                  </div>
                  <div className="flex gap-3 mt-1.5 flex-wrap">
                    {church.departureTime && (
                      <span className="text-[11px] font-bold text-toss-blue flex items-center gap-1">
                        <Clock size={11} /> {church.departureTime} 출발
                      </span>
                    )}
                    {church.travelTime && (
                      <span className="text-[11px] font-bold text-toss-gray flex items-center gap-1">
                        <Bus size={11} /> {church.travelTime}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(church)} className="p-2 text-toss-gray hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(church.id)} className="p-2 text-toss-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* 일정 요약 */}
                {church.schedule?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-toss-gray uppercase tracking-widest mb-1.5">일정</p>
                    <div className="space-y-1">
                      {church.schedule.map((s, i) => (
                        <div key={i} className="flex gap-2 text-xs text-toss-black">
                          <span className="font-bold text-toss-blue shrink-0">{s.time}</span>
                          <span>{s.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 사역 */}
                {church.ministries?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-toss-gray uppercase tracking-widest mb-1.5">사역</p>
                    <div className="flex flex-wrap gap-1.5">
                      {church.ministries.map((m, i) => (
                        <span key={i} className="text-[11px] bg-blue-50/60 text-toss-blue px-2 py-0.5 rounded-lg border border-blue-100/50">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 배정 조 */}
                <div className="pt-3 border-t border-toss-border/40">
                  <p className="text-[10px] font-bold text-toss-gray uppercase tracking-widest mb-1.5">
                    배정된 조 ({church.assignedGroups.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {church.assignedGroups.length > 0 ? (
                      church.assignedGroups.map((g) => (
                        <span key={g} className="text-[11px] font-bold bg-toss-lightGray text-toss-black px-2.5 py-1 rounded-lg border border-toss-border/40">
                          {g}조
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-toss-gray italic">배정된 조가 없습니다.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {churches.length === 0 && (
            <div className="col-span-2 py-20 text-center text-toss-gray font-bold text-sm">
              등록된 아웃리치가 없습니다.<br />
              <span className="text-xs font-normal text-toss-gray mt-1 block">
                위의 &apos;PDF 데이터 불러오기&apos; 버튼으로 12개 교회를 한 번에 등록할 수 있습니다.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-toss-border flex justify-between items-center bg-toss-lightGray/30 shrink-0">
              <h2 className="text-xl font-bold text-toss-black">
                {editingId ? "아웃리치 정보 수정" : "새 아웃리치 추가"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={24} className="text-toss-gray" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <Field label="순서">
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-medium text-sm"
                  />
                </Field>
                <Field label="교회명">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="예: 청송읍교회"
                    className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-medium text-sm"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="출발 시간">
                  <input
                    type="text"
                    value={form.departureTime}
                    onChange={(e) => setForm((f) => ({ ...f, departureTime: e.target.value }))}
                    placeholder="예: 08:30"
                    className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-medium text-sm"
                  />
                </Field>
                <Field label="이동 시간">
                  <input
                    type="text"
                    value={form.travelTime}
                    onChange={(e) => setForm((f) => ({ ...f, travelTime: e.target.value }))}
                    placeholder="예: 약 40분"
                    className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-medium text-sm"
                  />
                </Field>
              </div>

              <Field label="배정 조 (쉼표 구분)">
                <input
                  type="text"
                  value={groupInput}
                  onChange={(e) => setGroupInput(e.target.value)}
                  placeholder="예: 1, 2, 3"
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-medium text-sm"
                />
              </Field>

              <Field label="일정 (시간|내용 형식, 줄바꿈으로 구분)">
                <textarea
                  rows={5}
                  value={scheduleText}
                  onChange={(e) => setScheduleText(e.target.value)}
                  placeholder={"11:00|오전 예배\n14:00~14:40|오후 예배 및 마침"}
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-medium text-sm resize-none font-mono"
                />
              </Field>

              <Field label="사역 내용 (한 줄에 하나씩)">
                <textarea
                  rows={3}
                  value={miniText}
                  onChange={(e) => setMiniText(e.target.value)}
                  placeholder={"전도 (전도용품 150개)\n성도 교제"}
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-medium text-sm resize-none"
                />
              </Field>

              <Field label="특이사항 (선택)">
                <input
                  type="text"
                  value={form.note ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="준비물, 주의사항 등"
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-medium text-sm"
                />
              </Field>
            </div>

            <div className="p-6 bg-toss-lightGray/30 border-t border-toss-border flex gap-3 shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-white text-toss-gray font-bold rounded-xl border border-toss-border hover:bg-toss-lightGray transition-all text-sm"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 bg-toss-blue text-white font-bold rounded-xl shadow-lg shadow-toss-blue/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                저장
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

function StatCard({ title, value, color, icon }: {
  title: string; value: string; color: string; icon: React.ReactNode;
}) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-toss-border flex items-center gap-4">
      <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center text-white", color)}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-toss-gray uppercase tracking-wider">{title}</p>
        <p className="text-xl font-black text-toss-black">{value}</p>
      </div>
    </div>
  );
}
