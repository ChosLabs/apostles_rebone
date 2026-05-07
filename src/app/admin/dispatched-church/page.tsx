"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Users, MapPin, Clock, Info, X, Save, Hash, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import {
  subscribeDispatchedChurches,
  addDispatchedChurch,
  updateDispatchedChurch,
  deleteDispatchedChurch,
} from "@/lib/services/dispatchedChurchService";
import { DispatchedChurch } from "@/types/database";

type FormData = Omit<DispatchedChurch, "id">;

const EMPTY_FORM: FormData = {
  name: "",
  address: "",
  worshipTime: "",
  activities: "",
  assignedGroups: [],
};

export default function AdminDispatchedChurchPage() {
  const [churches, setChurches] = useState<DispatchedChurch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [groupInput, setGroupInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeDispatchedChurches((data) => {
      setChurches(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setGroupInput("");
    setIsModalOpen(true);
  };

  const openEditModal = (church: DispatchedChurch) => {
    setEditingId(church.id);
    setForm({
      name: church.name,
      address: church.address,
      worshipTime: church.worshipTime,
      activities: church.activities,
      assignedGroups: church.assignedGroups,
    });
    setGroupInput(church.assignedGroups.join(", "));
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.address) {
      alert("교회명과 주소는 필수입니다.");
      return;
    }
    const groups = groupInput
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));

    const data: FormData = { ...form, assignedGroups: groups };

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
    } catch (e) {
      alert("삭제에 실패했습니다.");
    }
  };

  const totalAssignedGroups = churches.reduce((acc, c) => acc + c.assignedGroups.length, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-toss-black">아웃리치 관리</h1>
          <p className="text-sm text-toss-gray mt-1">파송지 정보를 관리하고 각 교회별로 조(Group)를 배정합니다.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-toss-blue text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Plus size={20} />
          아웃리치 추가
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="전체 교회" value={`${churches.length}개`} color="bg-blue-500" icon={<MapPin size={24} />} />
        <StatCard title="배정 완료된 조" value={`${totalAssignedGroups}개 조`} color="bg-indigo-500" icon={<Users size={24} />} />
        <StatCard title="미배정 조" value={`${Math.max(0, 30 - totalAssignedGroups)}개 조`} color="bg-orange-500" icon={<Hash size={24} />} />
      </div>

      {/* Church List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-toss-blue" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {churches.map((church) => (
            <div key={church.id} className="bg-white rounded-3xl shadow-sm border border-toss-border overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-toss-border bg-toss-lightGray/20 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-toss-black">{church.name}</h3>
                  <span className="text-xs font-bold text-toss-blue bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter mt-1 inline-block">
                    Worship: {church.worshipTime}
                  </span>
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

              <div className="p-6 space-y-4">
                <div className="flex gap-3 items-start">
                  <MapPin size={16} className="text-toss-gray mt-1 shrink-0" />
                  <p className="text-sm text-toss-gray leading-relaxed">{church.address}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-toss-black flex items-center gap-1.5">
                    <Users size={14} className="text-toss-blue" />
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
                <div className="pt-4 border-t border-toss-border/40">
                  <p className="text-[11px] font-bold text-toss-gray uppercase tracking-widest mb-1.5">사역 활동</p>
                  <p className="text-xs text-toss-black leading-relaxed bg-blue-50/30 p-3 rounded-xl border border-blue-100/50">
                    {church.activities}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {churches.length === 0 && (
            <div className="col-span-2 py-20 text-center text-toss-gray font-bold text-sm">
              등록된 아웃리치가 없습니다. 추가해주세요.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-toss-border flex justify-between items-center bg-toss-lightGray/30">
              <h2 className="text-xl font-bold text-toss-black">
                {editingId ? "아웃리치 정보 수정" : "새 아웃리치 추가"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={24} className="text-toss-gray" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="교회명">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="예: 평창 중앙감리교회"
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-medium text-sm"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="예배시간">
                  <input
                    type="text"
                    value={form.worshipTime}
                    onChange={(e) => setForm((f) => ({ ...f, worshipTime: e.target.value }))}
                    placeholder="예: 오전 11:00"
                    className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-medium text-sm"
                  />
                </Field>
                <Field label="조 배정 (쉼표 구분)">
                  <input
                    type="text"
                    value={groupInput}
                    onChange={(e) => setGroupInput(e.target.value)}
                    placeholder="예: 1, 2, 3"
                    className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-medium text-sm"
                  />
                </Field>
              </div>
              <Field label="주소">
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="도로명 주소"
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-medium text-sm"
                />
              </Field>
              <Field label="주요 활동 내용">
                <textarea
                  rows={3}
                  value={form.activities}
                  onChange={(e) => setForm((f) => ({ ...f, activities: e.target.value }))}
                  placeholder="사역 내용을 상세히 입력해주세요."
                  className="input resize-none"
                />
              </Field>
            </div>
            <div className="p-6 bg-toss-lightGray/30 border-t border-toss-border flex gap-3">
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
                설정 저장
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

function StatCard({ title, value, color, icon }: { title: string; value: string; color: string; icon: React.ReactNode }) {
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
