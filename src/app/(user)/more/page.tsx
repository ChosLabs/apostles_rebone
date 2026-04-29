"use client";

import { 
  ClipboardList, BookOpen, Users, Map, Bus, FileText, 
  Music, Image, MessageCircle, BarChart3, Gift, Phone, 
  Calendar, Heart, ChevronRight, Settings, LogOut, User
} from "lucide-react";

type MenuItem = {
  icon: React.ReactNode;
  label: string;
  desc: string;
  color: string;
};

const menuItems: MenuItem[] = [
  { icon: <Phone />, label: "비상 연락처", desc: "스태프 · 의료팀", color: "text-rose-500" },
  { icon: <Gift />, label: "경품 추첨", desc: "스탬프 · SNS 이벤트", color: "text-red-400" },
  { icon: <Users />, label: "내 조 확인", desc: "조원 명단 · 조장 연락처", color: "text-indigo-500" },
  { icon: <MessageCircle />, label: "조별 채팅", desc: "조원과 소통", color: "text-yellow-500" },
  { icon: <Map />, label: "리조트 안내", desc: "컨벤션센터 · 숙소 · 식당 맵", color: "text-green-500" },
  { icon: <BookOpen />, label: "선택강의 신청", desc: "20개 강의 중 택 1", color: "text-purple-500" },
  { icon: <Image />, label: "포토 앨범", desc: "현장 사진 공유", color: "text-emerald-500" },
  { icon: <BarChart3 />, label: "Slido 투표", desc: "실시간 투표 · Q&A", color: "text-cyan-500" },
  { icon: <Bus />, label: "버스 배정", desc: "출발 버스 번호 확인", color: "text-orange-500" },
  { icon: <FileText />, label: "성경공부 자료", desc: "GBS 자료 다운로드", color: "text-blue-400" },
  { icon: <Calendar />, label: "40일 팔로업", desc: "수련회 후 40일 플랜", color: "text-amber-500" },
  { icon: <Heart />, label: "결단카드", desc: "나의 결단 기록 · 파트너", color: "text-red-500" },
];

export default function MorePage() {
  return (
    <div className="flex flex-col gap-6 pb-8 px-4">
      {/* 1. 프로필 요약 섹션 */}
      <div className="bg-white rounded-toss p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-toss-border/40 mt-2 flex justify-between items-center group cursor-pointer active:scale-[0.98] transition-all">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-toss-lightGray border border-toss-border/40 flex items-center justify-center text-toss-gray/40 group-hover:text-toss-blue group-hover:bg-toss-blue/5 transition-all">
            <User size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-lg font-bold text-toss-black flex items-center">홍길동<span className="font-medium text-toss-gray ml-0.5">님</span></h2>
              <span className="text-[10px] font-bold bg-toss-blue/10 text-toss-blue px-1.5 py-0.5 rounded-md">21조</span>
            </div>
            <p className="text-xs text-toss-gray flex items-center gap-1">
              내 프로필 보기 <ChevronRight size={14} className="opacity-40" />
            </p>
          </div>
        </div>
        <div className="bg-toss-lightGray p-2.5 rounded-full text-toss-gray hover:text-toss-blue transition-colors shadow-sm">
          <Settings size={20} />
        </div>
      </div>

      {/* 2. 전체 메뉴 그리드 */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-toss-gray px-1 uppercase tracking-wider">전체 메뉴</h3>
        <div className="grid grid-cols-2 gap-3">
          {menuItems.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white p-3 rounded-toss shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-toss-border/40 active:scale-[0.96] transition-all cursor-pointer group flex items-center gap-3"
            >
              <div className={`w-9 h-9 rounded-xl bg-toss-lightGray flex items-center justify-center shrink-0 group-hover:bg-toss-blue/5 transition-colors ${item.color}`}>
                <div className="[&>svg]:w-5 [&>svg]:h-5">
                  {item.icon}
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="text-[13px] font-bold text-toss-black mb-0.5 leading-tight truncate">{item.label}</h4>
                <p className="text-[10px] text-toss-gray leading-tight truncate">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 푸터 섹션 */}
      <div className="flex flex-col gap-4 mt-2">
        <button className="flex items-center justify-center gap-2 w-full py-4 bg-toss-lightGray/50 text-toss-gray text-sm font-bold rounded-2xl hover:bg-toss-lightGray transition-colors">
          <LogOut size={18} />
          로그아웃
        </button>
        <div className="text-center">
          <p className="text-[10px] text-toss-gray/50 uppercase tracking-widest font-bold">2026 Apostles Summer Retreat</p>
          <p className="text-[10px] text-toss-gray/30 mt-1">Version 1.0.0 (Build 260605)</p>
        </div>
      </div>
    </div>
  );
}
