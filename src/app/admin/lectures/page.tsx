"use client";

import { useState, useEffect } from "react";
import {
  BookOpen, Plus, Trash2, Edit, X, Users,
  CheckCircle2, XCircle, Info, Loader2, MapPin, Tag, Download
} from "lucide-react";
import { clsx } from "clsx";
import {
  subscribeLectures,
  subscribeLectureSettings,
  addLecture,
  updateLecture,
  deleteLecture,
  setRegistrationOpen,
} from "@/lib/services/lectureService";
import { getParticipants } from "@/lib/services/participantService";
import { Lecture, LectureType, Participant } from "@/types/database";
import { exportMultiSheetToExcel, exportToExcel } from "@/lib/utils/excel";

const LECTURE_TYPE_OPTIONS: LectureType[] = ["실천형", "나눔형", "이론형", "상담형"];

const LECTURE_TYPE_STYLE: Record<LectureType, string> = {
  실천형: "bg-green-50 text-green-600",
  나눔형: "bg-purple-50 text-purple-600",
  이론형: "bg-blue-50 text-toss-blue",
  상담형: "bg-orange-50 text-orange-500",
};

const ZONE_STYLE: Record<string, string> = {
  "ZONE A": "bg-red-50 text-red-500",
  "ZONE B": "bg-yellow-50 text-yellow-600",
  "ZONE C": "bg-green-50 text-green-600",
  "ZONE D": "bg-blue-50 text-toss-blue",
  "ZONE E": "bg-purple-50 text-purple-600",
};

type LectureForm = {
  title: string;
  lecturer: string;
  location: string;
  lectureType: LectureType | "";
  description: string;
  capacity: number;
};

const EMPTY_FORM: LectureForm = {
  title: "", lecturer: "", location: "", lectureType: "", description: "", capacity: 30,
};

export default function AdminLecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isRegistrationOpen, setIsRegistrationOpenState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [applicants, setApplicants] = useState<Participant[]>([]);
  const [form, setForm] = useState<LectureForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingReg, setIsTogglingReg] = useState(false);

  useEffect(() => {
    const unsubL = subscribeLectures((data) => {
      setLectures(data);
      setLoading(false);
    });
    const unsubS = subscribeLectureSettings(setIsRegistrationOpenState);
    return () => { unsubL(); unsubS(); };
  }, []);

  // Update selected lecture when data changes
  useEffect(() => {
    if (selectedLecture) {
      const updated = lectures.find((l) => l.id === selectedLecture.id);
      if (updated) setSelectedLecture(updated);
    }
  }, [lectures]);

  const openAddModal = () => {
    setEditingLecture(null);
    setForm(EMPTY_FORM);
    setIsAdding(true);
  };

  const openEditModal = (lecture: Lecture) => {
    setEditingLecture(lecture);
    setForm({
      title: lecture.title,
      lecturer: lecture.lecturer,
      location: lecture.location,
      lectureType: lecture.lectureType ?? "",
      description: lecture.description,
      capacity: lecture.capacity,
    });
    setIsAdding(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.lecturer) {
      alert("강의 제목과 강사명은 필수입니다.");
      return;
    }
    try {
      setIsSaving(true);
      const payload = { ...form, lectureType: form.lectureType || undefined };
      if (editingLecture) {
        await updateLecture(editingLecture.id, payload);
      } else {
        await addLecture(payload);
      }
      setIsAdding(false);
      setEditingLecture(null);
    } catch (e) {
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("강의를 삭제하시겠습니까?")) return;
    try {
      await deleteLecture(id);
    } catch (e) {
      alert("삭제에 실패했습니다.");
    }
  };

  const handleToggleRegistration = async () => {
    try {
      setIsTogglingReg(true);
      await setRegistrationOpen(!isRegistrationOpen);
    } catch (e) {
      alert("변경에 실패했습니다.");
    } finally {
      setIsTogglingReg(false);
    }
  };

  const handleViewApplicants = async (lecture: Lecture) => {
    setSelectedLecture(lecture);
    try {
      const all = await getParticipants();
      setApplicants(all.filter((p) => lecture.applicantIds.includes(p.id)));
    } catch (e) {
      setApplicants([]);
    }
  };

  const totalApplicants = lectures.reduce((acc, l) => acc + l.applicantIds.length, 0);
  const totalCapacity = lectures.reduce((acc, l) => acc + l.capacity, 0);
  const fillRate = totalCapacity > 0 ? Math.round((totalApplicants / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-toss-black">강의 관리</h1>
          <p className="text-xs lg:text-sm text-toss-gray mt-1">강의를 등록하고 신청 인원을 관리합니다.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={clsx(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm",
            isRegistrationOpen ? "bg-green-50 border-green-200 text-green-600" : "bg-red-50 border-red-200 text-red-600"
          )}>
            {isRegistrationOpen ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            수강신청 {isRegistrationOpen ? "진행 중" : "마감됨"}
          </div>
          <button
            onClick={handleToggleRegistration}
            disabled={isTogglingReg}
            className={clsx(
              "px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-50",
              isRegistrationOpen
                ? "bg-white border border-toss-border text-toss-black hover:bg-toss-lightGray"
                : "bg-toss-blue text-white hover:bg-toss-blue/90 shadow-toss-blue/20"
            )}
          >
            {isTogglingReg ? (
              <Loader2 className="animate-spin" size={18} />
            ) : isRegistrationOpen ? "신청 중단하기" : "신청 시작하기"}
          </button>
          <button
            onClick={async () => {
              const all = await getParticipants();
              const participantMap = Object.fromEntries(all.map(p => [p.id, p]));
              const sheets = lectures.map(l => ({
                sheetName: l.title,
                rows: l.applicantIds.length === 0
                  ? [{ 이름: "", 팀: "", 조: "", "전화번호": "" }]
                  : l.applicantIds.map((id, idx) => {
                      const p = participantMap[id];
                      return {
                        번호: idx + 1,
                        이름: p?.name ?? id,
                        팀: p?.team ?? "",
                        조: p?.group ?? "",
                        "전화번호": p?.phone ?? "",
                      };
                    }),
              }));
              exportMultiSheetToExcel(sheets, "강의_신청_명단");
            }}
            className="bg-white text-toss-black border border-toss-border px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-toss-lightGray transition-all shadow-sm text-sm"
          >
            <Download size={16} />
            신청자 명단
          </button>
          <button
            onClick={async () => {
              const all = await getParticipants();
              const appliedIds = new Set(lectures.flatMap(l => l.applicantIds));
              const rows = all
                .filter(p => !appliedIds.has(p.id))
                .map((p, idx) => ({
                  번호: idx + 1,
                  이름: p.name,
                  팀: p.team ?? "",
                  조: p.group ?? "",
                  전화번호: p.phone ?? "",
                }));
              exportToExcel(rows, "강의_미신청_명단");
            }}
            className="bg-white text-toss-black border border-toss-border px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-toss-lightGray transition-all shadow-sm text-sm"
          >
            <Download size={16} />
            미신청자 명단
          </button>
          <button
            onClick={openAddModal}
            className="bg-toss-blue text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-toss-blue/90 transition-all shadow-sm shadow-toss-blue/20 text-sm"
          >
            <Plus size={20} />
            강의 추가
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-toss-border shadow-sm">
          <p className="text-xs font-bold text-toss-gray mb-1 uppercase">Total Lectures</p>
          <p className="text-xl font-black text-toss-black">{lectures.length}개</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-toss-border shadow-sm">
          <p className="text-xs font-bold text-toss-gray mb-1 uppercase">Total Applicants</p>
          <p className="text-xl font-black text-toss-blue">{totalApplicants}명</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-toss-border shadow-sm">
          <p className="text-xs font-bold text-toss-gray mb-1 uppercase">Average Fill Rate</p>
          <p className="text-xl font-black text-toss-black">{fillRate}%</p>
        </div>
      </div>

      {/* Lecture Table */}
      <div className="bg-white rounded-3xl border border-toss-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-toss-lightGray/50 text-toss-gray text-[10px] lg:text-[11px] font-black uppercase tracking-wider">
                <th className="px-6 py-4">강의 정보</th>
                <th className="px-6 py-4">강사 / 존</th>
                <th className="px-6 py-4">신청 현황</th>
                <th className="px-6 py-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-toss-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <Loader2 className="animate-spin text-toss-blue mx-auto" size={32} />
                  </td>
                </tr>
              ) : lectures.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-toss-gray font-bold text-sm">
                    등록된 강의가 없습니다.
                  </td>
                </tr>
              ) : (
                lectures.map((lecture) => {
                  const current = lecture.applicantIds.length;
                  const pct = Math.round((current / lecture.capacity) * 100);
                  return (
                    <tr key={lecture.id} className="hover:bg-toss-lightGray/20 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1 min-w-[200px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-toss-black">{lecture.title}</span>
                            {lecture.lectureType && (
                              <span className={clsx(
                                "text-[10px] font-black px-1.5 py-0.5 rounded shrink-0",
                                LECTURE_TYPE_STYLE[lecture.lectureType]
                              )}>
                                #{lecture.lectureType}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-toss-gray line-clamp-1">{lecture.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-toss-black">{lecture.lecturer}</span>
                          {lecture.location && (
                            <span className={clsx(
                              "text-[10px] font-black px-1.5 py-0.5 rounded w-fit",
                              ZONE_STYLE[lecture.location] ?? "bg-toss-lightGray text-toss-gray"
                            )}>
                              {lecture.location}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5 w-32">
                          <div className="flex justify-between items-end">
                            <span className="text-[11px] font-black text-toss-blue">{current}/{lecture.capacity}</span>
                            <span className="text-[10px] text-toss-gray font-bold">{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-toss-lightGray rounded-full overflow-hidden">
                            <div
                              className={clsx("h-full transition-all duration-500", pct >= 90 ? "bg-red-500" : "bg-toss-blue")}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end items-center gap-1">
                          <button
                            onClick={() => handleViewApplicants(lecture)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-toss-blue/5 text-toss-blue font-bold text-xs rounded-lg hover:bg-toss-blue/10 transition-all"
                          >
                            <Users size={14} />
                            신청 명단
                          </button>
                          <button
                            onClick={() => openEditModal(lecture)}
                            className="p-2 text-toss-gray hover:text-toss-blue hover:bg-toss-blue/5 rounded-lg transition-all"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(lecture.id)}
                            className="p-2 text-toss-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applicant Modal */}
      {selectedLecture && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedLecture(null)}>
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 lg:px-8 py-4 lg:py-6 border-b border-toss-border flex justify-between items-center shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg lg:text-xl font-black text-toss-black">{selectedLecture.title}</h2>
                  <span className="text-xs font-black bg-toss-blue/10 text-toss-blue px-2 py-0.5 rounded-lg">
                    {selectedLecture.applicantIds.length}명 신청
                  </span>
                </div>
                <p className="text-xs lg:text-sm text-toss-gray font-medium mt-1">수강 신청한 참가자 명단입니다.</p>
              </div>
              <button onClick={() => setSelectedLecture(null)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors text-toss-gray">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 lg:p-8 overflow-y-auto flex-1">
              {applicants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {applicants.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-toss-lightGray/30 rounded-2xl border border-toss-border/40">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-toss-gray text-xs">
                          {p.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-toss-black">{p.name}</p>
                          <p className="text-[10px] text-toss-gray font-medium">{p.team}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-toss-gray">{p.phone.slice(-4)}</span>
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
              <button onClick={() => setSelectedLecture(null)} className="px-6 py-2.5 bg-toss-black text-white font-bold rounded-xl text-sm">닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => { setIsAdding(false); setEditingLecture(null); }}>
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 lg:px-8 py-4 lg:py-6 border-b border-toss-border flex justify-between items-center">
              <h2 className="text-lg lg:text-xl font-black text-toss-black">
                {editingLecture ? "강의 수정" : "새 강의 등록"}
              </h2>
              <button onClick={() => { setIsAdding(false); setEditingLecture(null); }} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors text-toss-gray">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 lg:p-8 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-toss-gray px-1 uppercase tracking-wider">강의 제목</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm"
                  placeholder="예: 기독교 세계관 기초"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-toss-gray px-1 uppercase tracking-wider">강사명</label>
                  <input
                    type="text"
                    value={form.lecturer}
                    onChange={(e) => setForm((f) => ({ ...f, lecturer: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-toss-gray px-1 uppercase tracking-wider">연결 존</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="예: ZONE B"
                    className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-toss-gray px-1 uppercase tracking-wider">유형</label>
                <div className="flex gap-2 flex-wrap">
                  {LECTURE_TYPE_OPTIONS.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, lectureType: f.lectureType === type ? "" : type }))}
                      className={clsx(
                        "px-3 py-2 rounded-xl text-xs font-black border transition-all",
                        form.lectureType === type
                          ? LECTURE_TYPE_STYLE[type] + " border-transparent"
                          : "bg-white border-toss-border text-toss-gray"
                      )}
                    >
                      #{type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-toss-gray px-1 uppercase tracking-wider">정원</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm((f) => ({ ...f, capacity: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-toss-gray px-1 uppercase tracking-wider">강의 설명</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm resize-none"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); setEditingLecture(null); }}
                  className="flex-1 py-4 rounded-2xl font-bold text-toss-gray bg-toss-lightGray hover:bg-toss-border transition-all"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="flex-[2] py-4 rounded-2xl font-bold text-white bg-toss-blue hover:bg-toss-blue/90 transition-all shadow-lg shadow-toss-blue/20 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSaving && <Loader2 className="animate-spin" size={18} />}
                  {editingLecture ? "수정하기" : "등록하기"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
