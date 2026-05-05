"use client";

import { useState } from "react";
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  Users, 
  CheckCircle2, 
  XCircle,
  ChevronRight,
  Info
} from "lucide-react";
import { clsx } from "clsx";

interface Participant {
  id: string;
  name: string;
  team: string;
  phone: string;
}

interface Lecture {
  id: number;
  title: string;
  lecturer: string;
  location: string;
  description: string;
  capacity: number;
  current: number;
  applicants: Participant[];
}

const MOCK_PARTICIPANTS: Participant[] = [
  { id: "1", name: "홍길동", team: "1팀", phone: "010-1234-5678" },
  { id: "2", name: "김철수", team: "2팀", phone: "010-2345-6789" },
  { id: "3", name: "이영희", team: "기신자팀", phone: "010-3456-7890" },
];

const INITIAL_LECTURES: Lecture[] = [
  { 
    id: 1, 
    title: "기독교 세계관으로 세상 읽기", 
    lecturer: "이진수 교수", 
    location: "대강당 A", 
    description: "현대 사회의 다양한 이슈들을 기독교적 시각으로 분석하고 토론합니다.", 
    capacity: 50, 
    current: 42,
    applicants: [...MOCK_PARTICIPANTS]
  },
  { 
    id: 2, 
    title: "청년들을 위한 재정 관리", 
    lecturer: "박영미 회계사", 
    location: "세미나실 201", 
    description: "성경적 재정 원칙과 실무적인 자산 관리 방법을 배웁니다.", 
    capacity: 30, 
    current: 28,
    applicants: [...MOCK_PARTICIPANTS].slice(0, 2)
  },
];

export default function AdminLecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>(INITIAL_LECTURES);
  const [isAdding, setIsAdding] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  
  const [newLecture, setNewLecture] = useState<Partial<Lecture>>({
    title: "", lecturer: "", location: "", description: "", capacity: 30
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
      current: 0,
      applicants: []
    };
    setLectures([...lectures, lecture]);
    setIsAdding(false);
    setNewLecture({ title: "", lecturer: "", location: "", description: "", capacity: 30 });
  };

  const handleDelete = (id: number) => {
    if (confirm("강의를 삭제하시겠습니까?")) {
      setLectures(lectures.filter(l => l.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-toss-black">강의 관리</h1>
          <p className="text-xs lg:text-sm text-toss-gray mt-1">강의를 등록하고 신청 인원을 관리합니다.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={clsx(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm transition-all",
            isRegistrationOpen ? "bg-green-50 border-green-200 text-green-600" : "bg-red-50 border-red-200 text-red-600"
          )}>
            {isRegistrationOpen ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            수강신청 {isRegistrationOpen ? "진행 중" : "마감됨"}
          </div>
          <button 
            onClick={() => setIsRegistrationOpen(!isRegistrationOpen)}
            className={clsx(
              "px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm",
              isRegistrationOpen ? "bg-white border border-toss-border text-toss-black hover:bg-toss-lightGray" : "bg-toss-blue text-white hover:bg-toss-blue/90 shadow-toss-blue/20"
            )}
          >
            신청 {isRegistrationOpen ? "중단하기" : "시작하기"}
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-toss-blue text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-toss-blue/90 transition-all shadow-sm shadow-toss-blue/20 text-sm"
          >
            <Plus size={20} />
            강의 추가
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-toss-border shadow-sm">
          <p className="text-xs font-bold text-toss-gray mb-1 italic uppercase">Total Lectures</p>
          <p className="text-xl font-black text-toss-black">{lectures.length}개</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-toss-border shadow-sm">
          <p className="text-xs font-bold text-toss-gray mb-1 italic uppercase">Total Applicants</p>
          <p className="text-xl font-black text-toss-blue">
            {lectures.reduce((acc, curr) => acc + curr.current, 0)}명
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-toss-border shadow-sm">
          <p className="text-xs font-bold text-toss-gray mb-1 italic uppercase">Average Fill Rate</p>
          <p className="text-xl font-black text-toss-black">
            {Math.round((lectures.reduce((acc, curr) => acc + curr.current, 0) / lectures.reduce((acc, curr) => acc + curr.capacity, 0)) * 100)}%
          </p>
        </div>
      </div>

      {/* Lecture List */}
      <div className="bg-white rounded-3xl border border-toss-border shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-toss-lightGray/50 text-toss-gray text-[10px] lg:text-[11px] font-black uppercase tracking-wider">
                <th className="px-6 py-4">강의 정보</th>
                <th className="px-6 py-4">강사 / 장소</th>
                <th className="px-6 py-4">신청 현황</th>
                <th className="px-6 py-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-toss-border">
              {lectures.map((lecture) => (
                <tr key={lecture.id} className="hover:bg-toss-lightGray/20 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-0.5 min-w-[200px]">
                      <span className="text-sm font-bold text-toss-black">{lecture.title}</span>
                      <p className="text-[11px] text-toss-gray line-clamp-1">{lecture.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-toss-black">{lecture.lecturer}</span>
                      <span className="text-[11px] text-toss-gray font-medium">{lecture.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5 w-32">
                      <div className="flex justify-between items-end">
                        <span className="text-[11px] font-black text-toss-blue">{lecture.current}/{lecture.capacity}</span>
                        <span className="text-[10px] text-toss-gray font-bold">{Math.round((lecture.current / lecture.capacity) * 100)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-toss-lightGray rounded-full overflow-hidden">
                        <div 
                          className={clsx(
                            "h-full transition-all duration-500",
                            (lecture.current / lecture.capacity) >= 0.9 ? "bg-red-500" : "bg-toss-blue"
                          )} 
                          style={{ width: `${(lecture.current / lecture.capacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end items-center gap-1">
                      <button 
                        onClick={() => setSelectedLecture(lecture)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-toss-blue/5 text-toss-blue font-bold text-xs rounded-lg hover:bg-toss-blue/10 transition-all"
                      >
                        <Users size={14} />
                        신청 명단
                      </button>
                      <button className="p-2 text-toss-gray hover:text-toss-blue hover:bg-toss-blue/5 rounded-lg transition-all"><Edit size={16} /></button>
                      <button 
                        onClick={() => handleDelete(lecture.id)}
                        className="p-2 text-toss-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      ><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applicant Detail Modal */}
      {selectedLecture && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedLecture(null)}>
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 lg:px-8 py-4 lg:py-6 border-b border-toss-border flex justify-between items-center shrink-0">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg lg:text-xl font-black text-toss-black">{selectedLecture.title}</h2>
                  <span className="text-xs font-black bg-toss-blue/10 text-toss-blue px-2 py-0.5 rounded-lg">
                    {selectedLecture.current}명 신청
                  </span>
                </div>
                <p className="text-xs lg:text-sm text-toss-gray font-medium">수강 신청한 참가자 명단입니다.</p>
              </div>
              <button onClick={() => setSelectedLecture(null)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors text-toss-gray">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 lg:p-8 overflow-y-auto">
              {selectedLecture.applicants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedLecture.applicants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-4 bg-toss-lightGray/30 rounded-2xl border border-toss-border/40">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-toss-gray text-xs">
                          {participant.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-toss-black">{participant.name}</p>
                          <p className="text-[10px] text-toss-gray font-medium">{participant.team}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-toss-gray">{participant.phone.slice(-4)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center gap-2 text-toss-gray">
                  <Info size={40} strokeWidth={1.5} />
                  <p className="font-bold text-sm">신청자가 없습니다.</p>
                </div>
              )}
            </div>
            
            <div className="px-6 lg:px-8 py-5 bg-toss-lightGray/20 border-t border-toss-border flex justify-end">
              <button 
                onClick={() => setSelectedLecture(null)}
                className="px-6 py-2.5 bg-toss-black text-white font-bold rounded-xl text-sm active:scale-95 transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lecture Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setIsAdding(false)}>
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 lg:px-8 py-4 lg:py-6 border-b border-toss-border flex justify-between items-center">
              <h2 className="text-lg lg:text-xl font-black text-toss-black">새 강의 등록</h2>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors text-toss-gray">
                <X size={24} />
              </button>
            </div>
            <form className="p-6 lg:p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-toss-gray px-1 uppercase tracking-wider">강의 제목</label>
                <input 
                  type="text" 
                  value={newLecture.title}
                  onChange={(e) => setNewLecture({...newLecture, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm"
                  placeholder="예: 기독교 세계관 기초"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-toss-gray px-1 uppercase tracking-wider">강사명</label>
                  <input 
                    type="text" 
                    value={newLecture.lecturer}
                    onChange={(e) => setNewLecture({...newLecture, lecturer: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-toss-gray px-1 uppercase tracking-wider">장소</label>
                  <input 
                    type="text" 
                    value={newLecture.location}
                    onChange={(e) => setNewLecture({...newLecture, location: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-toss-gray px-1 uppercase tracking-wider">정원</label>
                  <input 
                    type="number" 
                    value={newLecture.capacity}
                    onChange={(e) => setNewLecture({...newLecture, capacity: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-toss-gray px-1 uppercase tracking-wider">강의 설명</label>
                <textarea 
                  value={newLecture.description}
                  onChange={(e) => setNewLecture({...newLecture, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm resize-none"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 rounded-2xl font-bold text-toss-gray bg-toss-lightGray hover:bg-toss-border transition-all">취소</button>
                <button 
                  type="button"
                  onClick={handleAdd}
                  className="flex-[2] py-4 rounded-2xl font-bold text-white bg-toss-blue hover:bg-toss-blue/90 transition-all shadow-lg shadow-toss-blue/20"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
