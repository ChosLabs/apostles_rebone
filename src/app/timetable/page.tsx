"use client";

import { useState } from "react";
import { ChevronLeft, MapPin } from "lucide-react";
import Link from "next/link";

type Program = {
  time: string;
  title: string;
  location?: string;
  type: "worship" | "group" | "meal" | "move" | "select" | "calling" | "special" | "setup" | "pray" | "etc";
};

type DaySchedule = {
  day: number;
  label: string;
  date: string;
  programs: Program[];
};

const scheduleData: DaySchedule[] = [
  {
    day: 1,
    label: "Day 1",
    date: "6월 5일 (금)",
    programs: [
      { time: "08:00 ~ 12:00", title: "WAVE 1 본진 출발", location: "버스 12~13대, 500명", type: "move" },
      { time: "12:00 ~ 13:20", title: "도착 · 체크인 · 점심", location: "로비 체크인 → 식당", type: "meal" },
      { time: "13:20 ~ 14:05", title: "개회예배 + OT", location: "RE:BONE 티저 · 주제안내", type: "worship" },
      { time: "14:05 ~ 17:30", title: "조모임 #1 · 첫만남", location: "아이스브레이킹 + 기도", type: "group" },
      { time: "17:30 ~ 18:50", title: "저녁식사", location: "지하 1층 식당", type: "meal" },
      { time: "18:50 ~ 19:15", title: "연약함의 고백 (Lights Rise)", location: "스마트폰 플래시 · 3단계 질문", type: "special" },
      { time: "19:15 ~ 20:30", title: "찬양 + 메시지 #1", location: "Re:本 — 옛사람을 벗어버리고", type: "worship" },
      { time: "20:30 ~ 22:00", title: "조모임 #2 · 나눔", location: "메시지 나눔 + 기도", type: "group" },
    ],
  },
  {
    day: 2,
    label: "Day 2",
    date: "6월 6일 (토)",
    programs: [
      { time: "07:00 ~ 08:30", title: "아침 경건회 (자율)", location: "묵상 + 말씀낭독", type: "pray" },
      { time: "09:00 ~ 10:40", title: "찬양 + 성경강해", location: "엡 4:22-24 강해", type: "worship" },
      { time: "10:40 ~ 12:10", title: "Group Bible Study", location: "에베소서 4:17-32 조별 성경공부", type: "group" },
      { time: "13:20 ~ 15:10", title: "선택강의 (20개)", location: "4트랙 × 동시 진행", type: "select" },
      { time: "15:10 ~ 17:00", title: "콜링존 OPEN", location: "Holy Festival & Cafe", type: "calling" },
      { time: "18:50 ~ 20:05", title: "찬양 + 메시지 #2", location: "Re:born — 새사람을 입으라", type: "worship" },
      { time: "20:05 ~ 21:30", title: "성찬식 ✦", location: "수련회 영적 정점", type: "special" },
    ],
  },
  {
    day: 3,
    label: "Day 3",
    date: "6월 7일 (일)",
    programs: [
      { time: "08:30 ~ 09:30", title: "체크아웃 · 버스 탑승", location: "각 숙소 로비", type: "move" },
      { time: "09:30 ~ 11:30", title: "흩어져예배 (100~200명)", location: "인근교회 3~5곳", type: "worship" },
      { time: "11:30 ~ 14:00", title: "평창 출발 → 대구", location: "알펜시아 버스 승차장", type: "move" },
      { time: "15:30 ~ 17:15", title: "파송예배 (1300명 합류)", location: "Re:bond — 공동체를 다시 묶음", type: "special" },
      { time: "17:15 ~ 18:00", title: "단체사진 · 해산", location: "#REBONE2026", type: "etc" },
    ],
  },
];

export default function TimetablePage() {
  const [selectedDay, setSelectedDay] = useState(1);
  const currentDayData = scheduleData.find((d) => d.day === selectedDay)!;

  return (
    <div className="min-h-screen bg-toss-lightGray pb-24">
      {/* Enhanced Header */}
      <div className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-[420px] mx-auto px-5 pt-4 pb-2">
          <div className="flex justify-between items-center mb-4">
            <Link href="/" className="w-10 h-10 -ml-2 flex items-center justify-center hover:bg-toss-lightGray rounded-full transition-colors">
              <ChevronLeft size={24} className="text-toss-black" />
            </Link>
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-black text-toss-blue tracking-[0.2em] italic mb-0.5">RE:본 2026</span>
              <h1 className="text-[17px] font-bold text-toss-black tracking-tight">수련회 일정</h1>
            </div>
            <div className="w-10"></div>
          </div>
          
          <div className="flex gap-2 p-1 bg-toss-lightGray/80 rounded-2xl">
            {scheduleData.map((day) => (
              <button
                key={day.day}
                onClick={() => setSelectedDay(day.day)}
                className={`flex-1 py-3 rounded-[14px] text-[13px] font-bold transition-all ${
                  selectedDay === day.day
                    ? "bg-white text-toss-blue shadow-sm"
                    : "text-toss-gray/60 hover:text-toss-gray"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[1px] bg-toss-border/40 w-full"></div>
      </div>

      <main className="max-w-[420px] mx-auto p-4">
        <div className="mb-5 px-1">
          <p className="text-[11px] font-bold text-toss-blue uppercase tracking-widest mb-0.5">Retreat Schedule</p>
          <h2 className="text-2xl font-bold text-toss-black">{currentDayData.date}</h2>
        </div>

        <div className="space-y-3">
          {currentDayData.programs.map((program, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-toss p-4 shadow-sm flex items-center gap-4 border border-toss-border/40 hover:border-toss-blue/10 transition-all active:scale-[0.99] min-h-[85px]"
            >
              <div className="flex flex-col items-center justify-center min-w-[85px] border-r border-toss-border/40 pr-3 my-1">
                <span className="text-[12px] font-bold text-toss-black tabular-nums leading-none">
                  {program.time.split(" ~ ")[0]}
                </span>
                <div className="h-2 w-px bg-toss-border/60 my-1"></div>
                <span className="text-[12px] font-bold text-toss-gray/50 tabular-nums leading-none">
                  {program.time.split(" ~ ")[1]}
                </span>
              </div>
              
              <div className="flex-1 flex flex-col justify-center py-0.5">
                <div className="flex justify-between items-center mb-1.5">
                  <h3 className="text-[15px] font-bold text-toss-black leading-tight line-clamp-1">{program.title}</h3>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ml-2 uppercase tracking-tighter ${getTypeStyle(program.type)}`}>
                    {getTypeLabel(program.type)}
                  </span>
                </div>
                
                <div className="flex items-start gap-1 text-[11px] text-toss-gray font-medium leading-relaxed">
                  <MapPin size={11} className="text-toss-blue/60 mt-0.5 shrink-0" />
                  <span className="line-clamp-1">{program.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function getTypeStyle(type: Program["type"]) {
  switch (type) {
    case "worship": return "bg-amber-50 text-amber-600";
    case "pray": return "bg-amber-50 text-amber-600";
    case "group": return "bg-blue-50 text-toss-blue";
    case "meal": return "bg-emerald-50 text-emerald-600";
    case "special": return "bg-rose-50 text-rose-600";
    case "select": return "bg-purple-50 text-purple-600";
    case "calling": return "bg-orange-50 text-orange-600";
    case "move": return "bg-gray-100 text-toss-gray";
    case "setup": return "bg-gray-100 text-toss-gray";
    default: return "bg-gray-100 text-toss-gray";
  }
}

function getTypeLabel(type: Program["type"]) {
  switch (type) {
    case "worship": return "예배";
    case "pray": return "기도";
    case "group": return "소그룹";
    case "meal": return "식사";
    case "special": return "특별";
    case "select": return "선택";
    case "calling": return "콜링존";
    case "move": return "이동";
    case "setup": return "세팅";
    default: return "";
  }
}
