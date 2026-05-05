"use client";

import { useState, useEffect } from "react";
import { BookOpen, MapPin, User, CheckCircle2, Trash2, ArrowLeft, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  subscribeLectures,
  subscribeLectureSettings,
  applyLecture,
  cancelLecture,
} from "@/lib/services/lectureService";
import { Lecture } from "@/types/database";

export default function LecturesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

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
      <header className="sticky top-0 z-50 bg-white px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
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

      <div className="flex px-4 py-3 bg-white border-b border-toss-border/20 sticky top-[61px] z-40">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 py-2 text-sm font-bold transition-colors ${
            activeTab === "all" ? "text-toss-blue border-b-2 border-toss-blue" : "text-toss-gray"
          }`}
        >
          전체 강의
        </button>
        <button
          onClick={() => setActiveTab("my")}
          className={`flex-1 py-2 text-sm font-bold transition-colors ${
            activeTab === "my" ? "text-toss-blue border-b-2 border-toss-blue" : "text-toss-gray"
          }`}
        >
          내 신청 내역{" "}
          {myLectures.length > 0 && (
            <span className="ml-1 text-[10px] bg-toss-blue text-white px-1.5 py-0.5 rounded-full">
              {myLectures.length}
            </span>
          )}
        </button>
      </div>

      <main className="p-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-toss-blue" size={32} />
          </div>
        ) : activeTab === "all" ? (
          lectures.length === 0 ? (
            <div className="py-20 text-center text-toss-gray font-bold text-sm">
              등록된 강의가 없습니다.
            </div>
          ) : (
            lectures.map((lecture) => {
              const isApplied = user ? lecture.applicantIds.includes(user.uid) : false;
              const isFull = lecture.applicantIds.length >= lecture.capacity;
              const remaining = lecture.capacity - lecture.applicantIds.length;
              const isProcessing = processingId === lecture.id;

              return (
                <div key={lecture.id} className="bg-white rounded-toss p-5 shadow-sm border border-toss-border/40 relative">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-[17px] font-bold text-toss-black leading-tight pr-4">{lecture.title}</h3>
                    <span
                      className={clsx(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0",
                        isFull ? "bg-red-50 text-red-500" : "bg-blue-50 text-toss-blue"
                      )}
                    >
                      {isFull ? "마감" : `여유 ${remaining}`}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-toss-gray">
                      <User size={14} className="opacity-60" />
                      <span>{lecture.lecturer}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-toss-gray">
                      <MapPin size={14} className="opacity-60" />
                      <span>{lecture.location}</span>
                    </div>
                  </div>

                  <p className="text-sm text-toss-gray leading-relaxed mb-6">{lecture.description}</p>

                  {isApplied ? (
                    <button className="w-full py-3 rounded-xl bg-toss-lightGray text-toss-gray font-bold text-sm flex items-center justify-center gap-2 cursor-default">
                      <CheckCircle2 size={18} />
                      신청 완료
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApply(lecture.id)}
                      disabled={isFull || !isRegistrationOpen || !!processingId}
                      className={clsx(
                        "w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                        isFull || !isRegistrationOpen
                          ? "bg-toss-lightGray text-toss-gray/50 cursor-not-allowed"
                          : "bg-toss-blue text-white shadow-sm shadow-toss-blue/20"
                      )}
                    >
                      {isProcessing ? (
                        <Loader2 className="animate-spin" size={18} />
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
            })
          )
        ) : myLectures.length > 0 ? (
          myLectures.map((lecture) => (
            <div
              key={lecture.id}
              className="bg-white rounded-toss p-5 shadow-sm border border-toss-border/40 flex justify-between items-center animate-in fade-in slide-in-from-bottom-2"
            >
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-toss-black">{lecture.title}</h3>
                <p className="text-xs text-toss-gray">
                  {lecture.lecturer} · {lecture.location}
                </p>
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
        )}
      </main>
    </div>
  );
}
