"use client";

import { ChevronLeft, Heart } from "lucide-react";
import Link from "next/link";

export default function AllPrayersPage() {
  const allPrayers = [
    { id: 1, author: "익명", content: "취업 준비 기간이 길어지면서 마음이 많이 지쳐있습니다. 결과와 상관없이 주님이 주시는 평안함을 누리며 끝까지 신뢰하며 나아갈 수 있도록 기도 부탁드립니다.", time: "10분 전" },
    { id: 2, author: "박지민", content: "이번 수련회 기간 동안 모든 참석자들이 아프지 않고 건강하게 은혜 받는 시간 될 수 있도록 함께 기도해주세요!", time: "1시간 전" },
    { id: 3, author: "김은혜", content: "오랜만에 만나는 조원들과 서먹함 없이 깊은 교제를 나눌 수 있기를 소망합니다.", time: "3시간 전" },
    { id: 4, author: "익명", content: "모든 예배 시간마다 성령의 강력한 임재가 있기를 기도합니다.", time: "어제" },
  ];

  return (
    <div className="min-h-screen bg-toss-lightGray pb-20">
      <header className="bg-white sticky top-0 z-50 border-b border-toss-border h-12 flex items-center px-4">
        <Link href="/pray" className="p-2 -ml-2"><ChevronLeft size={20} /></Link>
        <h1 className="flex-1 text-center font-bold text-[15px] mr-8">모두의 기도제목</h1>
      </header>
      <main className="p-4 space-y-3 max-w-[420px] mx-auto">
        {allPrayers.map(p => (
          <div key={p.id} className="bg-white p-5 rounded-toss shadow-sm border border-toss-border/40">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold ${p.author === '익명' ? 'text-toss-gray' : 'text-toss-black'}`}>
                {p.author}
              </span>
              <span className="text-[10px] text-toss-gray">{p.time}</span>
            </div>
            <p className="text-[14px] text-toss-black leading-relaxed mb-3">{p.content}</p>
            <div className="flex justify-end">
              <button className="flex items-center gap-1.5 text-[11px] font-bold text-toss-blue bg-toss-blue/5 px-3 py-1.5 rounded-lg active:scale-95 transition-all">
                <Heart size={12} fill="currentColor" />
                함께 기도하기
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
