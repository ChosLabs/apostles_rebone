"use client";

import { useState } from "react";
import { ChevronRight, Users, MessageCircle, Map, Image, ClipboardCheck, Vote, X } from "lucide-react";

export default function Home() {
  const [selectedNotice, setSelectedNotice] = useState<{title: string, content: string, time: string} | null>(null);

  const notices = [
    { title: "🚌 버스 배정 안내", time: "방금", content: "내일 출발 버스 번호를 확인하세요. 조별로 같은 버스에 탑승하며 8시 정각에 본당 앞에서 출발합니다. 지각 시 대기 없이 출발하니 주의 바랍니다.", urgent: true },
    { title: "🍽️ 1일차 식사 안내", time: "2시간 전", content: "5일 점심은 12:00~13:00입니다. 리조트 도착 후 로비에서 체크인을 마치고 바로 지하 1층 식당으로 이동해주세요." },
    { title: "📋 수련회 준비물 체크리스트", time: "어제", content: "성경책, 필기도구, 여벌 옷(2박 3일분), 세면도구, 개인 상비약 등을 준비해주세요. 물놀이 예정이 있으니 슬리퍼와 수건도 챙겨오시면 좋습니다." },
  ];

  return (
    <div className="flex flex-col gap-1 pb-8">
      {/* 1. 오늘의 기도제목 */}
      <div className="toss-card bg-gradient-to-br from-toss-blue to-[#5d98f7] text-white">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-md">🙏 오늘의 기도제목 D-14</span>
        </div>
        <h3 className="text-lg font-bold mb-1">참석자들의 마음 준비를 위해</h3>
        <p className="text-sm text-white/80 leading-relaxed">
          600명의 참석자 한 사람 한 사람이 기대와 갈망을 품고 올 수 있도록, 직장과 학업 가운데 시간이 허락되도록 기도해주세요.
        </p>
      </div>

      {/* 2. D-DAY COUNTER */}
      <div className="toss-card flex justify-between items-center">
        <div>
          <p className="text-sm text-toss-gray font-medium">2026 아포슬 전체수련회</p>
          <p className="text-xl font-bold">시작까지 <span className="text-toss-blue">D-14</span></p>
        </div>
        <div className="bg-toss-lightGray px-4 py-2 rounded-2xl font-mono font-black text-xl text-toss-blue">
          14:24:55
        </div>
      </div>

      {/* 3. 공지사항 */}
      <div className="flex justify-between items-center toss-section-header mt-4">
        <span>공지사항</span>
        <button className="text-xs text-toss-gray flex items-center">더보기 <ChevronRight size={14} /></button>
      </div>
      <div className="toss-card !p-0 overflow-hidden">
        {notices.map((notice, idx) => (
          <NoticeItem 
            key={idx}
            title={notice.title}
            time={notice.time}
            content={notice.content}
            urgent={notice.urgent}
            border={idx !== notices.length - 1}
            onClick={() => setSelectedNotice(notice)}
          />
        ))}
      </div>

      {/* 4. 타임테이블 (미니) */}
      <div className="toss-section-header mt-4">진행 중인 프로그램</div>
      <div className="toss-card mb-4">
        <div className="flex gap-4 items-center">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-toss-blue">NOW</span>
            <div className="w-[2px] h-8 bg-toss-blue/20 my-1"></div>
            <span className="text-[10px] text-toss-gray">NEXT</span>
          </div>
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-bold">개회예배 + OT</p>
                <p className="text-xs text-toss-gray">13:20 - 14:05</p>
              </div>
              <span className="text-[10px] bg-toss-blue/10 text-toss-blue px-2 py-1 rounded-full font-bold">진행중</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-toss-gray">조모임 #1 · 첫만남</p>
                <p className="text-xs text-toss-gray/60">14:05 - 17:30</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Quick Access (Grid) */}
      <div className="toss-section-header mt-4">빠른 접근</div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <QuickLink icon={<Users className="text-blue-500" />} label="내 조 확인" desc="조원 및 조장" />
        <QuickLink icon={<MessageCircle className="text-green-500" />} label="조별 채팅" desc="실시간 소통" />
        <QuickLink icon={<Map className="text-red-400" />} label="리조트 안내" desc="지도 및 식당" />
        <QuickLink icon={<Image className="text-purple-500" />} label="포토 앨범" desc="현장 사진" />
        <QuickLink icon={<ClipboardCheck className="text-orange-500" />} label="강의 신청" desc="선택강의" />
        <QuickLink icon={<Vote className="text-indigo-500" />} label="실시간 투표" desc="참여하기" />
      </div>

      {/* 공지사항 상세 모달 */}
      {selectedNotice && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedNotice(null)}>
          <div 
            className="bg-white w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-toss-blue">{selectedNotice.time}</span>
                <h2 className="text-xl font-bold text-toss-black">{selectedNotice.title}</h2>
              </div>
              <button onClick={() => setSelectedNotice(null)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors">
                <X size={24} className="text-toss-gray" />
              </button>
            </div>
            <div className="text-base text-toss-gray leading-relaxed whitespace-pre-wrap py-4">
              {selectedNotice.content}
            </div>
            <button 
              onClick={() => setSelectedNotice(null)}
              className="w-full bg-toss-blue text-white font-bold py-4 rounded-toss mt-4 transition-transform active:scale-95"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickLink({ icon, label, desc }: { icon: React.ReactNode; label: string; desc: string }) {
  return (
    <div className="bg-white p-4 rounded-toss shadow-[0_2px_4px_rgba(0,0,0,0.04)] flex flex-col gap-2 transition-transform active:scale-[0.95] cursor-pointer">
      <div className="bg-toss-lightGray w-10 h-10 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-toss-black leading-tight">{label}</p>
        <p className="text-[10px] text-toss-gray">{desc}</p>
      </div>
    </div>
  );
}

function NoticeItem({ title, time, content, urgent = false, border = true, onClick }: { title: string; time: string; content: string; urgent?: boolean; border?: boolean, onClick: () => void }) {
  return (
    <div 
      className={`p-4 flex flex-col gap-1 active:bg-toss-lightGray transition-colors cursor-pointer ${border ? 'border-b border-toss-border' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {urgent && <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
          <span className="text-sm font-bold text-toss-black">{title}</span>
        </div>
        <span className="text-[11px] text-toss-gray font-medium">{time}</span>
      </div>
      <div className="flex justify-between items-center gap-4">
        <p className="text-xs text-toss-gray truncate flex-1">{content}</p>
        <ChevronRight size={14} className="text-toss-border shrink-0" />
      </div>
    </div>
  );
}
