"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Send, MessageCircle, CheckCircle2, X, Tag, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  addInquiry,
  subscribeUserInquiries,
  deleteInquiry,
  InquiryData,
} from "@/lib/services/inquiryService";

const DEFAULT_CATEGORIES = ["식사/숙소", "일정/프로그램", "기타"];

function formatTs(ts: any): string {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function InquiryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"list" | "form">("list");
  const [inquiries, setInquiries] = useState<InquiryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [newCategory, setNewCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeUserInquiries(user.uid, (list) => {
      setInquiries(list);
      setLoading(false);
    });
    return unsub;
  }, [user?.uid]);

  const handleDelete = async (inquiry: InquiryData) => {
    if (!confirm("문의를 삭제할까요?")) return;
    setDeleting(true);
    try {
      await deleteInquiry(inquiry.id);
      setSelectedInquiry(null);
    } catch (err) {
      console.error(err);
      alert("삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent || !user) return;
    setSubmitting(true);
    try {
      await addInquiry({
        userId: user.uid,
        userName: user.name,
        userGroup: user.group ? `${user.group}조` : (user.team ?? ""),
        categoryName: newCategory,
        title: newTitle,
        content: newContent,
      });
      setNewCategory(DEFAULT_CATEGORIES[0]);
      setNewTitle("");
      setNewContent("");
      setActiveTab("list");
      alert("문의가 등록되었습니다. 최대한 빨리 답변 드리겠습니다!");
    } catch (err) {
      console.error(err);
      alert("문의 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white dark:bg-surface px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
        <Link href="/more" className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
          <ArrowLeft size={24} className="text-toss-black" />
        </Link>
        <h1 className="text-lg font-bold text-toss-black">문의하기</h1>
      </header>

      <div className="flex px-4 py-3 bg-white dark:bg-surface border-b border-toss-border/20 sticky top-[61px] z-40">
        <button
          onClick={() => setActiveTab("list")}
          className={`flex-1 py-2 text-sm font-bold transition-colors ${activeTab === "list" ? "text-toss-blue border-b-2 border-toss-blue" : "text-toss-gray"}`}
        >
          내 문의 내역
        </button>
        <button
          onClick={() => setActiveTab("form")}
          className={`flex-1 py-2 text-sm font-bold transition-colors ${activeTab === "form" ? "text-toss-blue border-b-2 border-toss-blue" : "text-toss-gray"}`}
        >
          새 문의 작성
        </button>
      </div>

      <main className="p-4 flex flex-col gap-4">
        {activeTab === "list" ? (
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-toss-blue" size={28} />
              </div>
            ) : inquiries.length > 0 ? (
              inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  onClick={() => setSelectedInquiry(inquiry)}
                  className="bg-white dark:bg-surface p-5 rounded-toss shadow-sm border border-toss-border/40 active:scale-[0.98] transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${inquiry.status === "answered" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}>
                        {inquiry.status === "answered" ? "답변완료" : "답변대기"}
                      </span>
                      <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                        <Tag size={9} />
                        {inquiry.categoryName}
                      </span>
                    </div>
                    <span className="text-[11px] text-toss-gray">{formatTs(inquiry.createdAt).split(" ").slice(0, 3).join(" ")}</span>
                  </div>
                  <h3 className="text-[15px] font-bold text-toss-black mb-1 group-hover:text-toss-blue transition-colors truncate">
                    {inquiry.title}
                  </h3>
                  <p className="text-xs text-toss-gray line-clamp-1">{inquiry.content}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-toss-lightGray rounded-full flex items-center justify-center text-toss-gray/30 mb-4">
                  <MessageCircle size={32} />
                </div>
                <p className="text-base font-bold text-toss-black mb-1">문의 내역이 없어요</p>
                <p className="text-sm text-toss-gray mb-6">불편한 점이 있다면 언제든 알려주세요.</p>
                <button
                  onClick={() => setActiveTab("form")}
                  className="px-6 py-2.5 bg-toss-blue text-white rounded-full font-bold text-sm shadow-sm"
                >
                  문의 작성하기
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-surface rounded-toss p-6 shadow-sm border border-toss-border/40 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-toss-black mb-6">무엇을 도와드릴까요?</h2>
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold text-toss-gray mb-1.5 block">카테고리</label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                        newCategory === cat
                          ? "bg-toss-blue text-white border-toss-blue"
                          : "bg-toss-lightGray/50 text-toss-gray border-toss-border/40 hover:border-toss-blue/40"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-toss-gray mb-1.5 block">제목</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-toss-lightGray/50 dark:bg-surface text-toss-black border border-toss-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-toss-blue transition-colors"
                  placeholder="간략한 제목을 입력해주세요"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-toss-gray mb-1.5 block">문의 내용</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-toss-lightGray/50 dark:bg-surface text-toss-black border border-toss-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-toss-blue transition-colors min-h-[160px]"
                  placeholder="상세한 내용을 입력해주시면 정확한 답변에 도움이 됩니다."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-toss-blue text-white py-4 rounded-xl font-bold mt-4 shadow-lg shadow-toss-blue/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                보내기
              </button>
            </div>
          </form>
        )}
      </main>

      {selectedInquiry && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedInquiry(null)}>
          <div className="bg-white dark:bg-surface w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold w-fit px-1.5 py-0.5 rounded ${selectedInquiry.status === "answered" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}>
                    {selectedInquiry.status === "answered" ? "답변완료" : "답변대기"}
                  </span>
                  <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                    <Tag size={9} />
                    {selectedInquiry.categoryName}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-toss-black mt-2">{selectedInquiry.title}</h2>
                <span className="text-xs text-toss-gray">{formatTs(selectedInquiry.createdAt)}</span>
              </div>
              <button onClick={() => setSelectedInquiry(null)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors">
                <X size={24} className="text-toss-gray" />
              </button>
            </div>

            <div className="bg-toss-lightGray/30 p-4 rounded-2xl mb-6">
              <p className="text-[15px] text-toss-black leading-relaxed whitespace-pre-wrap">{selectedInquiry.content}</p>
            </div>

            {selectedInquiry.status === "answered" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-center gap-2 mb-3 text-toss-blue">
                  <CheckCircle2 size={18} />
                  <span className="font-bold text-sm">운영진 답변</span>
                  <span className="text-[11px] text-toss-gray font-normal ml-auto">{formatTs(selectedInquiry.answeredAt)}</span>
                </div>
                <div className="bg-blue-50/50 border border-toss-blue/10 p-4 rounded-2xl">
                  <p className="text-[15px] text-toss-black leading-relaxed whitespace-pre-wrap">{selectedInquiry.answer}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => handleDelete(selectedInquiry)}
                disabled={deleting}
                className="flex-1 bg-red-50 text-red-500 font-bold py-4 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                삭제
              </button>
              <button onClick={() => setSelectedInquiry(null)} className="flex-[2] bg-toss-blue text-white font-bold py-4 rounded-xl active:scale-95 transition-all">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
