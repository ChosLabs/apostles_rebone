"use client";

import { useState } from "react";
import { Image as ImageIcon, ArrowLeft, Upload, Heart, Download, MessageCircle } from "lucide-react";
import Link from "next/link";

const MOCK_PHOTOS = [
  { id: 1, url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=60", author: "김철수", likes: 24, comments: 5 },
  { id: 2, url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=60", author: "이영희", likes: 42, comments: 8 },
  { id: 3, url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=60", author: "박지민", likes: 15, comments: 2 },
  { id: 4, url: "https://images.unsplash.com/photo-1472653431158-6364773b2a56?w=800&auto=format&fit=crop&q=60", author: "최유나", likes: 31, comments: 4 },
  { id: 5, url: "https://images.unsplash.com/photo-1526721940322-10fb6e3ae94a?w=800&auto=format&fit=crop&q=60", author: "정호석", likes: 19, comments: 3 },
  { id: 6, url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=60", author: "강다니엘", likes: 56, comments: 12 },
];

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<typeof MOCK_PHOTOS[0] | null>(null);

  const handleUpload = () => {
    alert("준비 중인 기능입니다. 수련회 기간 중 활성화됩니다!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white px-5 py-4 flex items-center justify-between border-b border-toss-border/40">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
            <ArrowLeft size={24} className="text-toss-black" />
          </Link>
          <h1 className="text-lg font-bold text-toss-black">포토 앨범</h1>
        </div>
        <button 
          onClick={handleUpload}
          className="p-2 bg-toss-blue/10 text-toss-blue rounded-full active:scale-90 transition-all"
        >
          <Upload size={20} />
        </button>
      </header>

      <main className="p-4">
        <div className="grid grid-cols-2 gap-2">
          {MOCK_PHOTOS.map((photo) => (
            <div 
              key={photo.id} 
              className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer active:scale-95 transition-all shadow-sm"
              onClick={() => setSelectedImage(photo)}
            >
              <img 
                src={photo.url} 
                alt="Retreat photo" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <div className="flex items-center gap-2 text-white text-[10px] font-bold">
                  <div className="flex items-center gap-1">
                    <Heart size={10} className="fill-current" /> {photo.likes}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle size={10} className="fill-current" /> {photo.comments}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center py-10 text-center border-t border-toss-border/20">
          <div className="w-12 h-12 bg-toss-lightGray rounded-full flex items-center justify-center text-toss-gray/30 mb-3">
            <ImageIcon size={24} />
          </div>
          <p className="text-sm font-bold text-toss-black mb-1">모든 순간을 기록하세요</p>
          <p className="text-xs text-toss-gray">수련회의 소중한 추억들을 조원들과 나누어보세요.</p>
        </div>
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col" onClick={() => setSelectedImage(null)}>
          <header className="p-4 flex items-center justify-between text-white bg-black/50 backdrop-blur-md">
            <button onClick={() => setSelectedImage(null)} className="p-2">
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-4">
              <button className="p-2">
                <Download size={24} />
              </button>
            </div>
          </header>
          
          <div className="flex-1 flex items-center justify-center p-4">
            <img 
              src={selectedImage.url} 
              alt="Detail" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <footer className="p-6 bg-black/50 backdrop-blur-md text-white">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                  {selectedImage.author[0]}
                </div>
                <span className="font-bold">{selectedImage.author}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 font-bold">
                  <Heart size={20} className="text-rose-500 fill-current" /> {selectedImage.likes}
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <MessageCircle size={20} /> {selectedImage.comments}
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
