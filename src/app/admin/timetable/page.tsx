"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Clock, 
  MapPin, 
  GripVertical,
  Calendar as CalendarIcon,
  Loader2
} from "lucide-react";
import { 
  getTimetable, 
  addTimetableItem, 
  updateTimetableItem, 
  deleteTimetableItem 
} from "@/lib/services/timetableService";
import { TimetableItem } from "@/types/database";

type DayStr = "DAY1" | "DAY2" | "DAY3";

export default function AdminTimetablePage() {
  const [activeDay, setActiveDay] = useState<DayStr>("DAY1");
  const [schedules, setSchedules] = useState<TimetableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<TimetableItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    day: 1,
    time: "",
    endTime: "",
    type: "etc" as import("@/types/database").TimetableType,
    title: "",
    location: "",
    description: ""
  });

  const dayToNum = (day: DayStr) => parseInt(day.replace("DAY", ""));
  const numToDay = (num: number): DayStr => `DAY${num}` as DayStr;

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        day: editingItem.day,
        time: editingItem.time,
        endTime: editingItem.endTime || "",
        type: editingItem.type || "etc",
        title: editingItem.title,
        location: editingItem.location || "",
        description: editingItem.description || ""
      });
    } else {
      setFormData({
        day: dayToNum(activeDay),
        time: "",
        endTime: "",
        type: "etc",
        title: "",
        location: "",
        description: ""
      });
    }
  }, [editingItem, activeDay]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await getTimetable();
      setSchedules(data);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
      alert("데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.time || !formData.title) {
      alert("시간과 타이틀은 필수입니다.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingItem) {
        await updateTimetableItem(editingItem.id, formData);
      } else {
        await addTimetableItem(formData);
      }
      await fetchSchedules();
      setIsAdding(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to save schedule:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`'${title}' 일정을 삭제하시겠습니까?`)) return;
    try {
      await deleteTimetableItem(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const filteredSchedules = schedules.filter(s => numToDay(s.day) === activeDay).sort((a, b) => a.time.localeCompare(b.time));

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
          <button 
            onClick={() => { setEditingItem(null); setIsAdding(true); }}
            className="flex-1 sm:flex-none bg-toss-blue text-white px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-toss-blue/90 transition-all shadow-sm shadow-toss-blue/20 text-sm"
          >
            <Plus size={20} />
            일정 추가
          </button>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex p-1 bg-toss-lightGray rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar">
        {(["DAY1", "DAY2", "DAY3"] as DayStr[]).map((day) => (
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

      {/* Add/Edit Schedule Modal */}
      {(isAdding || editingItem) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => { setIsAdding(false); setEditingItem(null); }}>
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 lg:px-8 py-4 lg:py-6 border-b border-toss-border flex justify-between items-center shrink-0">
              <h2 className="text-lg lg:text-xl font-black text-toss-black">
                {editingItem ? "일정 수정" : "새 일정 추가"}
              </h2>
              <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors text-toss-gray">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <form className="p-6 lg:p-8 space-y-4 lg:space-y-5 overflow-y-auto" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] lg:text-xs font-bold text-toss-gray px-1 uppercase tracking-wider">일자</label>
                  <select
                    className="w-full px-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all appearance-none bg-white font-bold text-sm"
                    value={formData.day}
                    onChange={e => setFormData(prev => ({ ...prev, day: parseInt(e.target.value) }))}
                  >
                    <option value={1}>DAY 1 (6/5 금)</option>
                    <option value={2}>DAY 2 (6/6 토)</option>
                    <option value={3}>DAY 3 (6/7 일)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] lg:text-xs font-bold text-toss-gray px-1 uppercase tracking-wider">구분</label>
                  <select
                    className="w-full px-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all appearance-none bg-white font-bold text-sm"
                    value={formData.type}
                    onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as import("@/types/database").TimetableType }))}
                  >
                    <option value="worship">예배</option>
                    <option value="pray">기도</option>
                    <option value="group">소그룹</option>
                    <option value="meal">식사</option>
                    <option value="special">특별</option>
                    <option value="select">선택강의</option>
                    <option value="calling">콜링존</option>
                    <option value="move">이동</option>
                    <option value="setup">세팅</option>
                    <option value="etc">기타</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] lg:text-xs font-bold text-toss-gray px-1 uppercase tracking-wider">시작 시간</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-toss-gray" />
                    <input
                      type="time"
                      className="w-full pl-11 pr-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm"
                      value={formData.time}
                      onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] lg:text-xs font-bold text-toss-gray px-1 uppercase tracking-wider">종료 시간</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-toss-gray" />
                    <input
                      type="time"
                      className="w-full pl-11 pr-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm"
                      value={formData.endTime}
                      onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
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
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
                    value={formData.location}
                    onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] lg:text-xs font-bold text-toss-gray px-1 uppercase tracking-wider">상세 내용</label>
                <textarea 
                  rows={3}
                  placeholder="프로그램에 대한 설명을 입력하세요"
                  className="w-full px-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all resize-none text-sm leading-relaxed"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => { setIsAdding(false); setEditingItem(null); }}
                  className="flex-1 py-3 lg:py-4 rounded-2xl font-bold text-toss-gray bg-toss-lightGray hover:bg-toss-border transition-all text-sm lg:text-base"
                  disabled={isSubmitting}
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-3 lg:py-4 rounded-2xl font-bold text-white bg-toss-blue hover:bg-toss-blue/90 transition-all shadow-lg shadow-toss-blue/20 text-sm lg:text-base flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={20} />}
                  {editingItem ? "일정 수정하기" : "일정 등록하기"}
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
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin text-toss-blue mx-auto" size={32} />
              <p className="text-sm font-bold text-toss-gray mt-2">일정을 불러오는 중...</p>
            </div>
          ) : filteredSchedules.length > 0 ? (
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
                  <button 
                    onClick={() => setEditingItem(item)}
                    className="p-2 text-toss-gray hover:text-toss-blue hover:bg-toss-blue/5 rounded-xl transition-all border border-toss-border sm:border-transparent"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-2 text-toss-gray hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-red-100 sm:border-transparent"
                  >
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
              <button onClick={() => setIsAdding(true)} className="text-toss-blue font-bold text-sm mt-2 hover:underline">새 일정 추가하기</button>
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
            왼쪽의 핸들(<GripVertical size={12} className="inline" />)을 드래그하여 일정 순서를 변경할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
