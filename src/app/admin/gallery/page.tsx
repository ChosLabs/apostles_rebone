"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  ExternalLink,
  Link as LinkIcon,
  ToggleLeft,
  ToggleRight,
  Globe
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
import { GalleryLink } from "@/types/database";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminGalleryPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [links, setLinks] = useState<GalleryLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "gallery_links"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryLink[];
      setLinks(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (link: GalleryLink) => {
    setEditingId(link.id);
    setTitle(link.title);
    setUrl(link.url);
    setDescription(link.description || "");
    setIsActive(link.isActive);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "gallery_links", editingId), {
          title,
          url,
          description,
          isActive,
          updatedAt: serverTimestamp(),
        });
        alert("수정되었습니다.");
      } else {
        await addDoc(collection(db, "gallery_links"), {
          title,
          url,
          description,
          isActive,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        alert("등록되었습니다.");
      }
      resetForm();
    } catch (error: any) {
      console.error("Error saving gallery link:", error);
      alert(`저장 실패: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setUrl("");
    setDescription("");
    setIsActive(true);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, "gallery_links", id));
    } catch (error) {
      console.error("Error deleting gallery link:", error);
    }
  };

  const toggleActive = async (link: GalleryLink) => {
    try {
      await updateDoc(doc(db, "gallery_links", link.id), {
        isActive: !link.isActive,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error toggling link status:", error);
    }
  };

  const filteredLinks = links.filter(l => 
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-xl lg:text-2xl font-black text-toss-black">포토앨범 관리</h1>
          <p className="text-xs lg:text-sm text-toss-gray mt-1">외부 사진 앨범(구글 포토 등) 링크를 등록하고 관리합니다.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsAdding(true); }}
          className="bg-toss-blue text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-toss-blue/90 transition-all shadow-sm shadow-toss-blue/20 text-sm lg:text-base"
        >
          <Plus size={20} />
          새 앨범 링크 등록
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-toss-border shadow-sm">
          <p className="text-[10px] lg:text-xs font-bold text-toss-gray mb-1">전체 앨범</p>
          <p className="text-lg lg:text-xl font-black text-toss-black">{links.length}개</p>
        </div>
        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-toss-border shadow-sm border-l-4 border-l-toss-blue">
          <p className="text-[10px] lg:text-xs font-bold text-toss-blue mb-1">활성화된 앨범</p>
          <p className="text-lg lg:text-xl font-black text-toss-black">
            {links.filter(l => l.isActive).length}개
          </p>
        </div>
      </div>

      {/* Link Registration Form */}
      {isAdding && (
        <div className="bg-white p-8 rounded-2xl border border-toss-blue shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-toss-black">
              {editingId ? "앨범 링크 수정" : "새 앨범 링크 등록"}
            </h2>
            <button onClick={resetForm} className="text-toss-gray hover:text-toss-black">닫기</button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-toss-gray px-1">앨범 제목</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 수련회 첫째 날 사진 모음"
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue focus:ring-1 focus:ring-toss-blue outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-toss-gray px-1">활성화 여부</label>
                <div 
                  onClick={() => setIsActive(!isActive)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border border-toss-border cursor-pointer transition-all",
                    isActive ? "bg-toss-blue/5 border-toss-blue text-toss-blue" : "bg-toss-lightGray/30 text-toss-gray"
                  )}
                >
                  {isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  <span className="font-bold text-sm">{isActive ? "사용 중" : "미사용"}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-toss-gray px-1">링크 주소 (URL)</label>
              <div className="relative">
                <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-toss-gray" />
                <input 
                  type="url" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://photos.google.com/..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue focus:ring-1 focus:ring-toss-blue outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-toss-gray px-1">설명 (선택사항)</label>
              <textarea 
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="앨범에 대한 간단한 설명을 입력하세요."
                className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue focus:ring-1 focus:ring-toss-blue outline-none transition-all resize-none"
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

      {/* Links List */}
      <div className="bg-white rounded-2xl border border-toss-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-toss-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-toss-black">앨범 링크 목록</h3>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-toss-gray" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="앨범 제목 검색..."
              className="pl-10 pr-4 py-2 bg-toss-lightGray border-none rounded-lg text-sm focus:ring-1 focus:ring-toss-blue outline-none w-full md:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-toss-lightGray/50 text-toss-gray text-[10px] lg:text-xs font-bold uppercase tracking-wider">
                <th className="px-4 lg:px-6 py-4">상태</th>
                <th className="px-4 lg:px-6 py-4">앨범 제목</th>
                <th className="px-4 lg:px-6 py-4">링크</th>
                <th className="px-4 lg:px-6 py-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-toss-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-toss-gray text-sm">로딩 중...</td>
                </tr>
              ) : filteredLinks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-toss-gray text-sm">
                    {searchTerm ? "검색 결과가 없습니다." : "등록된 앨범 링크가 없습니다."}
                  </td>
                </tr>
              ) : (
                filteredLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-toss-lightGray/30 transition-colors group">
                    <td className="px-4 lg:px-6 py-4">
                      <button 
                        onClick={() => toggleActive(link)}
                        className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap transition-all",
                          link.isActive 
                            ? "bg-toss-blue/5 text-toss-blue border-toss-blue/10" 
                            : "bg-toss-gray/10 text-toss-gray border-toss-gray/10"
                        )}
                      >
                        {link.isActive ? "사용 중" : "미사용"}
                      </button>
                    </td>
                    <td className="px-4 lg:px-6 py-4 min-w-[200px]">
                      <p className="text-sm font-bold text-toss-black">{link.title}</p>
                      {link.description && (
                        <p className="text-[11px] text-toss-gray mt-0.5 line-clamp-1">{link.description}</p>
                      )}
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-toss-blue hover:underline"
                      >
                        <Globe size={14} />
                        링크 열기
                        <ExternalLink size={12} />
                      </a>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 sm:gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(link)}
                          className="p-1.5 lg:p-2 text-toss-gray hover:text-toss-blue hover:bg-toss-blue/5 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(link.id)}
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
