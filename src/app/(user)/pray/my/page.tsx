"use client";

import { useState } from "react";
import { ChevronLeft, Edit2, Trash2, Search, Heart, X, User } from "lucide-react";
import Link from "next/link";

interface MyPrayer {
  id: number;
  content: string;
  time: string;
  prayerCount: number;
  prayedUsers: string[];
}

export default function MyPrayersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrayer, setSelectedPrayer] = useState<MyPrayer | null>(null);
  const [myPrayers, setMyPrayers] = useState<MyPrayer[]>([
    { 
      id: 1, 
      content: "수련회 기간 동안 하나님을 깊이 만나는 시간 되게 해주세요.", 
      time: "방금",
      prayerCount: 12,
      prayedUsers: ["박지민", "김은혜", "이철수", "최영희", "정본향", "강하늘", "윤서준", "임지우", "조예준", "한지아", "송민호", "권다은"]
    },
    { 
      id: 2, 
      content: "가족들의 건강과 평안을 위해 기도합니다.", 
      time: "어제",
      prayerCount: 5,
      prayedUsers: ["김철수", "이영희", "박민준", "최서연", "정우성"]
    },
  ]);

  const filteredPrayers = myPrayers.filter(p => p.content.includes(searchTerm));

  const handleDelete = (id: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      setMyPrayers(myPrayers.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-toss-lightGray pb-20">
      <header className="bg-white sticky top-0 z-50 border-b border-toss-border h-12 flex items-center px-4">
        <Link href="/pray" className="p-2 -ml-2"><ChevronLeft size={20} /></Link>
        <h1 className="flex-1 text-center font-bold text-[15px] mr-8">나의 기도제목</h1>
      </header>
      
      <main className="p-4 space-y-3 max-w-[420px] mx-auto">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-toss-gray" />
          <input 
            type="text" 
            placeholder="내용으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-toss-border/40 text-sm focus:ring-1 focus:ring-toss-blue outline-none transition-all"
          />
        </div>

        {filteredPrayers.length > 0 ? (
          filteredPrayers.map(p => (
            <div 
              key={p.id} 
              onClick={() => setSelectedPrayer(p)}
              className="bg-white p-5 rounded-toss shadow-sm border border-toss-border/40 flex justify-between items-start gap-3 active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex-1">
                <p className="text-[15px] text-toss-black leading-relaxed mb-3">{p.content}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-toss-gray font-medium">{p.time}</span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-toss-blue bg-toss-blue/5 px-2 py-0.5 rounded-full">
                    <Heart size={10} fill="currentColor" />
                    함께 기도 {p.prayerCount}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button className="p-2 text-toss-gray hover:text-toss-blue transition-colors">
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(p.id)}
                  className="p-2 text-toss-gray hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-toss-gray text-sm">
            등록된 기도제목이 없습니다.
          </div>
        )}
      </main>

      {/* Details Modal */}
      {selectedPrayer && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedPrayer(null)}>
          <div className="bg-white w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-toss-blue">함께 기도한 사람들</span>
                <h2 className="text-lg font-bold text-toss-black flex items-center gap-2">
                  총 {selectedPrayer.prayerCount}명이 함께 기도함
                  <Heart size={16} className="text-red-400" fill="currentColor" />
                </h2>
              </div>
              <button onClick={() => setSelectedPrayer(null)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors">
                <X size={24} className="text-toss-gray" />
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3 mb-6">
                {selectedPrayer.prayedUsers.map((user, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-toss-lightGray/50 rounded-2xl border border-toss-border/20">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-toss-gray shadow-sm">
                      <User size={14} />
                    </div>
                    <span className="text-sm font-bold text-toss-black">{user}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setSelectedPrayer(null)} className="w-full bg-toss-blue text-white font-bold py-4 rounded-xl active:scale-95 transition-all">닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
