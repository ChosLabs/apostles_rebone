"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Edit2, Trash2, Search, Heart, X, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase/client";
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { PrayerRequest } from "@/types/database";
import { useAuth } from "@/components/providers/AuthProvider";

export default function MyPrayersPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerRequest | null>(null);
  const [myPrayers, setMyPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "prayers"), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PrayerRequest[];
      setMyPrayers(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, "prayers", id));
      alert("삭제되었습니다.");
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

  const filteredPrayers = myPrayers.filter(p => p.content.includes(searchTerm));

  return (
    <div className="min-h-screen bg-toss-lightGray dark:bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white dark:bg-surface px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
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
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-surface border border-toss-border/40 text-sm focus:ring-1 focus:ring-toss-blue outline-none transition-all shadow-sm"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-toss-gray/40">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-sm font-medium">나의 기도제목을 불러오는 중...</p>
          </div>
        ) : filteredPrayers.length > 0 ? (
          filteredPrayers.map(p => (
            <div 
              key={p.id} 
              onClick={() => setSelectedPrayer(p)}
              className="bg-white dark:bg-surface p-5 rounded-toss shadow-sm border border-toss-border/40 flex justify-between items-start gap-3 active:scale-[0.98] transition-all cursor-pointer animate-in fade-in duration-500"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[15px] text-toss-black leading-relaxed mb-3 whitespace-pre-wrap">{p.content}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-toss-gray font-medium">{formatDate(p.createdAt)}</span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-toss-blue bg-toss-blue/5 px-2 py-0.5 rounded-full">
                    <Heart size={10} fill="currentColor" />
                    함께 기도 {p.likes?.length || 0}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
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
          <div className="py-20 text-center text-toss-gray text-sm bg-white dark:bg-surface rounded-3xl border border-dashed border-toss-border/60">
            {searchTerm ? "검색 결과가 없습니다." : "등록된 기도제목이 없습니다."}
          </div>
        )}
      </main>

      {/* Details Modal */}
      {selectedPrayer && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedPrayer(null)}>
          <div className="bg-white dark:bg-surface w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-toss-blue">기도 요약</span>
                <h2 className="text-lg font-bold text-toss-black flex items-center gap-2">
                  총 {selectedPrayer.likes?.length || 0}명이 함께 기도함
                  <Heart size={16} className="text-red-400" fill="currentColor" />
                </h2>
              </div>
              <button onClick={() => setSelectedPrayer(null)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors">
                <X size={24} className="text-toss-gray" />
              </button>
            </div>

            <div className="py-4 text-[15px] text-toss-gray leading-relaxed whitespace-pre-wrap mb-8">
              {selectedPrayer.content}
            </div>

            <button onClick={() => setSelectedPrayer(null)} className="w-full bg-toss-blue text-white font-bold py-4 rounded-xl active:scale-95 transition-all">닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
