"use client";

import React, { useState, useEffect } from "react";
import { 
  Heart, 
  Save, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { getAllDailyPrayers, setDailyPrayer } from "@/lib/services/dailyPrayerService";
import { DailyPrayer } from "@/types/database";
import { clsx } from "clsx";

const D_DAY = new Date("2026-06-05");

export default function AdminDailyPrayers() {
  const [prayers, setPrayers] = useState<Record<string, Partial<DailyPrayer>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const existingPrayers = await getAllDailyPrayers();
        const prayerMap: Record<string, DailyPrayer> = {};
        existingPrayers.forEach(p => {
          prayerMap[p.id] = p;
        });
        setPrayers(prayerMap);
      } catch (error) {
        console.error("Failed to fetch prayers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const generateDateList = () => {
    const list = [];
    for (let i = 30; i >= 1; i--) {
      const date = new Date(D_DAY);
      date.setDate(D_DAY.getDate() - i);
      const id = date.toISOString().split('T')[0];
      list.push({
        id,
        date: id,
        dDay: i,
        displayDate: `${date.getMonth() + 1}월 ${date.getDate()}일 (${getDayOfWeek(date)})`
      });
    }
    return list;
  };

  const getDayOfWeek = (date: Date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()];
  };

  const dateList = generateDateList();

  const handleSave = async (id: string, dDay: number) => {
    const prayer = prayers[id];
    if (!prayer?.title || !prayer?.content) {
      setMessage({ type: 'error', text: "제목과 내용을 모두 입력해주세요." });
      return;
    }

    setSaving(id);
    try {
      await setDailyPrayer({
        id,
        date: id,
        dDay,
        title: prayer.title,
        content: prayer.content
      });
      setMessage({ type: 'success', text: `${id} 기도제목이 저장되었습니다.` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Save failed", error);
      setMessage({ type: 'error', text: "저장에 실패했습니다." });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-toss-blue" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-toss-black flex items-center gap-2">
            <Heart className="text-red-500" fill="currentColor" />
            오늘의 기도제목 관리
          </h1>
          <p className="text-toss-gray mt-1">D-30부터 D-1까지의 기도제목을 관리합니다. (기준일: 2026년 6월 5일)</p>
        </div>
      </div>

      {message && (
        <div className={clsx(
          "p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300",
          message.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
        )}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-bold">{message.text}</p>
        </div>
      )}

      <div className="grid gap-4">
        {dateList.map((item) => {
          const prayer = prayers[item.id] || {};
          const isToday = new Date().toISOString().split('T')[0] === item.id;

          return (
            <div 
              key={item.id} 
              className={clsx(
                "bg-white rounded-2xl border transition-all overflow-hidden",
                isToday ? "border-toss-blue ring-1 ring-toss-blue/20" : "border-toss-border"
              )}
            >
              <div className="p-5 flex flex-col md:flex-row gap-6">
                <div className="md:w-48 shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={clsx(
                      "text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider",
                      isToday ? "bg-toss-blue text-white" : "bg-toss-lightGray text-toss-gray"
                    )}>
                      D-{item.dDay}
                    </span>
                    {isToday && <span className="text-[10px] font-bold text-toss-blue">TODAY</span>}
                  </div>
                  <h3 className="text-lg font-bold text-toss-black">{item.displayDate}</h3>
                  <p className="text-xs text-toss-gray font-medium">{item.id}</p>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-toss-gray mb-1.5 ml-1">기도제목 타이틀</label>
                    <input 
                      type="text"
                      placeholder="예: 참석자들의 마음 준비를 위해"
                      className="w-full bg-toss-lightGray/50 border border-toss-border/50 rounded-xl px-4 py-3 text-[15px] font-bold focus:bg-white focus:border-toss-blue outline-none transition-all"
                      value={prayer.title || ""}
                      onChange={(e) => setPrayers(prev => ({ 
                        ...prev, 
                        [item.id]: { ...prev[item.id], title: e.target.value } 
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-toss-gray mb-1.5 ml-1">기도제목 내용</label>
                    <textarea 
                      placeholder="기도내용을 입력하세요..."
                      rows={3}
                      className="w-full bg-toss-lightGray/50 border border-toss-border/50 rounded-xl px-4 py-3 text-[14px] leading-relaxed focus:bg-white focus:border-toss-blue outline-none transition-all resize-none"
                      value={prayer.content || ""}
                      onChange={(e) => setPrayers(prev => ({ 
                        ...prev, 
                        [item.id]: { ...prev[item.id], content: e.target.value } 
                      }))}
                    />
                  </div>
                </div>

                <div className="md:w-32 flex md:flex-col justify-end gap-2 shrink-0">
                  <button 
                    onClick={() => handleSave(item.id, item.dDay)}
                    disabled={saving === item.id}
                    className="flex-1 md:flex-none bg-toss-blue text-white font-bold py-3 px-4 rounded-xl hover:bg-toss-blue/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {saving === item.id ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    저장
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
