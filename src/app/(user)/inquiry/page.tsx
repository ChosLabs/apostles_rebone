"use client";

import { useState } from "react";
import { ArrowLeft, Send, MessageCircle, Clock, CheckCircle2, ChevronRight, X } from "lucide-react";
import Link from "next/link";

interface Inquiry {
  id: number;
  title: string;
  content: string;
  status: "pending" | "answered";
  createdAt: string;
  answer?: string;
  answeredAt?: string;
}

export default function InquiryPage() {
  const [activeTab, setActiveTab] = useState<"list" | "form">("list");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const inquiry: Inquiry = {
      id: Date.now(),
      title: newTitle,
      content: newContent,
      status: "pending",
      createdAt: new Date().toLocaleString()
    };

    setInquiries([inquiry, ...inquiries]);
    setNewTitle("");
    setNewContent("");
    setActiveTab("list");
    alert("문의가 등록되었습니다. 최대한 빨리 답변 드리겠습니다!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
        <Link href="/more" className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
          <ArrowLeft size={24} className="text-toss-black" />
        </Link>
        <h1 className="text-lg font-bold text-toss-black">문의하기</h1>
      </header>

      <div className="flex px-4 py-3 bg-white border-b border-toss-border/20 sticky top-[61px] z-40">
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
            {inquiries.length > 0 ? (
              inquiries.map((inquiry) => (
                <div 
                  key={inquiry.id} 
                  onClick={() => setSelectedInquiry(inquiry)}
                  className="bg-white p-5 rounded-toss shadow-sm border border-toss-border/40 active:scale-[0.98] transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${inquiry.status === 'answered' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                      {inquiry.status === 'answered' ? '답변완료' : '답변대기'}
                    </span>
                    <span className="text-[11px] text-toss-gray">{inquiry.createdAt.split(' ')[0]}</span>
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
          <form onSubmit={handleSubmit} className="bg-white rounded-toss p-6 shadow-sm border border-toss-border/40 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-toss-black mb-6">무엇을 도와드릴까요?</h2>
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold text-toss-gray mb-1.5 block">제목</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-toss-lightGray/50 border border-toss-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-toss-blue transition-colors"
                  placeholder="간략한 제목을 입력해주세요"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-toss-gray mb-1.5 block">문의 내용</label>
                <textarea 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-toss-lightGray/50 border border-toss-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-toss-blue transition-colors min-h-[160px]"
                  placeholder="상세한 내용을 입력해주시면 정확한 답변에 도움이 됩니다."
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-toss-blue text-white py-4 rounded-xl font-bold mt-4 shadow-lg shadow-toss-blue/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Send size={18} />
                보내기
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedInquiry(null)}>
          <div className="bg-white w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-1">
                <span className={`text-[10px] font-bold w-fit px-1.5 py-0.5 rounded ${selectedInquiry.status === 'answered' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                  {selectedInquiry.status === 'answered' ? '답변완료' : '답변대기'}
                </span>
                <h2 className="text-xl font-bold text-toss-black mt-2">{selectedInquiry.title}</h2>
                <span className="text-xs text-toss-gray">{selectedInquiry.createdAt}</span>
              </div>
              <button onClick={() => setSelectedInquiry(null)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors">
                <X size={24} className="text-toss-gray" />
              </button>
            </div>
            
            <div className="bg-toss-lightGray/30 p-4 rounded-2xl mb-6">
              <p className="text-[15px] text-toss-black leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.content}
              </p>
            </div>

            {selectedInquiry.status === 'answered' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-center gap-2 mb-3 text-toss-blue">
                  <CheckCircle2 size={18} />
                  <span className="font-bold text-sm">운영진 답변</span>
                  <span className="text-[11px] text-toss-gray font-normal ml-auto">{selectedInquiry.answeredAt}</span>
                </div>
                <div className="bg-blue-50/50 border border-toss-blue/10 p-4 rounded-2xl">
                  <p className="text-[15px] text-toss-black leading-relaxed whitespace-pre-wrap">
                    {selectedInquiry.answer}
                  </p>
                </div>
              </div>
            )}

            <button onClick={() => setSelectedInquiry(null)} className="w-full bg-toss-blue text-white font-bold py-4 rounded-xl active:scale-95 transition-all mt-8">닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
