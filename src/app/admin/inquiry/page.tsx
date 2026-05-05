"use client";

import { useState } from "react";
import { MessageCircle, Send, Clock, CheckCircle2, ChevronRight, X, ArrowLeft, Search, Filter } from "lucide-react";
import Link from "next/link";

interface Inquiry {
  id: number;
  userName: string;
  userGroup: string;
  title: string;
  content: string;
  status: "pending" | "answered";
  createdAt: string;
  answer?: string;
  answeredAt?: string;
}

export default function AdminInquiryPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "answered">("all");

  const filteredInquiries = inquiries.filter(inquiry => {
    if (filter === "all") return true;
    return inquiry.status === filter;
  });

  const handleReply = () => {
    if (!selectedInquiry || !answerText) return;

    const updatedInquiries = inquiries.map(inquiry => {
      if (inquiry.id === selectedInquiry.id) {
        return {
          ...inquiry,
          status: "answered" as const,
          answer: answerText,
          answeredAt: new Date().toLocaleString()
        };
      }
      return inquiry;
    });

    setInquiries(updatedInquiries);
    setAnswerText("");
    setSelectedInquiry(null);
    alert("답변이 전송되었습니다.");
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
        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-toss-gray" />
            <input 
              type="text" 
              placeholder="검색"
              className="bg-toss-lightGray/50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-toss-blue/20 outline-none w-64"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-white border border-toss-border/40 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none transition-colors"
          >
            <option value="all">전체 보기</option>
            <option value="pending">답변 대기</option>
            <option value="answered">답변 완료</option>
          </select>
        </div>
      </header>

      <main className="p-4 lg:p-8">
        <div className="grid grid-cols-1 gap-4">
          {filteredInquiries.map((inquiry) => (
            <div 
              key={inquiry.id} 
              onClick={() => setSelectedInquiry(inquiry)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-toss-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:shadow-md active:scale-[0.99] transition-all"
            >
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${inquiry.status === 'answered' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    {inquiry.status === 'answered' ? '답변완료' : '답변대기'}
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
                  {inquiry.status === 'answered' && <p className="text-[10px] text-green-600 font-bold mt-0.5">답변일: {inquiry.answeredAt?.split(' ')[0]}</p>}
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

      {/* Reply Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedInquiry(null)}>
          <div className="bg-white w-full max-w-[600px] rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${selectedInquiry.status === 'answered' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    {selectedInquiry.status === 'answered' ? '답변완료' : '답변대기'}
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
              <p className="text-base text-toss-black leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.content}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold text-toss-black flex items-center gap-2">
                <CheckCircle2 size={18} className="text-toss-blue" />
                답변 작성
              </h4>
              <textarea 
                value={selectedInquiry.status === 'answered' ? selectedInquiry.answer : answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                readOnly={selectedInquiry.status === 'answered'}
                className={`w-full bg-toss-lightGray/50 border border-toss-border/40 rounded-2xl px-6 py-5 text-base focus:outline-none focus:border-toss-blue transition-colors min-h-[200px] ${selectedInquiry.status === 'answered' ? 'opacity-70' : ''}`}
                placeholder="참가자에게 전달할 답변을 입력하세요."
              />
              {selectedInquiry.status === 'pending' && (
                <button 
                  onClick={handleReply}
                  className="w-full bg-toss-blue text-white py-5 rounded-2xl font-bold mt-4 shadow-xl shadow-toss-blue/20 active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
                >
                  <Send size={22} />
                  답변 완료하기
                </button>
              )}
              {selectedInquiry.status === 'answered' && (
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
