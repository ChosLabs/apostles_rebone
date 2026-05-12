"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, X, Megaphone } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase/client";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useReadNotices } from "@/lib/hooks/useReadNotices";

import { Notice } from "@/types/database";

export default function NoticesList({ initialNotices }: { initialNotices: Notice[] }) {
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const { markAsRead, isUnread } = useReadNotices();

  useEffect(() => {
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedNotices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notice[];
      setNotices(updatedNotices);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    // Handle both ISO string (from SSR) and Firestore Timestamp (from real-time)
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
  };

  return (
    <div className="min-h-screen bg-toss-lightGray dark:bg-background pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-surface sticky top-0 z-50 border-b border-toss-border">
        <div className="max-w-[420px] mx-auto flex items-center h-12 px-4">
          <Link href="/" className="p-2 -ml-2 hover:bg-toss-lightGray rounded-full transition-colors">
            <ChevronLeft size={20} className="text-toss-black" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[15px] mr-8">공지사항</h1>
        </div>
      </div>

      <main className="max-w-[420px] mx-auto p-4">
        <div className="bg-white dark:bg-surface rounded-toss overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-toss-border/40">
          {notices.map((notice, idx) => {
            const unread = isUnread(notice.id);
            return (
              <div
                key={notice.id}
                className={`p-5 flex flex-col gap-1 active:bg-toss-lightGray transition-colors cursor-pointer ${
                  idx !== notices.length - 1 ? 'border-b border-toss-border/40' : ''
                }`}
                onClick={() => { setSelectedNotice(notice); markAsRead(notice.id); }}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    {notice.type === "긴급" && <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                    {notice.type !== "긴급" && unread && <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></span>}
                    <span className={`text-[15px] font-bold ${unread ? 'text-toss-black' : 'text-toss-black/50'}`}>
                      {notice.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-toss-gray font-medium">{formatDate(notice.createdAt)}</span>
                </div>
                <p className="text-sm text-toss-gray truncate">{notice.content}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 opacity-30">
          <Megaphone size={24} className="text-toss-gray" />
          <p className="text-xs font-medium">새로운 소식을 확인해 보세요</p>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedNotice(null)}>
          <div 
            className="bg-white dark:bg-surface w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-toss-blue">{formatDate(selectedNotice.createdAt)}</span>
                <h2 className="text-xl font-bold text-toss-black leading-tight">{selectedNotice.title}</h2>
              </div>
              <button onClick={() => setSelectedNotice(null)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors">
                <X size={24} className="text-toss-gray" />
              </button>
            </div>
            <div className="text-base text-toss-gray leading-relaxed whitespace-pre-wrap py-4 mb-6">
              {selectedNotice.content}
            </div>
            <button 
              onClick={() => setSelectedNotice(null)}
              className="w-full bg-toss-blue text-white font-bold py-4 rounded-xl transition-transform active:scale-95"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
