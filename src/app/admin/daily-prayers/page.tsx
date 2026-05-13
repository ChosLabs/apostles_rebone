"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Heart,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getAllDailyPrayers, setDailyPrayer } from "@/lib/services/dailyPrayerService";
import { DailyPrayer } from "@/types/database";
import { clsx } from "clsx";

const D_DAY = new Date("2026-06-05");

const getDayOfWeek = (date: Date) => ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];

function generateDateList() {
  const list = [];
  for (let i = 30; i >= 1; i--) {
    const date = new Date(D_DAY);
    date.setDate(D_DAY.getDate() - i);
    const id = date.toISOString().split("T")[0];
    list.push({
      id,
      date: id,
      dDay: i,
      displayDate: `${date.getMonth() + 1}월 ${date.getDate()}일 (${getDayOfWeek(date)})`,
    });
  }
  return list;
}

const dateList = generateDateList();

// ── 발표 화면 ─────────────────────────────────────────────────
function PresentationView({
  index,
  prayers,
  onClose,
  onPrev,
  onNext,
}: {
  index: number;
  prayers: Record<string, Partial<DailyPrayer>>;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = dateList[index];
  const prayer = prayers[item.id] ?? {};
  const hasPrev = index > 0;
  const hasNext = index < dateList.length - 1;

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col overflow-hidden select-none">
      {/* 헤더 */}
      <div className="shrink-0 flex items-center justify-between px-8 py-4 border-b border-toss-border/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
            <Heart size={18} className="text-red-400" fill="currentColor" />
          </div>
          <span className="text-base font-bold text-toss-black">오늘의 기도제목</span>
        </div>

        {/* 페이지네이션 */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="p-2 rounded-xl text-toss-gray hover:bg-toss-lightGray disabled:opacity-20 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-bold text-toss-gray px-1">
            {index + 1} / {dateList.length}
          </span>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className="p-2 rounded-xl text-toss-gray hover:bg-toss-lightGray disabled:opacity-20 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-toss-gray hover:bg-toss-lightGray transition-colors"
        >
          <X size={22} />
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto px-12 lg:px-24 xl:px-40 py-10">
        <div className="flex flex-col items-center min-h-full justify-center">
          {/* D-day 배지 + 날짜 */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-sm font-black bg-toss-blue text-white px-3 py-1 rounded-lg">
              D-{item.dDay}
            </span>
            <span className="text-lg font-bold text-toss-gray">{item.displayDate}</span>
          </div>

          {prayer.title ? (
            <div className="w-full max-w-4xl flex flex-col items-center gap-8">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-toss-black text-center leading-tight">
                {prayer.title}
              </h2>
              {prayer.content && (
                <div className="w-full max-w-3xl bg-toss-lightGray/40 rounded-3xl px-10 py-8 border border-toss-border/30">
                  <p className="text-lg lg:text-xl text-toss-gray text-center leading-[1.9] whitespace-pre-line">
                    {prayer.content}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-toss-lightGray flex items-center justify-center">
                <Heart size={28} className="text-toss-gray/30" />
              </div>
              <p className="text-lg font-bold text-toss-gray/50">등록된 기도제목이 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 하단 이전/다음 버튼 */}
      <div className="shrink-0 flex justify-center gap-3 pb-8">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="flex items-center gap-2 px-6 py-3 bg-toss-lightGray text-toss-gray font-bold rounded-2xl disabled:opacity-20 hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft size={18} />
          이전날
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="flex items-center gap-2 px-6 py-3 bg-toss-lightGray text-toss-gray font-bold rounded-2xl disabled:opacity-20 hover:bg-gray-200 transition-colors"
        >
          다음날
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────
export default function AdminDailyPrayers() {
  const [prayers, setPrayers] = useState<Record<string, Partial<DailyPrayer>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [presentingIndex, setPresentingIndex] = useState<number | null>(null);

  useEffect(() => {
    getAllDailyPrayers()
      .then((existing) => {
        const map: Record<string, DailyPrayer> = {};
        existing.forEach((p) => { map[p.id] = p; });
        setPrayers(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const exitPresentation = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setPresentingIndex(null);
  }, []);

  const enterPresentation = useCallback(async (index: number) => {
    try { await document.documentElement.requestFullscreen(); } catch { /* 미지원 */ }
    setPresentingIndex(index);
  }, []);

  useEffect(() => {
    const handler = () => { if (!document.fullscreenElement) setPresentingIndex(null); };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    if (presentingIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitPresentation();
      if (e.key === "ArrowLeft" && presentingIndex > 0) setPresentingIndex((i) => (i ?? 0) - 1);
      if (e.key === "ArrowRight" && presentingIndex < dateList.length - 1) setPresentingIndex((i) => (i ?? 0) + 1);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [presentingIndex, exitPresentation]);

  const getKSTDateString = (date: Date) => {
    const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().split("T")[0];
  };

  const handleSave = async (id: string, dDay: number) => {
    const prayer = prayers[id];
    if (!prayer?.title || !prayer?.content) {
      setMessage({ type: "error", text: "제목과 내용을 모두 입력해주세요." });
      return;
    }
    setSaving(id);
    try {
      await setDailyPrayer({ id, date: id, dDay, title: prayer.title!, content: prayer.content! });
      setMessage({ type: "success", text: `${id} 기도제목이 저장되었습니다.` });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: "error", text: "저장에 실패했습니다." });
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
    <>
      {presentingIndex !== null && (
        <PresentationView
          index={presentingIndex}
          prayers={prayers}
          onClose={exitPresentation}
          onPrev={() => setPresentingIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() => setPresentingIndex((i) => Math.min(dateList.length - 1, (i ?? 0) + 1))}
        />
      )}

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
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-red-50 text-red-700 border border-red-100"
          )}>
            {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-bold">{message.text}</p>
          </div>
        )}

        <div className="grid gap-4">
          {dateList.map((item, index) => {
            const prayer = prayers[item.id] ?? {};
            const isToday = getKSTDateString(new Date()) === item.id;

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
                        value={prayer.title ?? ""}
                        onChange={(e) => setPrayers((prev) => ({
                          ...prev,
                          [item.id]: { ...prev[item.id], title: e.target.value },
                        }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-toss-gray mb-1.5 ml-1">기도제목 내용</label>
                      <textarea
                        placeholder="기도내용을 입력하세요..."
                        rows={3}
                        className="w-full bg-toss-lightGray/50 border border-toss-border/50 rounded-xl px-4 py-3 text-[14px] leading-relaxed focus:bg-white focus:border-toss-blue outline-none transition-all resize-none"
                        value={prayer.content ?? ""}
                        onChange={(e) => setPrayers((prev) => ({
                          ...prev,
                          [item.id]: { ...prev[item.id], content: e.target.value },
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
                    <button
                      onClick={() => enterPresentation(index)}
                      className="flex-1 md:flex-none bg-toss-lightGray text-toss-gray font-bold py-3 px-4 rounded-xl hover:bg-toss-black hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Maximize2 size={18} />
                      발표
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
