"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send, CheckCircle2, ChevronRight, X, Tag, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { subscribeInquiries, answerInquiry, deleteInquiry, InquiryData } from "@/lib/services/inquiryService";

interface InquiryCategory {
  id: number;
  name: string;
}

function formatTs(ts: any): string {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function AdminInquiryPage() {
  const [tab, setTab] = useState<"list" | "categories">("list");
  const [inquiries, setInquiries] = useState<InquiryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<InquiryCategory[]>([
    { id: 1, name: "식사/숙소" },
    { id: 2, name: "일정/프로그램" },
    { id: 3, name: "기타" },
  ]);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryData | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "answered">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<InquiryCategory | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    const unsub = subscribeInquiries((list) => {
      setInquiries(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesStatus = statusFilter === "all" || inq.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || inq.categoryName === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const handleDelete = async () => {
    if (!selectedInquiry || !confirm("이 문의를 삭제할까요?")) return;
    setDeleting(true);
    try {
      await deleteInquiry(selectedInquiry.id);
      setSelectedInquiry(null);
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  const handleReply = async () => {
    if (!selectedInquiry || !answerText.trim()) return;
    setSubmitting(true);
    try {
      await answerInquiry(selectedInquiry.id, answerText.trim());
      setAnswerText("");
      setSelectedInquiry(null);
    } catch (e) {
      console.error(e);
      alert("답변 전송에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    setCategories((prev) => [...prev, { id: Date.now(), name: trimmed }]);
    setNewCategoryName("");
  };

  const handleSaveEdit = () => {
    if (!editingCategory || !editingName.trim()) return;
    setCategories((prev) =>
      prev.map((c) => (c.id === editingCategory.id ? { ...c, name: editingName.trim() } : c))
    );
    setEditingCategory(null);
    setEditingName("");
  };

  const handleDeleteCategory = (id: number) => {
    if (!confirm("카테고리를 삭제할까요?")) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const pendingCount = inquiries.filter((i) => i.status === "pending").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-toss-black">문의 관리</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-orange-600 font-bold mt-1">답변 대기 {pendingCount}건</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl border border-toss-border/40 p-1 w-fit gap-1">
        {(["list", "categories"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors ${tab === t ? "bg-toss-blue text-white" : "text-toss-gray hover:text-toss-black"}`}
          >
            {t === "list" ? "문의 목록" : "카테고리 관리"}
          </button>
        ))}
      </div>

      {tab === "list" ? (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white border border-toss-border/40 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none shadow-sm"
            >
              <option value="all">전체 상태</option>
              <option value="pending">답변 대기</option>
              <option value="answered">답변 완료</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-toss-border/40 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none shadow-sm"
            >
              <option value="all">전체 카테고리</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-toss-blue" size={32} />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  onClick={() => { setSelectedInquiry(inquiry); setAnswerText(""); }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-toss-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:shadow-md active:scale-[0.99] transition-all"
                >
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${inquiry.status === "answered" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}>
                        {inquiry.status === "answered" ? "답변완료" : "답변대기"}
                      </span>
                      <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                        <Tag size={10} />
                        {inquiry.categoryName}
                      </span>
                      <span className="text-xs font-bold text-toss-black">{inquiry.userName}</span>
                      {inquiry.userGroup && (
                        <span className="text-[10px] bg-toss-blue/5 text-toss-blue px-1.5 py-0.5 rounded font-bold">{inquiry.userGroup}</span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-toss-black truncate">{inquiry.title}</h3>
                    <p className="text-sm text-toss-gray line-clamp-1">{inquiry.content}</p>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
                    <p className="text-[11px] text-toss-gray">{formatTs(inquiry.createdAt)}</p>
                    <ChevronRight size={20} className="text-toss-gray/30" />
                  </div>
                </div>
              ))}

              {filteredInquiries.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-toss-gray/20 shadow-sm mb-4">
                    <MessageCircle size={40} />
                  </div>
                  <p className="text-lg font-bold text-toss-black">조회된 문의가 없습니다</p>
                  <p className="text-sm text-toss-gray mt-1">필터를 변경해보세요.</p>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="max-w-2xl flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-toss-border/40 p-6">
            <h2 className="text-base font-bold text-toss-black mb-4">새 카테고리 추가</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                placeholder="카테고리 이름 입력"
                className="flex-1 bg-toss-lightGray/50 border border-toss-border/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-toss-blue transition-colors"
              />
              <button
                onClick={handleAddCategory}
                className="bg-toss-blue text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Plus size={16} />
                추가
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-toss-border/40 px-5 py-4 flex items-center gap-3">
                <Tag size={16} className="text-purple-500 shrink-0" />
                {editingCategory?.id === category.id ? (
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                      autoFocus
                      className="flex-1 bg-toss-lightGray/50 border border-toss-blue rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                    />
                    <button onClick={handleSaveEdit} className="text-toss-blue text-sm font-bold px-3 py-1.5 rounded-lg hover:bg-toss-blue/5 transition-colors">저장</button>
                    <button onClick={() => setEditingCategory(null)} className="text-toss-gray text-sm font-bold px-3 py-1.5 rounded-lg hover:bg-toss-lightGray transition-colors">취소</button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-bold text-toss-black">{category.name}</span>
                    <button
                      onClick={() => { setEditingCategory(category); setEditingName(category.name); }}
                      className="p-2 hover:bg-toss-lightGray rounded-full transition-colors text-toss-gray"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors text-toss-gray hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedInquiry(null)}>
          <div className="bg-white w-full max-w-[600px] rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${selectedInquiry.status === "answered" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}>
                    {selectedInquiry.status === "answered" ? "답변완료" : "답변대기"}
                  </span>
                  <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                    <Tag size={10} />
                    {selectedInquiry.categoryName}
                  </span>
                  <span className="text-xs text-toss-gray">{formatTs(selectedInquiry.createdAt)}</span>
                </div>
                <h2 className="text-2xl font-bold text-toss-black">{selectedInquiry.title}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-toss-black">{selectedInquiry.userName}</span>
                  {selectedInquiry.userGroup && (
                    <span className="text-xs bg-toss-blue/5 text-toss-blue px-2 py-0.5 rounded font-bold">{selectedInquiry.userGroup}</span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedInquiry(null)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors">
                <X size={24} className="text-toss-gray" />
              </button>
            </div>

            <div className="bg-toss-lightGray/30 p-6 rounded-2xl mb-8">
              <p className="text-base text-toss-black leading-relaxed whitespace-pre-wrap">{selectedInquiry.content}</p>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold text-toss-black flex items-center gap-2">
                <CheckCircle2 size={18} className="text-toss-blue" />
                답변 작성
              </h4>
              <textarea
                value={selectedInquiry.status === "answered" ? (selectedInquiry.answer ?? "") : answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                readOnly={selectedInquiry.status === "answered"}
                className={`w-full bg-toss-lightGray/50 border border-toss-border/40 rounded-2xl px-6 py-5 text-base focus:outline-none focus:border-toss-blue transition-colors min-h-[160px] ${selectedInquiry.status === "answered" ? "opacity-70" : ""}`}
                placeholder="참가자에게 전달할 답변을 입력하세요."
              />
              {selectedInquiry.status === "pending" && (
                <button
                  onClick={handleReply}
                  disabled={submitting}
                  className="w-full bg-toss-blue text-white py-5 rounded-2xl font-bold shadow-xl shadow-toss-blue/20 active:scale-95 transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
                  답변 완료하기
                </button>
              )}
              {selectedInquiry.status === "answered" && (
                <p className="text-center text-xs text-toss-gray font-medium italic mt-2">
                  답변 완료 일시: {formatTs(selectedInquiry.answeredAt)}
                </p>
              )}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full bg-red-50 text-red-500 py-4 rounded-2xl font-bold active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              >
                {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                문의 삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
