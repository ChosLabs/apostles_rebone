"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function MyPrayersPage() {
  const myPrayers = [
    { id: 1, content: "수련회 기간 동안 하나님을 깊이 만나는 시간 되게 해주세요.", time: "방금" },
    { id: 2, content: "가족들의 건강과 평안을 위해 기도합니다.", time: "어제" },
  ];

  return (
    <div className="min-h-screen bg-toss-lightGray pb-20">
      <header className="bg-white sticky top-0 z-50 border-b border-toss-border h-12 flex items-center px-4">
        <Link href="/pray" className="p-2 -ml-2"><ChevronLeft size={20} /></Link>
        <h1 className="flex-1 text-center font-bold text-[15px] mr-8">나의 기도제목</h1>
      </header>
      <main className="p-4 space-y-3 max-w-[420px] mx-auto">
        {myPrayers.map(p => (
          <div key={p.id} className="bg-white p-5 rounded-toss shadow-sm border border-toss-border/40">
            <p className="text-[15px] text-toss-black leading-relaxed mb-2">{p.content}</p>
            <span className="text-[11px] text-toss-gray font-medium">{p.time}</span>
          </div>
        ))}
      </main>
    </div>
  );
}
