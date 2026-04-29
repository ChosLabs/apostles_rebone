"use client";

import { useState } from "react";
import { Coffee, Heart, Palette, Zap, CheckCircle2, Lock, X } from "lucide-react";

type Booth = {
  id: string;
  name: string;
  icon: React.ReactNode;
  desc: string;
  color: string;
  bg: string;
};

const booths: Booth[] = [
  { 
    id: "comfort", 
    name: "Comfort Zone", 
    icon: <Coffee size={24} />, 
    desc: "Calling Cafe · 커피+간식 무제한. 강의 후 대화를 이어가는 공간",
    color: "#FF8A65",
    bg: "rgba(255,138,101,0.1)"
  },
  { 
    id: "prayer", 
    name: "Prayer Zone", 
    icon: <Heart size={24} />, 
    desc: "기도사역자와 1:1 기도. 경청 70% · 위기대응 매뉴얼 운영",
    color: "#3182f6",
    bg: "rgba(49,130,246,0.1)"
  },
  { 
    id: "experience", 
    name: "체험 부스", 
    icon: <Palette size={24} />, 
    desc: "선교단체 체험, 비전트립 안내, 인생그래프 그리기, 은사검사",
    color: "#4CAF50",
    bg: "rgba(76,175,80,0.1)"
  },
  { 
    id: "activity", 
    name: "Activity Zone", 
    icon: <Zap size={24} />, 
    desc: "팀 미션게임, 포토존, SNS 챌린지 (#REBONE2026)",
    color: "#9C6ADE",
    bg: "rgba(156,106,222,0.1)"
  },
];

export default function CallingPage() {
  const [stamps, setStamps] = useState<string[]>(["comfort", "prayer"]); // 예시로 2개 완료 상태
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const handleStampClick = (booth: Booth) => {
    if (stamps.includes(booth.id)) return;
    setSelectedBooth(booth);
    setCode("");
    setError(false);
  };

  const verifyCode = () => {
    // 실제로는 서버 연동이 필요하지만, 여기서는 데모용으로 '1234'를 정답으로 가정
    if (code === "1234") {
      setStamps([...stamps, selectedBooth!.id]);
      setSelectedBooth(null);
    } else {
      setError(true);
      // 흔들림 효과 등을 위한 피드백
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-8 px-4">
      {/* 1. 메인 배너 */}
      <div className="bg-white rounded-toss p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-toss-border/40 mt-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Zap size={80} fill="#FF8A65" className="text-[#FF8A65]" />
        </div>
        <div className="flex flex-col gap-1 mb-4">
          <span className="text-[10px] font-bold text-[#FF8A65] tracking-widest uppercase">DAY 2 (토) 15:10~17:00</span>
          <h2 className="text-2xl font-black text-toss-black italic">Holy Festival & Cafe</h2>
        </div>
        <p className="text-sm text-toss-gray leading-relaxed">
          선택강의에서 받은 감동을 행동으로 연결하는 체험의 공간입니다. 4대 부스를 자유롭게 탐험하세요.
        </p>
      </div>

      {/* 2. 부스 목록 */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-toss-gray px-1 uppercase tracking-wider">4대 부스 안내</h3>
        {booths.map((booth) => (
          <div 
            key={booth.id}
            className="bg-white rounded-toss p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-toss-border/40 flex gap-4 items-start"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: booth.bg, color: booth.color }}>
              {booth.icon}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-[15px] font-bold text-toss-black">{booth.name}</h4>
                {stamps.includes(booth.id) && (
                  <span className="text-[10px] font-bold text-toss-blue">방문 완료</span>
                )}
              </div>
              <p className="text-xs text-toss-gray leading-relaxed">{booth.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. 스탬프 패스포트 */}
      <div className="bg-white rounded-toss p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-toss-border/40">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold text-toss-gray uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-toss-blue" />
            PASSPORT 스탬프
          </h3>
          <span className="text-[10px] font-bold text-toss-blue bg-toss-blue/5 px-2 py-1 rounded-md">
            {stamps.length} / 4 완료
          </span>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {booths.map((booth) => {
            const isCompleted = stamps.includes(booth.id);
            return (
              <button
                key={booth.id}
                onClick={() => handleStampClick(booth)}
                className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                  isCompleted 
                  ? "bg-toss-blue/5 border-toss-blue border-solid" 
                  : "border-dashed border-toss-border bg-toss-lightGray/30"
                }`}
              >
                <div className={`${isCompleted ? "text-toss-blue" : "text-toss-gray/40"}`}>
                  {isCompleted ? <CheckCircle2 size={24} fill="currentColor" className="text-white" /> : booth.icon}
                </div>
                <span className={`text-[9px] font-bold ${isCompleted ? "text-toss-blue" : "text-toss-gray/60"}`}>
                  {booth.name.split(" ")[0]}
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-[10px] text-toss-gray text-center mt-4">
          4곳 모두 방문하면 <span className="text-toss-blue font-bold">경품 추첨</span>에 자동 참여됩니다!
        </p>
      </div>

      {/* 스탬프 인증 모달 */}
      {selectedBooth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedBooth(null)}>
          <div 
            className="bg-white w-full max-w-[320px] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: selectedBooth.bg, color: selectedBooth.color }}>
                {selectedBooth.icon}
              </div>
              <h2 className="text-xl font-bold text-toss-black mb-1">{selectedBooth.name}</h2>
              <p className="text-sm text-toss-gray mb-6">부스에 비치된 4자리 코드를 입력해주세요</p>
              
              <input 
                type="text" 
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(false);
                }}
                maxLength={4}
                placeholder="0000"
                className={`w-full bg-toss-lightGray border-2 rounded-xl py-4 text-center text-2xl font-black tracking-[12px] focus:outline-none transition-colors ${
                  error ? "border-red-400 text-red-500" : "border-transparent focus:border-toss-blue"
                }`}
              />
              
              {error && <p className="text-xs text-red-500 mt-2 font-bold">코드가 일치하지 않습니다</p>}

              <div className="flex gap-2 w-full mt-6">
                <button 
                  onClick={() => setSelectedBooth(null)}
                  className="flex-1 bg-toss-lightGray text-toss-gray font-bold py-4 rounded-xl active:scale-95 transition-all"
                >
                  취소
                </button>
                <button 
                  onClick={verifyCode}
                  className="flex-2 bg-toss-blue text-white font-bold py-4 rounded-xl active:scale-95 transition-all px-8"
                >
                  인증
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
