"use client";

import { useState } from "react";
import { ChevronLeft, Search } from "lucide-react";
import Link from "next/link";

export default function GroupPrayersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const groupPrayers = [
    { id: 1, author: "김철수", content: "우리 21조원들 모두가 서로 깊이 알아가고 사랑하는 시간 되길 소망합니다.", time: "1시간 전" },
    { id: 2, author: "이영희", content: "모든 일정 가운데 안전하게 지켜주시고 날씨도 주관해주세요.", time: "3시간 전" },
    { id: 3, author: "익명", content: "조별 미션 때 우리 조가 가장 행복한 조가 되었으면 좋겠습니다!", time: "어제" },
  ];

  const filteredPrayers = groupPrayers.filter(p => 
    p.author.includes(searchTerm) || p.content.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-toss-lightGray pb-20">
      <header className="bg-white sticky top-0 z-50 border-b border-toss-border h-12 flex items-center px-4">
        <Link href="/pray" className="p-2 -ml-2"><ChevronLeft size={20} /></Link>
        <h1 className="flex-1 text-center font-bold text-[15px] mr-8">우리 조 기도제목</h1>
      </header>
      
      <main className="p-4 space-y-3 max-w-[420px] mx-auto">
        <div className="bg-toss-blue/5 p-4 rounded-xl mb-4 border border-toss-blue/10">
          <p className="text-xs text-toss-blue font-bold text-center">21조의 기도 소리</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-toss-gray" />
          <input 
            type="text" 
            placeholder="이름 또는 내용으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-toss-border/40 text-sm focus:ring-1 focus:ring-toss-blue outline-none transition-all"
          />
        </div>

        {filteredPrayers.length > 0 ? (
          filteredPrayers.map(p => (
            <div key={p.id} className="bg-white p-5 rounded-toss shadow-sm border border-toss-border/40">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-toss-black">{p.author}</span>
                <span className="text-[10px] text-toss-gray">{p.time}</span>
              </div>
              <p className="text-[14px] text-toss-gray leading-relaxed">{p.content}</p>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-toss-gray text-sm">
            검색 결과가 없습니다.
          </div>
        )}
      </main>
    </div>
  );
}
