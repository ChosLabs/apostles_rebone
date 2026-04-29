"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Clock, 
  MapPin, 
  GripVertical,
  Calendar as CalendarIcon,
  ChevronRight,
  Save
} from "lucide-react";

type Day = "DAY1" | "DAY2" | "DAY3";

interface ScheduleItem {
  id: number;
  time: string;
  title: string;
  description: string;
  location: string;
  day: Day;
}

export default function AdminTimetablePage() {
  const [activeDay, setActiveDay] = useState<Day>("DAY1");
  const [isAdding, setIsAdding] = useState(false);

  // Mock data based on README
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    { id: 1, day: "DAY1", time: "08:00", title: "WAVE 1 본진 출발", description: "버스 12~13대, 500명", location: "본당 앞" },
    { id: 2, day: "DAY1", time: "12:00", title: "도착 · 체크인 · 점심", description: "로비 체크인 → 식당", location: "리조트 로비/식당" },
    { id: 3, day: "DAY1", time: "13:20", title: "개회예배 + OT", description: "RE:BONE 티저 · 주제안내 · 조편성", location: "그랜드볼룸" },
    { id: 4, day: "DAY2", time: "09:00", title: "찬양 + 성경강해", description: "엡 4:22-24 강해", location: "대강당" },
    { id: 5, day: "DAY3", time: "15:30", title: "파송예배", description: "Re:bond — 공동체를 다시 묶음", location: "본당" },
  ]);

  const filteredSchedules = schedules.filter(s => s.day === activeDay).sort((a, b) => a.time.localeCompare(b.time));

  const dayInfo = {
    DAY1: "6/5 금",
    DAY2: "6/6 토",
    DAY3: "6/7 일"
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-toss-black">타임테이블 관리</h1>
          <p className="text-xs lg:text-sm text-toss-gray mt-1">수련회 전체 일정을 일자별로 관리합니다.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 sm:flex-none bg-white text-toss-black border border-toss-border px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-toss-lightGray transition-all text-sm">
            <Save size={18} />
            순서 저장
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex-1 sm:flex-none bg-toss-blue text-white px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-toss-blue/90 transition-all shadow-sm shadow-toss-blue/20 text-sm"
          >
            <Plus size={20} />
            일정 추가
          </button>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex p-1 bg-toss-lightGray rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar">
        {(["DAY1", "DAY2", "DAY3"] as Day[]).map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`flex-1 sm:flex-none px-6 lg:px-8 py-2.5 lg:py-3 rounded-xl font-bold text-xs lg:text-sm transition-all whitespace-nowrap ${
              activeDay === day 
                ? "bg-white text-toss-blue shadow-sm" 
                : "text-toss-gray hover:text-toss-black"
            }`}
          >
            {day} <span className="ml-1 opacity-50 font-medium hidden sm:inline">{dayInfo[day]}</span>
          </button>
        ))}
      </div>

      {/* Add Schedule Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsAdding(false)}>
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 lg:px-8 py-4 lg:py-6 border-b border-toss-border flex justify-between items-center shrink-0">
              <h2 className="text-lg lg:text-xl font-black text-toss-black">새 일정 추가</h2>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors text-toss-gray">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <form className="p-6 lg:p-8 space-y-4 lg:space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] lg:text-xs font-bold text-toss-gray px-1 uppercase tracking-wider">일자</label>
                  <select 
                    className="w-full px-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all appearance-none bg-white font-bold text-sm"
                    defaultValue={activeDay}
                  >
                    <option value="DAY1">DAY 1 (6/5 금)</option>
                    <option value="DAY2">DAY 2 (6/6 토)</option>
                    <option value="DAY3">DAY 3 (6/7 일)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] lg:text-xs font-bold text-toss-gray px-1 uppercase tracking-wider">시간</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-toss-gray" />
                    <input 
                      type="time" 
                      className="w-full pl-11 pr-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] lg:text-xs font-bold text-toss-gray px-1 uppercase tracking-wider">프로그램 타이틀</label>
                <input 
                  type="text" 
                  placeholder="예: 개회예배 + OT"
                  className="w-full px-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm lg:text-base"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] lg:text-xs font-bold text-toss-gray px-1 uppercase tracking-wider">장소</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-toss-gray" />
                  <input 
                    type="text" 
                    placeholder="예: 그랜드볼룸, 식당 등"
                    className="w-full pl-11 pr-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] lg:text-xs font-bold text-toss-gray px-1 uppercase tracking-wider">상세 내용</label>
                <textarea 
                  rows={3}
                  placeholder="프로그램에 대한 설명을 입력하세요"
                  className="w-full px-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all resize-none text-sm leading-relaxed"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 lg:py-4 rounded-2xl font-bold text-toss-gray bg-toss-lightGray hover:bg-toss-border transition-all text-sm lg:text-base"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-3 lg:py-4 rounded-2xl font-bold text-white bg-toss-blue hover:bg-toss-blue/90 transition-all shadow-lg shadow-toss-blue/20 text-sm lg:text-base"
                >
                  일정 등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timetable List */}
      <div className="bg-white rounded-3xl border border-toss-border shadow-sm overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-toss-border flex justify-between items-center">
          <h3 className="font-bold text-toss-black flex items-center gap-2 text-sm lg:text-base">
            <CalendarIcon size={18} className="text-toss-blue" />
            {activeDay} 상세 일정
          </h3>
          <span className="text-[10px] lg:text-xs font-bold text-toss-gray bg-toss-lightGray px-2.5 lg:px-3 py-1 rounded-full">
            총 {filteredSchedules.length}개
          </span>
        </div>

        <div className="divide-y divide-toss-border">
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((item) => (
              <div key={item.id} className="p-4 lg:p-6 flex flex-col sm:flex-row items-start gap-4 lg:gap-6 hover:bg-toss-lightGray/30 transition-colors group relative">
                <div className="hidden sm:block pt-1 cursor-move text-toss-border group-hover:text-toss-gray transition-colors">
                  <GripVertical size={20} />
                </div>
                
                <div className="w-full sm:w-24 shrink-0">
                  <div className="flex items-center gap-1.5 text-toss-blue font-black text-lg lg:text-xl italic">
                    <Clock size={16} strokeWidth={3} className="sm:hidden" />
                    {item.time}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-base lg:text-[17px] font-black text-toss-black mb-1">{item.title}</h4>
                  <p className="text-xs lg:text-sm text-toss-gray leading-relaxed mb-3">{item.description}</p>
                  <div className="flex items-center gap-1.5 text-[10px] lg:text-xs font-bold text-toss-gray bg-toss-lightGray/50 w-fit px-2.5 py-1 rounded-lg border border-toss-border/50">
                    <MapPin size={12} className="text-toss-blue/60" />
                    {item.location}
                  </div>
                </div>

                <div className="flex sm:flex-col lg:flex-row gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-start">
                  <button className="p-2 text-toss-gray hover:text-toss-blue hover:bg-toss-blue/5 rounded-xl transition-all border border-toss-border sm:border-transparent">
                    <Edit2 size={18} />
                  </button>
                  <button className="p-2 text-toss-gray hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-toss-border sm:border-transparent">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-toss-lightGray rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon size={24} className="text-toss-gray/40" />
              </div>
              <p className="text-toss-gray font-bold">등록된 일정이 없습니다.</p>
              <button className="text-toss-blue font-bold text-sm mt-2 hover:underline">새 일정 추가하기</button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex gap-4">
        <div className="bg-white p-2 rounded-xl shadow-sm h-fit">
          <Clock size={20} className="text-toss-blue" />
        </div>
        <div>
          <h4 className="font-bold text-toss-black text-sm mb-1">일정 관리 팁</h4>
          <p className="text-xs text-toss-gray leading-relaxed">
            왼쪽의 핸들(<GripVertical size={12} className="inline" />)을 드래그하여 일정 순서를 변경할 수 있습니다. <br />
            저장 버튼을 누르기 전까지는 변경사항이 실제 서비스에 반영되지 않습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
