"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Phone, Shield, X, Save, Loader2, Download } from "lucide-react";
import { clsx } from "clsx";
import {
  subscribeEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from "@/lib/services/emergencyContactService";
import { EmergencyContact } from "@/types/database";
import { exportToExcel } from "@/lib/utils/excel";

type FormData = Omit<EmergencyContact, "id">;

const EMPTY_FORM: FormData = {
  name: "",
  role: "",
  phone: "",
  description: "",
  order: 0,
};

export default function AdminEmergencyContactsPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeEmergencyContacts((data) => {
      setContacts(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, order: contacts.length });
    setIsModalOpen(true);
  };

  const openEditModal = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setForm({
      name: contact.name,
      role: contact.role,
      phone: contact.phone,
      description: contact.description ?? "",
      order: contact.order,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.role.trim()) {
      alert("이름, 역할, 전화번호는 필수입니다.");
      return;
    }
    try {
      setIsSaving(true);
      if (editingId) {
        await updateEmergencyContact(editingId, form);
      } else {
        await addEmergencyContact(form);
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
    if (!confirm("이 비상연락처를 삭제하시겠습니까?")) return;
    try {
      await deleteEmergencyContact(id);
    } catch (e) {
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-toss-black">비상연락처 관리</h1>
          <p className="text-sm text-toss-gray mt-1">수련회 중 비상 상황 시 연락할 담당자 정보를 관리합니다.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const rows = contacts.map(c => ({
                순서: c.order,
                이름: c.name,
                역할: c.role,
                전화번호: c.phone,
                비고: c.description || "",
              }));
              exportToExcel(rows, "비상연락처");
            }}
            className="bg-white text-toss-black border border-toss-border px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-toss-lightGray transition-colors shadow-sm text-sm"
          >
            <Download size={16} />
            엑셀 내보내기
          </button>
          <button
            onClick={openAddModal}
            className="bg-toss-blue text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-sm"
          >
            <Plus size={20} />
            연락처 추가
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-toss-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-red-500">
            <Phone size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-toss-gray uppercase tracking-wider">전체 연락처</p>
            <p className="text-xl font-black text-toss-black">{contacts.length}개</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-toss-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-orange-500">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-toss-gray uppercase tracking-wider">역할 수</p>
            <p className="text-xl font-black text-toss-black">
              {new Set(contacts.map((c) => c.role)).size}개
            </p>
          </div>
        </div>
      </div>

      {/* Contact List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-toss-blue" size={32} />
        </div>
      ) : contacts.length === 0 ? (
        <div className="py-20 text-center text-toss-gray font-bold text-sm">
          등록된 비상연락처가 없습니다. 추가해주세요.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-white rounded-3xl shadow-sm border border-toss-border overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                    <Phone size={20} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-base font-black text-toss-black">{contact.name}</p>
                    <span className="text-xs font-bold text-toss-blue bg-toss-blue/8 px-2 py-0.5 rounded-lg">
                      {contact.role}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(contact)}
                    className="p-2 text-toss-gray hover:text-toss-blue hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 text-toss-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="px-5 pb-5 space-y-2">
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-2 text-sm font-bold text-toss-black bg-toss-lightGray/50 px-4 py-2.5 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Phone size={14} />
                  {contact.phone}
                </a>
                {contact.description && (
                  <p className="text-xs text-toss-gray px-1 leading-relaxed">{contact.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-toss-border flex justify-between items-center bg-toss-lightGray/30">
              <h2 className="text-xl font-bold text-toss-black">
                {editingId ? "연락처 수정" : "연락처 추가"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={24} className="text-toss-gray" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="이름">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="예: 홍길동"
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-medium text-sm"
                />
              </Field>
              <Field label="역할">
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  placeholder="예: 캠프 디렉터, 의료팀, 안전담당"
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-medium text-sm"
                />
              </Field>
              <Field label="전화번호">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="예: 010-1234-5678"
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-medium text-sm"
                />
              </Field>
              <Field label="비고 (선택)">
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="예: 야간 긴급 시에만 연락"
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-medium text-sm"
                />
              </Field>
              <Field label="순서">
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-medium text-sm"
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
