"use client";

import { useState } from "react";
import { BookOpen, Plus, Trash2, Edit, Save, X, ArrowLeft } from "lucide-react";
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

const INITIAL_LECTURES: Lecture[] = [
  { id: 1, title: "기독교 세계관으로 세상 읽기", lecturer: "이진수 교수", location: "대강당 A", description: "현대 사회의 다양한 이슈들을 기독교적 시각으로 분석하고 토론합니다.", capacity: 50, current: 42 },
  { id: 2, title: "청년들을 위한 재정 관리", lecturer: "박영미 회계사", location: "세미나실 201", description: "성경적 재정 원칙과 실무적인 자산 관리 방법을 배웁니다.", capacity: 30, current: 28 },
];

export default function AdminLecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>(INITIAL_LECTURES);
  const [isAdding, setIsAdding] = useState(false);
  const [newLecture, setNewLecture] = useState<Partial<Lecture>>({
    title: "", lecturer: "", location: "", description: "", capacity: 30, current: 0
  });

  const handleAdd = () => {
    if (!newLecture.title || !newLecture.lecturer) return;
    const lecture: Lecture = {
      id: Date.now(),
      title: newLecture.title!,
      lecturer: newLecture.lecturer!,
      location: newLecture.location || "미정",
      description: newLecture.description || "",
      capacity: newLecture.capacity || 30,
      current: 0
    };
    setLectures([...lectures, lecture]);
    setIsAdding(false);
    setNewLecture({ title: "", lecturer: "", location: "", description: "", capacity: 30, current: 0 });
  };

  const handleDelete = (id: number) => {
    if (confirm("강의를 삭제하시겠습니까?")) {
      setLectures(lectures.filter(l => l.id !== id));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-toss-lightGray/30 pb-20">
      <header className="sticky top-0 z-50 bg-white px-5 py-4 flex items-center justify-between border-b border-toss-border/40">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
            <ArrowLeft size={24} className="text-toss-black" />
          </Link>
          <h1 className="text-lg font-bold text-toss-black">강의 관리</h1>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-toss-blue text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
        >
          <Plus size={18} />
          강의 추가
        </button>
      </header>

      <main className="p-4 flex flex-col gap-4">
        {isAdding && (
          <div className="bg-white rounded-toss p-6 shadow-md border-2 border-toss-blue/20 animate-in slide-in-from-top duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-toss-black">새 강의 등록</h2>
              <button onClick={() => setIsAdding(false)} className="text-toss-gray"><X size={20} /></button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-toss-gray mb-1 block">강의 제목</label>
                <input 
                  type="text" 
                  value={newLecture.title}
                  onChange={(e) => setNewLecture({...newLecture, title: e.target.value})}
                  className="w-full bg-toss-lightGray/50 border border-toss-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-toss-blue transition-colors"
                  placeholder="제목을 입력하세요"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-toss-gray mb-1 block">강사명</label>
                  <input 
                    type="text" 
                    value={newLecture.lecturer}
                    onChange={(e) => setNewLecture({...newLecture, lecturer: e.target.value})}
                    className="w-full bg-toss-lightGray/50 border border-toss-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-toss-blue transition-colors"
                    placeholder="이름"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-toss-gray mb-1 block">장소</label>
                  <input 
                    type="text" 
                    value={newLecture.location}
                    onChange={(e) => setNewLecture({...newLecture, location: e.target.value})}
                    className="w-full bg-toss-lightGray/50 border border-toss-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-toss-blue transition-colors"
                    placeholder="강의실"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-toss-gray mb-1 block">강의 설명</label>
                <textarea 
                  value={newLecture.description}
                  onChange={(e) => setNewLecture({...newLecture, description: e.target.value})}
                  className="w-full bg-toss-lightGray/50 border border-toss-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-toss-blue transition-colors min-h-[100px]"
                  placeholder="내용을 입력하세요"
                />
              </div>
              <button 
                onClick={handleAdd}
                className="w-full bg-toss-blue text-white py-4 rounded-xl font-bold mt-2 shadow-lg shadow-toss-blue/20 active:scale-95 transition-all"
              >
                등록하기
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {lectures.map((lecture) => (
            <div key={lecture.id} className="bg-white rounded-toss p-5 shadow-sm border border-toss-border/40 flex justify-between items-center">
              <div className="flex flex-col gap-1 min-w-0">
                <h3 className="text-base font-bold text-toss-black truncate">{lecture.title}</h3>
                <p className="text-xs text-toss-gray">{lecture.lecturer} · {lecture.location}</p>
                <p className="text-[10px] text-toss-blue font-bold mt-1">현재 {lecture.current}/{lecture.capacity}명 신청</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button className="p-3 text-toss-gray hover:bg-toss-lightGray rounded-full transition-colors">
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(lecture.id)}
                  className="p-3 text-red-400 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
