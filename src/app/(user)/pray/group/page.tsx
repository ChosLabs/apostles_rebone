"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Search, Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase/client";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { PrayerRequest } from "@/types/database";
import { useAuth } from "@/components/providers/AuthProvider";
import { togglePrayLike } from "@/lib/services/prayService";

export default function GroupPrayersPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [groupPrayers, setGroupPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.group) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "prayers"), 
      where("group", "==", user.group.toString()),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PrayerRequest[];
      setGroupPrayers(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.group]);

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

  const filteredPrayers = groupPrayers.filter(p => 
    p.userName.includes(searchTerm) || p.content.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-toss-lightGray pb-20">
      <header className="bg-white sticky top-0 z-50 border-b border-toss-border h-12 flex items-center px-4">
        <Link href="/pray" className="p-2 -ml-2"><ChevronLeft size={20} /></Link>
        <h1 className="flex-1 text-center font-bold text-[15px] mr-8">우리 조 기도제목</h1>
      </header>
      
      <main className="p-4 space-y-3 max-w-[420px] mx-auto">
        <div className="bg-toss-blue/5 p-4 rounded-xl mb-4 border border-toss-blue/10">
          <p className="text-xs text-toss-blue font-bold text-center">
            {user?.group ? `${user.group}조의 기도 소리` : "배정된 조가 없습니다"}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-toss-gray" />
          <input 
            type="text" 
            placeholder="이름 또는 내용으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-toss-border/40 text-sm focus:ring-1 focus:ring-toss-blue outline-none transition-all shadow-sm"
          />
        </div>

        {!user?.group ? (
          <div className="py-20 text-center text-toss-gray text-sm bg-white rounded-3xl border border-dashed border-toss-border/60">
            조 배정 후 이용 가능합니다.
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-toss-gray/40">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-sm font-medium">조 기도제목을 불러오는 중...</p>
          </div>
        ) : filteredPrayers.length > 0 ? (
          filteredPrayers.map(p => {
            const hasPrayed = user ? p.likes?.includes(user.uid) : false;
            return (
              <div key={p.id} className="bg-white p-5 rounded-toss shadow-sm border border-toss-border/40 animate-in fade-in duration-500">
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
                <p className="text-[14px] text-toss-black leading-relaxed mb-4 whitespace-pre-wrap">{p.content}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-toss-blue font-bold">
                    {p.likes?.length || 0}명이 함께 기도함
                  </span>
                  <button 
                    onClick={() => handlePray(p.id, !!hasPrayed)}
                    className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all ${
                      hasPrayed 
                      ? "text-red-500 bg-red-50" 
                      : "text-toss-blue bg-toss-blue/5"
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
          <div className="py-20 text-center text-toss-gray text-sm bg-white rounded-3xl border border-dashed border-toss-border/60">
            {searchTerm ? "검색 결과가 없습니다." : "우리 조의 첫 번째 기도제목을 올려보세요!"}
          </div>
        )}
      </main>
    </div>
  );
}
