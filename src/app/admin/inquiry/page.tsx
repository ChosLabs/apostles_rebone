"use client";

import { useState } from "react";
import { MessageCircle, Send, Clock, CheckCircle2, ChevronRight, X, ArrowLeft, Search, Tag, Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface InquiryCategory {
  id: number;
  name: string;
}

interface Inquiry {
  id: number;
  userName: string;
  userGroup: string;
  categoryId: number | null;
  categoryName: string;
  title: string;
  content: string;
  status: "pending" | "answered";
  createdAt: string;
  answer?: string;
  answeredAt?: string;
}

export default function AdminInquiryPage() {
  const [tab, setTab] = useState<"list" | "categories">("list");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [categories, setCategories] = useState<InquiryCategory[]>([
    { id: 1, name: "식사/숙소" },
    { id: 2, name: "일정/프로그램" },
    { id: 3, name: "기타" },
  ]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "answered">("all");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");

  // Category management state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<InquiryCategory | null>(null);
  const [editingName, setEditingName] = useState("");

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesStatus = statusFilter === "all" || inquiry.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || inquiry.categoryId === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const handleReply = () => {
    if (!selectedInquiry || !answerText) return;
    setInquiries((prev) =>
      prev.map((inq) =>
        inq.id === selectedInquiry.id
          ? { ...inq, status: "answered", answer: answerText, answeredAt: new Date().toLocaleString() }
          : inq
      )
    );
    setAnswerText("");
    setSelectedInquiry(null);
    alert("답변이 전송되었습니다.");
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
    if (!confirm("카테고리를 삭제하면 해당 카테고리로 분류된 문의는 '미분류'로 표시됩니다. 삭제할까요?")) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setInquiries((prev) =>
      prev.map((inq) => (inq.categoryId === id ? { ...inq, categoryId: null, categoryName: "미분류" } : inq))
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-toss-lightGray/30 pb-20">
      <header className="sticky top-0 z-50 bg-white px-5 py-4 flex items-center justify-between border-b border-toss-border/40">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
            <ArrowLeft size={24} className="text-toss-black" />
          </Link>
          <h1 className="text-lg font-bold text-toss-black">문의 관리</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-white border-b border-toss-border/20 sticky top-[61px] z-40">
        <button
          onClick={() => setTab("list")}
          className={`flex-1 py-3 text-sm font-bold transition-colors ${tab === "list" ? "text-toss-blue border-b-2 border-toss-blue" : "text-toss-gray"}`}
        >
          문의 목록
        </button>
        <button
          onClick={() => setTab("categories")}
          className={`flex-1 py-3 text-sm font-bold transition-colors ${tab === "categories" ? "text-toss-blue border-b-2 border-toss-blue" : "text-toss-gray"}`}
        >
          카테고리 관리
        </button>
      </div>

      {tab === "list" ? (
        <>
          {/* Filters */}
          <div className="bg-white border-b border-toss-border/20 px-4 py-3 flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-toss-lightGray/50 border border-toss-border/40 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none"
            >
              <option value="all">전체 상태</option>
              <option value="pending">답변 대기</option>
              <option value="answered">답변 완료</option>
            </select>
            <select
              value={categoryFilter === "all" ? "all" : String(categoryFilter)}
              onChange={(e) => setCategoryFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="bg-toss-lightGray/50 border border-toss-border/40 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none"
            >
              <option value="all">전체 카테고리</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          </div>

          <main className="p-4 lg:p-8">
            <div className="grid grid-cols-1 gap-4">
              {filteredInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  onClick={() => setSelectedInquiry(inquiry)}
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
                      <span className="text-[10px] bg-toss-blue/5 text-toss-blue px-1.5 py-0.5 rounded font-bold">{inquiry.userGroup}</span>
                    </div>
                    <h3 className="text-base font-bold text-toss-black truncate">{inquiry.title}</h3>
                    <p className="text-sm text-toss-gray line-clamp-1">{inquiry.content}</p>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
                    <div className="text-right">
                      <p className="text-[11px] text-toss-gray">{inquiry.createdAt}</p>
                      {inquiry.status === "answered" && (
                        <p className="text-[10px] text-green-600 font-bold mt-0.5">답변일: {inquiry.answeredAt?.split(" ")[0]}</p>
                      )}
                    </div>
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
                  <p className="text-sm text-toss-gray">필터를 변경하거나 검색어를 확인해보세요.</p>
                </div>
              )}
            </div>
          </main>
        </>
      ) : (
        <main className="p-4 lg:p-8 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-sm border border-toss-border/40 p-6 mb-4">
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
            {categories.length === 0 && (
              <p className="text-center text-sm text-toss-gray py-10">등록된 카테고리가 없습니다.</p>
            )}
          </div>
        </main>
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
                  <span className="text-xs text-toss-gray">{selectedInquiry.createdAt}</span>
                </div>
                <h2 className="text-2xl font-bold text-toss-black">{selectedInquiry.title}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-toss-black">{selectedInquiry.userName}</span>
                  <span className="text-xs bg-toss-blue/5 text-toss-blue px-2 py-0.5 rounded font-bold">{selectedInquiry.userGroup}</span>
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
                value={selectedInquiry.status === "answered" ? selectedInquiry.answer : answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                readOnly={selectedInquiry.status === "answered"}
                className={`w-full bg-toss-lightGray/50 border border-toss-border/40 rounded-2xl px-6 py-5 text-base focus:outline-none focus:border-toss-blue transition-colors min-h-[200px] ${selectedInquiry.status === "answered" ? "opacity-70" : ""}`}
                placeholder="참가자에게 전달할 답변을 입력하세요."
              />
              {selectedInquiry.status === "pending" && (
                <button
                  onClick={handleReply}
                  className="w-full bg-toss-blue text-white py-5 rounded-2xl font-bold mt-4 shadow-xl shadow-toss-blue/20 active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
                >
                  <Send size={22} />
                  답변 완료하기
                </button>
              )}
              {selectedInquiry.status === "answered" && (
                <p className="text-center text-xs text-toss-gray font-medium italic mt-2">
                  답변 완료 일시: {selectedInquiry.answeredAt}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
