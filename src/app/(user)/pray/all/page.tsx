"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Heart, Search, Loader2, X } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase/client";
import { collection, query, where, orderBy, onSnapshot, limit } from "firebase/firestore";
import { PrayerRequest } from "@/types/database";
import { useAuth } from "@/components/providers/AuthProvider";
import { togglePrayLike } from "@/lib/services/prayService";

export default function AllPrayersPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [allPrayers, setAllPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerRequest | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "prayers"), 
      where("type", "==", "all"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PrayerRequest[];
      setAllPrayers(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePray = async (prayerId: string, hasPrayed: boolean) => {
    if (!user) return;
    try {
      await togglePrayLike(prayerId, user.uid, hasPrayed);
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const filteredPrayers = allPrayers.filter(p => 
    p.userName.includes(searchTerm) || p.content.includes(searchTerm) || p.userTeam?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-toss-lightGray dark:bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white dark:bg-surface px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
        <Link href="/pray" className="p-2 -ml-2"><ChevronLeft size={20} /></Link>
        <h1 className="flex-1 text-center font-bold text-[15px] mr-8">모두의 기도제목</h1>
      </header>
      
      <main className="p-4 space-y-3 max-w-[420px] mx-auto">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-toss-gray" />
          <input 
            type="text" 
            placeholder="이름, 팀 또는 내용으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-surface border border-toss-border/40 text-sm focus:ring-1 focus:ring-toss-blue outline-none transition-all shadow-sm"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-toss-gray/40">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-sm font-medium">기도제목을 불러오는 중...</p>
          </div>
        ) : filteredPrayers.length > 0 ? (
          filteredPrayers.map(p => {
            const hasPrayed = user ? p.likes?.includes(user.uid) : false;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPrayer(p)}
                className="bg-white dark:bg-surface p-5 rounded-toss shadow-sm border border-toss-border/40 animate-in fade-in duration-500 cursor-pointer active:scale-[0.98] transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[13px] font-bold ${p.userName === '익명' ? 'text-toss-gray' : 'text-toss-black'}`}>
                      {p.userName}
                    </span>
                    {(p.userTeam || p.userBirthYear) && (
                      <span className="text-[10px] text-toss-gray font-medium px-1.5 py-0.5 bg-toss-lightGray rounded">
                        {p.userTeam} {p.userBirthYear && `· ${p.userBirthYear}또래`}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-toss-gray/60">{formatDate(p.createdAt)}</span>
                </div>
                <p className="text-[14px] text-toss-black leading-relaxed mb-4 whitespace-pre-wrap line-clamp-3">{p.content}</p>
                <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handlePray(p.id, !!hasPrayed)}
                    className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all ${
                      hasPrayed ? "text-red-500 bg-red-50" : "text-toss-blue bg-toss-blue/5"
                    }`}
                  >
                    <Heart size={12} fill={hasPrayed ? "currentColor" : "none"} />
                    {hasPrayed ? "기도했습니다" : "함께 기도하기"}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center text-toss-gray text-sm bg-white dark:bg-surface rounded-3xl border border-dashed border-toss-border/60">
            {searchTerm ? "검색 결과가 없습니다." : "아직 등록된 기도제목이 없습니다."}
          </div>
        )}
      </main>
      {selectedPrayer && (() => {
        const currentPrayer = allPrayers.find(p => p.id === selectedPrayer.id) ?? selectedPrayer;
        const hasPrayed = user ? currentPrayer.likes?.includes(user.uid) : false;
        return (
          <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedPrayer(null)}>
            <div className="bg-white dark:bg-surface w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[14px] font-bold ${currentPrayer.userName === '익명' ? 'text-toss-gray' : 'text-toss-black'}`}>
                    {currentPrayer.userName}
                  </span>
                  {(currentPrayer.userTeam || currentPrayer.userBirthYear) && (
                    <span className="text-[10px] text-toss-gray font-medium px-1.5 py-0.5 bg-toss-lightGray rounded">
                      {currentPrayer.userTeam} {currentPrayer.userBirthYear && `· ${currentPrayer.userBirthYear}또래`}
                    </span>
                  )}
                  <span className="text-[10px] text-toss-gray/60">{formatDate(currentPrayer.createdAt)}</span>
                </div>
                <button onClick={() => setSelectedPrayer(null)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors shrink-0">
                  <X size={20} className="text-toss-gray" />
                </button>
              </div>
              <p className="text-[15px] text-toss-black leading-relaxed whitespace-pre-wrap mb-6">{currentPrayer.content}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { handlePray(currentPrayer.id, !!hasPrayed); }}
                  className={`flex-1 flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl active:scale-95 transition-all text-sm ${
                    hasPrayed ? "text-red-500 bg-red-50" : "text-toss-blue bg-toss-blue/5"
                  }`}
                >
                  <Heart size={14} fill={hasPrayed ? "currentColor" : "none"} />
                  {hasPrayed ? "기도했습니다" : "함께 기도하기"}
                </button>
                <button onClick={() => setSelectedPrayer(null)} className="flex-1 bg-toss-lightGray text-toss-gray font-bold py-3.5 rounded-xl active:scale-95 transition-all text-sm">닫기</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
