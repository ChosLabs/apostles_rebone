"use client";

import { useState } from "react";
import { Image as ImageIcon, Plus, Trash2, ArrowLeft, Upload, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const MOCK_PHOTOS = [
  { id: 1, url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=60", author: "김철수", date: "2026.05.01" },
  { id: 2, url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=60", author: "이영희", date: "2026.05.01" },
];

export default function AdminGalleryPage() {
  const [photos, setPhotos] = useState(MOCK_PHOTOS);
  const [isUploading, setIsUploading] = useState(false);

  const handleDelete = (id: number) => {
    if (confirm("사진을 삭제하시겠습니까?")) {
      setPhotos(photos.filter(p => p.id !== id));
    }
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      alert("사진이 성공적으로 업로드되었습니다.");
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-toss-lightGray/30 pb-20">
      <header className="sticky top-0 z-50 bg-white px-5 py-4 flex items-center justify-between border-b border-toss-border/40">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
            <ArrowLeft size={24} className="text-toss-black" />
          </Link>
          <h1 className="text-lg font-bold text-toss-black">앨범 관리</h1>
        </div>
      </header>

      <main className="p-4 flex flex-col gap-6">
        <div className="bg-white rounded-toss p-8 border-2 border-dashed border-toss-border/60 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-toss-blue/5 text-toss-blue rounded-full flex items-center justify-center mb-4">
            <Upload size={32} />
          </div>
          <h2 className="text-base font-bold text-toss-black mb-1">새 사진 업로드</h2>
          <p className="text-xs text-toss-gray mb-6">PNG, JPG 파일을 끌어다 놓거나 클릭하세요</p>
          <button 
            onClick={simulateUpload}
            disabled={isUploading}
            className={`px-8 py-3 bg-toss-blue text-white rounded-xl font-bold text-sm shadow-lg shadow-toss-blue/20 active:scale-95 transition-all flex items-center gap-2 ${isUploading ? 'opacity-50' : ''}`}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                업로드 중...
              </>
            ) : (
              <>
                <Plus size={18} />
                파일 선택하기
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-toss-gray px-1 uppercase tracking-wider">업로드된 사진 ({photos.length})</h3>
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-toss-border/40 group relative">
                <img src={photo.url} alt="Uploaded" className="w-full aspect-square object-cover" />
                <div className="p-3">
                  <p className="text-[11px] font-bold text-toss-black truncate">{photo.author}</p>
                  <p className="text-[9px] text-toss-gray">{photo.date}</p>
                </div>
                <button 
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
