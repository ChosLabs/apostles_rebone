"use client";

import { useState, useRef } from "react";
import { ChevronLeft, MapPin, Utensils, Home, Church, Info, Navigation as NavIcon } from "lucide-react";
import Link from "next/link";

type Location = {
  id: string;
  name: string;
  category: "worship" | "food" | "housing" | "facility";
  desc: string;
  detail: string;
  coords: { x: number; y: number }; // Percentage for map marker
  icon: React.ReactNode;
};

const locations: Location[] = [
  { 
    id: "main-hall", 
    name: "컨벤션 센터 (대강당)", 
    category: "worship", 
    desc: "메인 집회 및 개회/파송예배", 
    detail: "리조트 중심부에 위치한 대형 컨벤션 센터입니다. 모든 공식 프로그램과 집회가 진행됩니다.",
    coords: { x: 38.3, y: 32.5 },
    icon: <Church size={18} />
  },
  { 
    id: "dining", 
    name: "플레이버스 (식당)", 
    category: "food", 
    desc: "아침, 점심, 저녁 식사 장소", 
    detail: "인터컨티넨탈 호텔 1층에 위치한 레스토랑입니다. 조별로 지정된 식사 시간을 준수해주세요.",
    coords: { x: 81.5, y: 62 },
    icon: <Utensils size={18} />
  },
  { 
    id: "holiday-inn", 
    name: "홀리데이 인 리조트", 
    category: "housing", 
    desc: "참석자 메인 숙소", 
    detail: "컨벤션 센터 바로 옆에 위치한 메인 호텔입니다. 1층 로비에서 체크인이 진행됩니다.",
    coords: { x: 48.6, y: 34.5 },
    icon: <Home size={18} />
  },
  { 
    id: "concert-hall", 
    name: "뮤직텐트", 
    category: "facility", 
    desc: "특별 활동 및 야외 공연", 
    detail: "야외 광장 옆에 위치한 대형 텐트 공연장입니다. 다양한 부스 활동과 특별 순서가 진행됩니다.",
    coords: { x: 27, y: 44.5 },
    icon: <Info size={18} />
  },
  { 
    id: "welcome-center", 
    name: "웰컴센터", 
    category: "facility", 
    desc: "종합 안내 및 물품 보관", 
    detail: "리조트 입구 부근에 위치해 있습니다. 도착 시 명찰 및 굿즈 수령을 위해 방문해주세요.",
    coords: { x: 77.5, y: 62.5 },
    icon: <MapPin size={18} />
  },
];

export default function ResortPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const selectedLocation = locations.find(l => l.id === selectedId);

  const handleLocationSelect = (id: string) => {
    setSelectedId(id);
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-toss-lightGray pb-24">
      <header className="bg-white sticky top-0 z-50 border-b border-toss-border h-12 flex items-center px-4">
        <Link href="/" className="p-2 -ml-2"><ChevronLeft size={20} /></Link>
        <h1 className="flex-1 text-center font-bold text-[15px] mr-8">리조트 안내</h1>
      </header>

      <main className="max-w-[420px] mx-auto p-4 space-y-6">
        {/* 1. Interactive Map Section */}
        <section ref={mapRef} className="space-y-3 scroll-mt-16">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[15px] font-bold text-toss-black">알펜시아 리조트 맵</h2>
            <span className="text-[10px] text-toss-blue font-bold bg-toss-blue/5 px-2 py-0.5 rounded-md italic">Pyeongchang</span>
          </div>
          
          <div className="relative aspect-[1020/512] bg-white rounded-3xl border border-toss-border shadow-sm overflow-hidden">
            {/* Real Map Image */}
            <img 
              src="/base_place.jpg" 
              alt="Alpensia Resort Map" 
              className="w-full h-full object-cover opacity-90"
            />
            
            {/* Interactive Pin Overlay */}
            <div className="absolute inset-0">
              {locations.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => handleLocationSelect(loc.id)}
                  className={`absolute -translate-x-1/2 -translate-y-full transition-all duration-300 group ${
                    selectedId === loc.id ? 'z-10' : 'z-0'
                  }`}
                  style={{ left: `${loc.coords.x}%`, top: `${loc.coords.y}%` }}
                >
                  <div className="relative">
                    <span 
                      className={`text-2xl drop-shadow-md block transition-transform ${
                        selectedId === loc.id ? 'scale-125 -translate-y-2' : 'scale-100 group-hover:scale-110 group-hover:-translate-y-1'
                      }`}
                    >
                      📍
                    </span>
                    {selectedId === loc.id && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-black/20 rounded-[100%] blur-[2px]"></span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Map UI Overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button className="bg-white/90 backdrop-blur-sm p-2 rounded-xl border border-toss-border shadow-sm text-toss-gray active:scale-95 transition-all">
                <NavIcon size={18} />
              </button>
            </div>
            
            {!selectedId && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-[11px] font-bold text-toss-gray bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-toss-border">아래 장소를 클릭해보세요</p>
              </div>
            )}
          </div>
        </section>

        {/* 2. Selected Location Preview */}
        <div className="h-28"> {/* Fixed height to prevent layout jump */}
          {selectedLocation ? (
            <div className="bg-toss-blue text-white p-5 rounded-3xl shadow-lg shadow-toss-blue/20 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    {selectedLocation.icon}
                  </div>
                  <h3 className="font-bold text-[16px]">{selectedLocation.name}</h3>
                </div>
                <button onClick={() => setSelectedId(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  <ChevronLeft size={16} className="rotate-90" />
                </button>
              </div>
              <p className="text-[13px] text-white/90 leading-relaxed font-medium">{selectedLocation.detail}</p>
            </div>
          ) : (
            <div className="bg-white/60 p-6 rounded-3xl border border-dashed border-toss-border/60 flex flex-col items-center justify-center text-center">
              <MapPin size={24} className="text-toss-gray/30 mb-2" />
              <p className="text-xs text-toss-gray font-medium">장소를 선택하면 상세 안내가 표시됩니다.</p>
            </div>
          )}
        </div>

        {/* 3. Location Categories */}
        <section className="space-y-3">
          <h2 className="text-[15px] font-bold text-toss-black px-1">주요 위치 안내</h2>
          <div className="grid grid-cols-1 gap-3">
            {locations.map(loc => (
              <div 
                key={loc.id}
                onClick={() => handleLocationSelect(loc.id)}
                className={`bg-white p-4 rounded-toss border transition-all active:scale-[0.98] cursor-pointer flex items-center gap-4 ${
                  selectedId === loc.id ? 'border-toss-blue ring-1 ring-toss-blue/10 shadow-md' : 'border-toss-border/40 shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedId === loc.id ? 'bg-toss-blue text-white' : 'bg-toss-lightGray text-toss-gray'
                }`}>
                  {loc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-bold truncate ${selectedId === loc.id ? 'text-toss-blue' : 'text-toss-black'}`}>
                    {loc.name}
                  </h4>
                  <p className="text-[11px] text-toss-gray truncate mt-0.5">{loc.desc}</p>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  selectedId === loc.id ? 'bg-toss-blue/10 text-toss-blue' : 'text-toss-border'
                }`}>
                  <ChevronLeft size={16} className="rotate-180" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Tips */}
        <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-100/50 flex gap-4">
          <div className="bg-white p-2 rounded-xl shadow-sm h-fit">
            <Info size={18} className="text-toss-blue" />
          </div>
          <div>
            <h4 className="font-bold text-toss-black text-xs mb-1 italic">Notice</h4>
            <p className="text-[11px] text-toss-gray leading-relaxed font-medium">
              리조트 내 모든 실내 공간에서는 명찰을 반드시 착용해주세요. <br />
              무선 인터넷(Wi-Fi)은 비밀번호 없이 'Alpensia_Guest'를 사용하실 수 있습니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
