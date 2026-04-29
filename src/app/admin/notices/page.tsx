"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Bell, 
  Clock, 
  AlertCircle,
  ChevronRight
} from "lucide-react";

type NoticeType = "일반" | "시간" | "긴급";

interface Notice {
  id: number;
  title: string;
  content: string;
  type: NoticeType;
  createdAt: string;
}

export default function AdminNoticesPage() {
  const [isAdding, setIsAdding] = useState(false);
  
  // Mock data
  const [notices] = useState<Notice[]>([
    { id: 1, title: "🚌 버스 배정 안내", content: "내일 출발 버스 번호를 확인하세요...", type: "긴급", createdAt: "2026-06-04 14:00" },
    { id: 2, title: "🍽️ 1일차 식사 안내", content: "5일 점심은 12:00~13:00입니다...", type: "시간", createdAt: "2026-06-04 12:00" },
    { id: 3, title: "📋 수련회 준비물 체크리스트", content: "성경책, 필기도구, 여벌 옷...", type: "일반", createdAt: "2026-06-03 09:00" },
  ]);

  const getTypeStyles = (type: NoticeType) => {
    switch (type) {
      case "긴급": return "bg-red-50 text-red-600 border-red-100";
      case "시간": return "bg-green-50 text-green-600 border-green-100";
      default: return "bg-toss-blue/5 text-toss-blue border-toss-blue/10";
    }
  };

  const getTypeIcon = (type: NoticeType) => {
    switch (type) {
      case "긴급": return <AlertCircle size={14} />;
      case "시간": return <Clock size={14} />;
      default: return <Bell size={14} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-toss-black">공지사항 관리</h1>
          <p className="text-xs lg:text-sm text-toss-gray mt-1">참석자들에게 전달할 공지사항을 등록하고 관리합니다.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-toss-blue text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-toss-blue/90 transition-all shadow-sm shadow-toss-blue/20 text-sm lg:text-base"
        >
          <Plus size={20} />
          새 공지 등록
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-toss-border shadow-sm">
          <p className="text-[10px] lg:text-xs font-bold text-toss-gray mb-1">전체 공지</p>
          <p className="text-lg lg:text-xl font-black text-toss-black">24건</p>
        </div>
        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-toss-border shadow-sm border-l-4 border-l-red-500">
          <p className="text-[10px] lg:text-xs font-bold text-red-500 mb-1">긴급 공지</p>
          <p className="text-lg lg:text-xl font-black text-toss-black">2건</p>
        </div>
        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-toss-border shadow-sm border-l-4 border-l-green-500">
          <p className="text-[10px] lg:text-xs font-bold text-green-500 mb-1">시간 관련</p>
          <p className="text-lg lg:text-xl font-black text-toss-black">8건</p>
        </div>
      </div>

      {/* Notice Registration Form (Modal or Inline) */}
      {isAdding && (
        <div className="bg-white p-8 rounded-2xl border border-toss-blue shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-toss-black">새 공지사항 등록</h2>
            <button onClick={() => setIsAdding(false)} className="text-toss-gray hover:text-toss-black">닫기</button>
          </div>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-toss-gray px-1">제목</label>
                <input 
                  type="text" 
                  placeholder="공지사항 제목을 입력하세요"
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue focus:ring-1 focus:ring-toss-blue outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-toss-gray px-1">분류</label>
                <div className="flex gap-2">
                  {(["일반", "시간", "긴급"] as NoticeType[]).map((type) => (
                    <label key={type} className="flex-1 cursor-pointer">
                      <input type="radio" name="type" value={type} className="sr-only peer" defaultChecked={type === "일반"} />
                      <div className="py-3 text-center rounded-xl border border-toss-border peer-checked:border-toss-blue peer-checked:bg-toss-blue/5 peer-checked:text-toss-blue font-bold text-sm transition-all hover:bg-toss-lightGray">
                        {type}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-toss-gray px-1">내용</label>
              <textarea 
                rows={5}
                placeholder="공지 내용을 입력하세요. 상세 모달에서 전체 내용이 표시됩니다."
                className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue focus:ring-1 focus:ring-toss-blue outline-none transition-all resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 py-3 rounded-xl font-bold text-toss-gray hover:bg-toss-lightGray transition-all"
              >
                취소
              </button>
              <button 
                type="submit"
                className="px-8 py-3 rounded-xl font-bold text-white bg-toss-blue hover:bg-toss-blue/90 transition-all"
              >
                등록하기
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History List */}
      <div className="bg-white rounded-2xl border border-toss-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-toss-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-toss-black">공지 히스토리</h3>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-toss-gray" />
            <input 
              type="text" 
              placeholder="공지 제목 검색..."
              className="pl-10 pr-4 py-2 bg-toss-lightGray border-none rounded-lg text-sm focus:ring-1 focus:ring-toss-blue outline-none w-full md:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-toss-lightGray/50 text-toss-gray text-[10px] lg:text-xs font-bold uppercase tracking-wider">
                <th className="px-4 lg:px-6 py-4">유형</th>
                <th className="px-4 lg:px-6 py-4">제목</th>
                <th className="px-4 lg:px-6 py-4">등록일시</th>
                <th className="px-4 lg:px-6 py-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-toss-border">
              {notices.map((notice) => (
                <tr key={notice.id} className="hover:bg-toss-lightGray/30 transition-colors group">
                  <td className="px-4 lg:px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${getTypeStyles(notice.type)}`}>
                      {getTypeIcon(notice.type)}
                      {notice.type}
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 min-w-[200px]">
                    <p className="text-sm font-bold text-toss-black">{notice.title}</p>
                    <p className="text-[11px] text-toss-gray mt-0.5 line-clamp-1">{notice.content}</p>
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm text-toss-gray whitespace-nowrap">
                    {notice.createdAt}
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 sm:gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 lg:p-2 text-toss-gray hover:text-toss-blue hover:bg-toss-blue/5 rounded-lg transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-1.5 lg:p-2 text-toss-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-toss-border flex justify-center">
          <nav className="flex items-center gap-1">
            {[1, 2, 3].map((p) => (
              <button key={p} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${p === 1 ? 'bg-toss-blue text-white' : 'text-toss-gray hover:bg-toss-lightGray'}`}>
                {p}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
