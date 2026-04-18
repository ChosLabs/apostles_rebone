"use client";

import { useState } from "react";
import { ChevronLeft, X, Megaphone } from "lucide-react";
import Link from "next/link";

type Notice = {
  title: string;
  time: string;
  content: string;
  urgent?: boolean;
};

const allNotices: Notice[] = [
  { title: "🚌 버스 배정 안내", time: "방금", content: "내일 출발 버스 번호를 확인하세요. 조별로 같은 버스에 탑승하며 8시 정각에 본당 앞에서 출발합니다. 지각 시 대기 없이 출발하니 주의 바랍니다.", urgent: true },
  { title: "🍽️ 1일차 식사 안내", time: "2시간 전", content: "5일 점심은 12:00~13:00입니다. 리조트 도착 후 로비에서 체크인을 마치고 바로 지하 1층 식당으로 이동해주세요." },
  { title: "📋 수련회 준비물 체크리스트", time: "어제", content: "성경책, 필기도구, 여벌 옷(2박 3일분), 세면도구, 개인 상비약 등을 준비해주세요. 물놀이 예정이 있으니 슬리퍼와 수건도 챙겨오시면 좋습니다." },
  { title: "☔ 우천 시 일정 변경 안내", time: "2일 전", content: "내일 오후 전국적으로 비 예보가 있습니다. 야외 올림픽 일정은 실내 체육관 프로그램으로 변경될 수 있으니 참고 바랍니다." },
  { title: "👕 수련회 티셔츠 사이즈 교환", time: "3일 전", content: "신청하신 티셔츠 사이즈가 맞지 않는 경우, 오늘 오후 6시까지 사무국으로 방문하여 교환해 주시기 바랍니다. (수량 한정)" },
  { title: "🏥 의무실 운영 안내", time: "4일 전", content: "수련회 기간 중 몸이 불편하신 분들은 지하 1층 의무실을 방문해 주세요. 전문 의료진이 상주하고 있습니다." },
];

export default function NoticesPage() {
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  return (
    <div className="min-h-screen bg-toss-lightGray pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 border-b border-toss-border">
        <div className="max-w-[420px] mx-auto flex items-center h-12 px-4">
          <Link href="/" className="p-2 -ml-2 hover:bg-toss-lightGray rounded-full transition-colors">
            <ChevronLeft size={20} className="text-toss-black" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[15px] mr-8">공지사항</h1>
        </div>
      </div>

      <main className="max-w-[420px] mx-auto p-4">
        <div className="bg-white rounded-toss overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-toss-border/40">
          {allNotices.map((notice, idx) => (
            <div 
              key={idx}
              className={`p-5 flex flex-col gap-1 active:bg-toss-lightGray transition-colors cursor-pointer ${
                idx !== allNotices.length - 1 ? 'border-b border-toss-border/40' : ''
              }`}
              onClick={() => setSelectedNotice(notice)}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  {notice.urgent && <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                  <span className={`text-[15px] font-bold ${notice.urgent ? 'text-toss-black' : 'text-toss-black/80'}`}>
                    {notice.title}
                  </span>
                </div>
                <span className="text-[11px] text-toss-gray font-medium">{notice.time}</span>
              </div>
              <p className="text-sm text-toss-gray truncate">{notice.content}</p>
            </div>
          ))}
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
            className="bg-white w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-toss-blue">{selectedNotice.time}</span>
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
