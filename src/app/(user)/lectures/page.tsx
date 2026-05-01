"use client";

import { useState } from "react";
import { BookOpen, MapPin, User, ChevronRight, CheckCircle2, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Lecture {
  id: number;
  title: string;
  lecturer: string;
  location: string;
  description: string;
  capacity: number;
  current: number;
}

const MOCK_LECTURES: Lecture[] = [
  { id: 1, title: "기독교 세계관으로 세상 읽기", lecturer: "이진수 교수", location: "대강당 A", description: "현대 사회의 다양한 이슈들을 기독교적 시각으로 분석하고 토론합니다.", capacity: 50, current: 42 },
  { id: 2, title: "청년들을 위한 재정 관리", lecturer: "박영미 회계사", location: "세미나실 201", description: "성경적 재정 원칙과 실무적인 자산 관리 방법을 배웁니다.", capacity: 30, current: 28 },
  { id: 3, title: "건강한 이성 교제와 결혼", lecturer: "김철수 목사", location: "소예배실", description: "하나님이 기뻐하시는 만남과 관계 형성에 대해 나눕니다.", capacity: 40, current: 40 },
  { id: 4, title: "일상 속의 예배자", lecturer: "최영희 간사", location: "세미나실 102", description: "삶의 모든 순간이 예배가 되는 비결을 발견합니다.", capacity: 25, current: 15 },
];

export default function LecturesPage() {
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [myLectures, setMyLectures] = useState<number[]>([]);

  const handleApply = (id: number) => {
    if (myLectures.includes(id)) return;
    setMyLectures([...myLectures, id]);
    alert("강의 신청이 완료되었습니다.");
  };

  const handleCancel = (id: number) => {
    if (confirm("강의 신청을 취소하시겠습니까?")) {
      setMyLectures(myLectures.filter(lectureId => lectureId !== id));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
        <Link href="/" className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
          <ArrowLeft size={24} className="text-toss-black" />
        </Link>
        <h1 className="text-lg font-bold text-toss-black">선택강의 신청</h1>
      </header>

      <div className="flex px-4 py-3 bg-white border-b border-toss-border/20 sticky top-[61px] z-40">
        <button 
          onClick={() => setActiveTab("all")}
          className={`flex-1 py-2 text-sm font-bold transition-colors ${activeTab === "all" ? "text-toss-blue border-b-2 border-toss-blue" : "text-toss-gray"}`}
        >
          전체 강의
        </button>
        <button 
          onClick={() => setActiveTab("my")}
          className={`flex-1 py-2 text-sm font-bold transition-colors ${activeTab === "my" ? "text-toss-blue border-b-2 border-toss-blue" : "text-toss-gray"}`}
        >
          내 신청 내역 {myLectures.length > 0 && <span className="ml-1 text-[10px] bg-toss-blue text-white px-1.5 py-0.5 rounded-full">{myLectures.length}</span>}
        </button>
      </div>

      <main className="p-4 flex flex-col gap-3">
        {activeTab === "all" ? (
          MOCK_LECTURES.map((lecture) => (
            <div key={lecture.id} className="bg-white rounded-toss p-5 shadow-sm border border-toss-border/40">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-[17px] font-bold text-toss-black leading-tight">{lecture.title}</h3>
                <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${lecture.current >= lecture.capacity ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-toss-blue'}`}>
                  {lecture.current >= lecture.capacity ? '마감' : `여유 ${lecture.capacity - lecture.current}`}
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

              <p className="text-sm text-toss-gray leading-relaxed mb-6">
                {lecture.description}
              </p>

              {myLectures.includes(lecture.id) ? (
                <button className="w-full py-3 rounded-xl bg-toss-lightGray text-toss-gray font-bold text-sm flex items-center justify-center gap-2 cursor-default">
                  <CheckCircle2 size={18} />
                  신청 완료
                </button>
              ) : (
                <button 
                  onClick={() => handleApply(lecture.id)}
                  disabled={lecture.current >= lecture.capacity}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${
                    lecture.current >= lecture.capacity 
                    ? 'bg-toss-lightGray text-toss-gray/50 cursor-not-allowed' 
                    : 'bg-toss-blue text-white shadow-sm shadow-toss-blue/20'
                  }`}
                >
                  {lecture.current >= lecture.capacity ? '정원이 가득 찼습니다' : '신청하기'}
                </button>
              )}
            </div>
          ))
        ) : (
          myLectures.length > 0 ? (
            MOCK_LECTURES.filter(l => myLectures.includes(l.id)).map((lecture) => (
              <div key={lecture.id} className="bg-white rounded-toss p-5 shadow-sm border border-toss-border/40 flex justify-between items-center animate-in fade-in slide-in-from-bottom-2">
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold text-toss-black">{lecture.title}</h3>
                  <p className="text-xs text-toss-gray">{lecture.lecturer} · {lecture.location}</p>
                </div>
                <button 
                  onClick={() => handleCancel(lecture.id)}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-toss-lightGray rounded-full flex items-center justify-center text-toss-gray/30 mb-4">
                <BookOpen size={32} />
              </div>
              <p className="text-base font-bold text-toss-black mb-1">신청한 강의가 없어요</p>
              <p className="text-sm text-toss-gray mb-6">전체 강의 목록에서 마음에 드는 강의를<br />신청해보세요.</p>
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
