"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, MapPin, User, CheckCircle2, Trash2, ArrowLeft, Star, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  subscribeLectures,
  subscribeLectureSettings,
  applyLecture,
  cancelLecture,
} from "@/lib/services/lectureService";
import { Lecture, LectureType } from "@/types/database";
import { LectureRecommender } from "./LectureRecommender";

const LECTURE_TYPE_STYLE: Record<LectureType, string> = {
  실천형: "bg-green-50 text-green-600",
  나눔형: "bg-purple-50 text-purple-600",
  이론형: "bg-blue-50 text-toss-blue",
  상담형: "bg-orange-50 text-orange-500",
};

function getStarredKey(uid: string) {
  return `rebone_starred_lectures_${uid}`;
}

type TabType = "all" | "recommend" | "my";

export default function LecturesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [starredIds, setStarredIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const raw = localStorage.getItem(getStarredKey(user.uid));
    setStarredIds(raw ? JSON.parse(raw) : []);
  }, [user]);

  const toggleStar = useCallback((id: string) => {
    if (!user) return;
    setStarredIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(getStarredKey(user.uid), JSON.stringify(next));
      return next;
    });
  }, [user]);

  useEffect(() => {
    const unsubLectures = subscribeLectures((data) => {
      setLectures(data);
      setLoading(false);
    });
    const unsubSettings = subscribeLectureSettings(setIsRegistrationOpen);
    return () => {
      unsubLectures();
      unsubSettings();
    };
  }, []);

  const myLectures = lectures.filter((l) => user && l.applicantIds.includes(user.uid));
  const hasApplied = myLectures.length > 0;

  const sortedLectures = [
    ...lectures.filter((l) => starredIds.includes(l.id)),
    ...lectures.filter((l) => !starredIds.includes(l.id)),
  ];

  const handleApply = async (lectureId: string) => {
    if (!user || !isRegistrationOpen || processingId) return;
    try {
      setProcessingId(lectureId);
      await applyLecture(lectureId, user.uid);
    } catch (e: any) {
      alert(e.message || "신청 중 오류가 발생했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (lectureId: string) => {
    if (!user || processingId) return;
    if (!confirm("강의 신청을 취소하시겠습니까?")) return;
    try {
      setProcessingId(lectureId);
      await cancelLecture(lectureId, user.uid);
    } catch (e) {
      alert("취소 중 오류가 발생했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-surface px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
        <Link href="/" className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
          <ArrowLeft size={24} className="text-toss-black" />
        </Link>
        <h1 className="text-lg font-bold text-toss-black">선택강의 신청</h1>
        {!isRegistrationOpen && (
          <span className="ml-auto text-[10px] font-bold bg-red-50 text-red-500 px-2 py-1 rounded-lg">
            신청 마감
          </span>
        )}
      </header>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-surface border-b border-toss-border/20 sticky top-[61px] z-40">
        {(
          [
            { id: "all",       label: "전체 강의" },
            { id: "recommend", label: "맞춤 추천", icon: <Sparkles size={13} /> },
            { id: "my",        label: "내 신청" },
          ] as { id: TabType; label: string; icon?: React.ReactNode }[]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "flex-1 py-3 text-xs font-bold transition-colors flex items-center justify-center gap-1",
              activeTab === tab.id
                ? "text-toss-blue border-b-2 border-toss-blue"
                : "text-toss-gray"
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.id === "my" && myLectures.length > 0 && (
              <span className="ml-0.5 text-[10px] bg-toss-blue text-white px-1.5 py-0.5 rounded-full leading-none">
                {myLectures.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="p-4 flex flex-col gap-3">

        {/* ── 맞춤 추천 탭 ───────────────────────────────────────────────── */}
        {activeTab === "recommend" && (
          <LectureRecommender lectures={lectures} />
        )}

        {/* ── 전체 강의 탭 ────────────────────────────────────────────────── */}
        {activeTab === "all" && (
          loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-toss-blue" size={32} />
            </div>
          ) : lectures.length === 0 ? (
            <div className="py-20 text-center text-toss-gray font-bold text-sm">
              등록된 강의가 없습니다.
            </div>
          ) : (
            <>
              {starredIds.length > 0 && (
                <p className="text-[11px] font-bold text-yellow-500 flex items-center gap-1 px-1">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  별표 강의 {starredIds.filter((id) => lectures.some((l) => l.id === id)).length}개가 상단에 고정되어 있습니다
                </p>
              )}
              {sortedLectures.map((lecture) => {
                const isApplied    = user ? lecture.applicantIds.includes(user.uid) : false;
                const isFull       = lecture.applicantIds.length >= lecture.capacity;
                const remaining    = lecture.capacity - lecture.applicantIds.length;
                const isProcessing = processingId === lecture.id;
                const isStarred    = starredIds.includes(lecture.id);
                const isBlocked    = hasApplied && !isApplied;

                return (
                  <div
                    key={lecture.id}
                    className={clsx(
                      "bg-white dark:bg-surface rounded-toss p-5 shadow-sm border relative",
                      isStarred ? "border-yellow-300" : "border-toss-border/40"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-[17px] font-bold text-toss-black leading-tight pr-2">
                        {lecture.title}
                      </h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={clsx(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded",
                          isFull ? "bg-red-50 text-red-500" : "bg-blue-50 text-toss-blue"
                        )}>
                          {isFull ? "마감" : `여유 ${remaining}`}
                        </span>
                        <button
                          onClick={() => toggleStar(lecture.id)}
                          className="p-0.5 transition-transform active:scale-90"
                          aria-label={isStarred ? "별표 해제" : "별표 추가"}
                        >
                          <Star
                            size={20}
                            className={clsx(
                              "transition-colors",
                              isStarred ? "fill-yellow-400 text-yellow-400" : "text-toss-gray/40"
                            )}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {lecture.lectureType && (
                        <span className={clsx(
                          "text-[10px] font-black px-1.5 py-0.5 rounded",
                          LECTURE_TYPE_STYLE[lecture.lectureType]
                        )}>
                          #{lecture.lectureType}
                        </span>
                      )}
                      {lecture.location && (
                        <span className="text-[10px] font-bold text-toss-gray bg-toss-lightGray px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <MapPin size={9} />
                          {lecture.location}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-toss-gray mb-4">
                      <User size={14} className="opacity-60" />
                      <span>{lecture.lecturer}</span>
                    </div>

                    <p className="text-sm text-toss-gray leading-relaxed mb-6">
                      {lecture.description}
                    </p>

                    {isApplied ? (
                      <button className="w-full py-3 rounded-xl bg-toss-lightGray text-toss-gray font-bold text-sm flex items-center justify-center gap-2 cursor-default">
                        <CheckCircle2 size={18} />
                        신청 완료
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApply(lecture.id)}
                        disabled={isBlocked || isFull || !isRegistrationOpen || !!processingId}
                        className={clsx(
                          "w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                          isBlocked || isFull || !isRegistrationOpen
                            ? "bg-toss-lightGray text-toss-gray/50 cursor-not-allowed"
                            : "bg-toss-blue text-white shadow-sm shadow-toss-blue/20"
                        )}
                      >
                        {isProcessing ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : isBlocked ? (
                          "이미 다른 강의를 신청했습니다"
                        ) : isFull ? (
                          "정원이 가득 찼습니다"
                        ) : !isRegistrationOpen ? (
                          "신청 기간이 아닙니다"
                        ) : (
                          "신청하기"
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </>
          )
        )}

        {/* ── 내 신청 탭 ──────────────────────────────────────────────────── */}
        {activeTab === "my" && (
          myLectures.length > 0 ? (
            myLectures.map((lecture) => (
              <div
                key={lecture.id}
                className="bg-white dark:bg-surface rounded-toss p-5 shadow-sm border border-toss-border/40 flex justify-between items-center animate-in fade-in slide-in-from-bottom-2"
              >
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold text-toss-black">{lecture.title}</h3>
                  <div className="flex items-center gap-2">
                    {lecture.lectureType && (
                      <span className={clsx(
                        "text-[10px] font-black px-1.5 py-0.5 rounded",
                        LECTURE_TYPE_STYLE[lecture.lectureType]
                      )}>
                        #{lecture.lectureType}
                      </span>
                    )}
                    <p className="text-xs text-toss-gray">
                      {lecture.lecturer}{lecture.location ? ` · ${lecture.location}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCancel(lecture.id)}
                  disabled={processingId === lecture.id}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                >
                  {processingId === lecture.id ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Trash2 size={20} />
                  )}
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-toss-lightGray rounded-full flex items-center justify-center text-toss-gray/30 mb-4">
                <BookOpen size={32} />
              </div>
              <p className="text-base font-bold text-toss-black mb-1">신청한 강의가 없어요</p>
              <p className="text-sm text-toss-gray mb-6">
                전체 강의 목록에서 마음에 드는 강의를
                <br />
                신청해보세요.
              </p>
              <button
                onClick={() => setActiveTab("all")}
                className="px-6 py-2.5 bg-toss-blue text-white rounded-full font-bold text-sm shadow-sm"
              >
                강의 둘러보기
              </button>
            </div>
          )
        )}
      </main>
    </div>
  );
}
