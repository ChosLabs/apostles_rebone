"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import { getTimetable } from "@/lib/services/timetableService";
import { TimetableItem, TimetableType } from "@/types/database";

const DAY_INFO = [
  { day: 1, label: "Day 1", date: "6월 5일 (금)" },
  { day: 2, label: "Day 2", date: "6월 6일 (토)" },
  { day: 3, label: "Day 3", date: "6월 7일 (일)" },
];

export default function TimetablePage() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [items, setItems] = useState<TimetableItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTimetable()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const currentDayItems = items
    .filter((i) => i.day === selectedDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  const currentDay = DAY_INFO.find((d) => d.day === selectedDay)!;

  return (
    <div className="min-h-screen bg-toss-lightGray pb-24">
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
            {DAY_INFO.map((d) => (
              <button
                key={d.day}
                onClick={() => setSelectedDay(d.day)}
                className={`flex-1 py-3 rounded-[14px] text-[13px] font-bold transition-all ${
                  selectedDay === d.day
                    ? "bg-white text-toss-blue shadow-sm"
                    : "text-toss-gray/60 hover:text-toss-gray"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[1px] bg-toss-border/40 w-full"></div>
      </div>

      <main className="max-w-[420px] mx-auto p-4">
        <div className="mb-5 px-1">
          <p className="text-[11px] font-bold text-toss-blue uppercase tracking-widest mb-0.5">Retreat Schedule</p>
          <h2 className="text-2xl font-bold text-toss-black">{currentDay.date}</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-toss-blue" size={32} />
          </div>
        ) : currentDayItems.length === 0 ? (
          <div className="py-20 text-center text-toss-gray font-bold text-sm">
            등록된 일정이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {currentDayItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-toss p-4 shadow-sm flex items-center gap-4 border border-toss-border/40 hover:border-toss-blue/10 transition-all active:scale-[0.99] min-h-[85px]"
              >
                <div className="flex flex-col items-center justify-center min-w-[85px] border-r border-toss-border/40 pr-3 my-1">
                  <span className="text-[12px] font-bold text-toss-black tabular-nums leading-none">
                    {item.time}
                  </span>
                  {item.endTime && (
                    <>
                      <div className="h-2 w-px bg-toss-border/60 my-1"></div>
                      <span className="text-[12px] font-bold text-toss-gray/50 tabular-nums leading-none">
                        {item.endTime}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-center py-0.5">
                  <div className="flex justify-between items-center mb-1.5">
                    <h3 className="text-[15px] font-bold text-toss-black leading-tight line-clamp-1">{item.title}</h3>
                    {item.type && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ml-2 uppercase tracking-tighter ${getTypeStyle(item.type)}`}>
                        {getTypeLabel(item.type)}
                      </span>
                    )}
                  </div>

                  {item.location && (
                    <div className="flex items-start gap-1 text-[11px] text-toss-gray font-medium leading-relaxed">
                      <MapPin size={11} className="text-toss-blue/60 mt-0.5 shrink-0" />
                      <span className="line-clamp-1">{item.location}</span>
                    </div>
                  )}
                  {item.description && (
                    <p className="text-[11px] text-toss-gray/70 mt-1 line-clamp-1">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function getTypeStyle(type: TimetableType) {
  switch (type) {
    case "worship": return "bg-amber-50 text-amber-600";
    case "pray":    return "bg-amber-50 text-amber-600";
    case "group":   return "bg-blue-50 text-toss-blue";
    case "meal":    return "bg-emerald-50 text-emerald-600";
    case "special": return "bg-rose-50 text-rose-600";
    case "select":  return "bg-purple-50 text-purple-600";
    case "calling": return "bg-orange-50 text-orange-600";
    case "move":    return "bg-gray-100 text-toss-gray";
    case "setup":   return "bg-gray-100 text-toss-gray";
    default:        return "bg-gray-100 text-toss-gray";
  }
}

function getTypeLabel(type: TimetableType) {
  switch (type) {
    case "worship": return "예배";
    case "pray":    return "기도";
    case "group":   return "소그룹";
    case "meal":    return "식사";
    case "special": return "특별";
    case "select":  return "선택";
    case "calling": return "콜링존";
    case "move":    return "이동";
    case "setup":   return "세팅";
    default:        return "";
  }
}
