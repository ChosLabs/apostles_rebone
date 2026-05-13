"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Bell, 
  Clock, 
  AlertCircle,
} from "lucide-react";
import { db } from "@/lib/firebase/client";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";
import { Notice } from "@/types/database";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type NoticeType = "일반" | "시간" | "긴급";

export default function AdminNoticesPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<NoticeType>("일반");

  useEffect(() => {
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notice[];
      setNotices(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (notice: Notice) => {
    setEditingId(notice.id);
    setTitle(notice.title);
    setContent(notice.content);
    setType(notice.type);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "notices", editingId), {
          title,
          content,
          type,
          updatedAt: serverTimestamp(),
        });
        alert("수정되었습니다.");
      } else {
        // resetForm()이 호출되기 전에 title 캡처
        const noticeTitle = title;
        await addDoc(collection(db, "notices"), {
          title,
          content,
          type,
          createdAt: serverTimestamp(),
          author: "관리자",
        });
        resetForm();
        // 푸시 알림 전송 (공지 저장 완료 후, 별도 try-catch로 독립 처리)
        try {
          const res = await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "📢 공지", body: noticeTitle, source: "notice" }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.error("[FCM] notice push failed:", err);
            alert(`공지 등록 완료\n알림 전송 실패: ${err.error ?? res.status}`);
          } else {
            alert("등록되었습니다.");
          }
        } catch (e) {
          console.error("[FCM] notice push network error:", e);
          alert("공지 등록 완료\n알림 전송 중 네트워크 오류가 발생했습니다.");
        }
        return; // resetForm은 위에서 이미 호출
      }
      resetForm();
    } catch (error: any) {
      console.error("Error saving notice:", error);
      alert(`저장 실패: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setType("일반");
    setEditingId(null);
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, "notices", id));
    } catch (error) {
      console.error("Error deleting notice:", error);
    }
  };

  const filteredNotices = notices.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          onClick={() => { resetForm(); setIsAdding(true); }}
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
          <p className="text-lg lg:text-xl font-black text-toss-black">{notices.length}건</p>
        </div>
        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-toss-border shadow-sm border-l-4 border-l-red-500">
          <p className="text-[10px] lg:text-xs font-bold text-red-500 mb-1">긴급 공지</p>
          <p className="text-lg lg:text-xl font-black text-toss-black">
            {notices.filter(n => n.type === "긴급").length}건
          </p>
        </div>
        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-toss-border shadow-sm border-l-4 border-l-green-500">
          <p className="text-[10px] lg:text-xs font-bold text-green-500 mb-1">시간 관련</p>
          <p className="text-lg lg:text-xl font-black text-toss-black">
            {notices.filter(n => n.type === "시간").length}건
          </p>
        </div>
      </div>

      {/* Notice Registration Form */}
      {isAdding && (
        <div className="bg-white p-8 rounded-2xl border border-toss-blue shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-toss-black">
              {editingId ? "공지사항 수정" : "새 공지사항 등록"}
            </h2>
            <button onClick={resetForm} className="text-toss-gray hover:text-toss-black">닫기</button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-toss-gray px-1">제목</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="공지사항 제목을 입력하세요"
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue focus:ring-1 focus:ring-toss-blue outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-toss-gray px-1">분류</label>
                <div className="flex gap-2">
                  {(["일반", "시간", "긴급"] as NoticeType[]).map((t) => (
                    <label key={t} className="flex-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="type" 
                        value={t} 
                        className="sr-only peer" 
                        checked={type === t}
                        onChange={() => setType(t)}
                      />
                      <div className="py-3 text-center rounded-xl border border-toss-border peer-checked:border-toss-blue peer-checked:bg-toss-blue/5 peer-checked:text-toss-blue font-bold text-sm transition-all hover:bg-toss-lightGray">
                        {t}
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
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="공지 내용을 입력하세요. 상세 모달에서 전체 내용이 표시됩니다."
                className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue focus:ring-1 focus:ring-toss-blue outline-none transition-all resize-none"
                required
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={resetForm}
                className="px-6 py-3 rounded-xl font-bold text-toss-gray hover:bg-toss-lightGray transition-all"
              >
                취소
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl font-bold text-white bg-toss-blue hover:bg-toss-blue/90 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "처리 중..." : (editingId ? "수정하기" : "등록하기")}
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-toss-gray text-sm">로딩 중...</td>
                </tr>
              ) : filteredNotices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-toss-gray text-sm">
                    {searchTerm ? "검색 결과가 없습니다." : "등록된 공지사항이 없습니다."}
                  </td>
                </tr>
              ) : (
                filteredNotices.map((notice) => (
                  <tr key={notice.id} className="hover:bg-toss-lightGray/30 transition-colors group">
                    <td className="px-4 lg:px-6 py-4">
                      <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap", getTypeStyles(notice.type))}>
                        {getTypeIcon(notice.type)}
                        {notice.type}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 min-w-[200px]">
                      <p className="text-sm font-bold text-toss-black">{notice.title}</p>
                      <p className="text-[11px] text-toss-gray mt-0.5 line-clamp-1">{notice.content}</p>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm text-toss-gray whitespace-nowrap">
                      {formatDate(notice.createdAt)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 sm:gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(notice)}
                          className="p-1.5 lg:p-2 text-toss-gray hover:text-toss-blue hover:bg-toss-blue/5 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(notice.id)}
                          className="p-1.5 lg:p-2 text-toss-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
