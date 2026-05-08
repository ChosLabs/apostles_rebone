"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, ArrowLeft, ExternalLink, Globe, Camera } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase/client";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { GalleryLink as GalleryLinkType } from "@/types/database";

export default function GalleryPage() {
  const [links, setLinks] = useState<GalleryLinkType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "gallery_links"), 
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryLinkType[];
      setLinks(docs);
      setLoading(false);
    }, () => setLoading(false));

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F4F6] dark:bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white dark:bg-surface px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
        <Link href="/" className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
          <ArrowLeft size={24} className="text-toss-black" />
        </Link>
        <h1 className="text-lg font-bold text-toss-black">포토 앨범</h1>
      </header>

      <main className="p-4 flex flex-col gap-4">
        <div className="bg-white dark:bg-surface rounded-3xl p-6 shadow-sm border border-toss-border/40">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-toss-blue/10 text-toss-blue rounded-full flex items-center justify-center">
              <Camera size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-toss-black">수련회 추억 나누기</h2>
              <p className="text-xs text-toss-gray">우리의 소중한 순간들을 앨범으로 확인해보세요.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <h3 className="text-xs font-bold text-toss-gray px-1 uppercase tracking-wider">앨범 목록</h3>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-toss-gray/40">
              <div className="w-8 h-8 border-2 border-toss-blue/30 border-t-toss-blue rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-medium">앨범을 불러오는 중...</p>
            </div>
          ) : links.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-surface rounded-3xl border border-dashed border-toss-border/60 text-center px-6">
              <div className="w-12 h-12 bg-toss-lightGray rounded-full flex items-center justify-center text-toss-gray/30 mb-3">
                <ImageIcon size={24} />
              </div>
              <p className="text-sm font-bold text-toss-black mb-1">아직 등록된 앨범이 없습니다</p>
              <p className="text-xs text-toss-gray">수련회 기간 동안 멋진 사진들이 업로드될 예정입니다!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {links.map((link) => (
                <a 
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white dark:bg-surface p-5 rounded-3xl shadow-sm border border-toss-border/40 flex items-center justify-between hover:bg-toss-lightGray/30 active:scale-[0.98] transition-all group"
                >
                  <div className="flex flex-col gap-1 pr-4">
                    <h4 className="text-base font-bold text-toss-black group-hover:text-toss-blue transition-colors">
                      {link.title}
                    </h4>
                    {link.description && (
                      <p className="text-xs text-toss-gray line-clamp-1">{link.description}</p>
                    )}
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-[#F2F4F6] dark:bg-toss-lightGray rounded-full flex items-center justify-center text-toss-gray group-hover:bg-toss-blue/10 group-hover:text-toss-blue transition-all">
                    <ExternalLink size={18} />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 py-8 text-center">
          <p className="text-[11px] text-toss-gray">
            사진 업로드는 각 앨범 링크(구글 포토 등)의<br />
            권한 설정에 따라 다를 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
}
