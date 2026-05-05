"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Download,
  X,
  Loader2
} from "lucide-react";
import { 
  getParticipants, 
  addParticipant, 
  deleteParticipant,
  updateParticipant 
} from "@/lib/services/participantService";
import { Participant, TeamType, AttendanceType } from "@/types/database";

export default function AdminUsersPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    birthYear: "",
    team: "1팀" as TeamType,
    phone: "",
    attendanceType: "A형" as AttendanceType,
    group: "" as string | number,
    room: ""
  });

  useEffect(() => {
    fetchParticipants();
  }, []);

  useEffect(() => {
    if (editingParticipant) {
      setFormData({
        name: editingParticipant.name,
        birthYear: editingParticipant.birthYear || "",
        team: editingParticipant.team,
        phone: editingParticipant.phone,
        attendanceType: editingParticipant.attendanceType,
        group: editingParticipant.group || "",
        room: editingParticipant.room || ""
      });
    } else {
      setFormData({
        name: "",
        birthYear: "",
        team: "1팀",
        phone: "",
        attendanceType: "A형",
        group: "",
        room: ""
      });
    }
  }, [editingParticipant]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const data = await getParticipants();
      setParticipants(data);
    } catch (error) {
      console.error("Failed to fetch participants:", error);
      alert("참가자 명단을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("이름과 전화번호는 필수입니다.");
      return;
    }

    try {
      setIsSubmitting(true);
      const submissionData = {
        ...formData,
        group: formData.group ? Number(formData.group) : undefined,
        room: formData.room || undefined
      };

      if (editingParticipant) {
        await updateParticipant(editingParticipant.id, submissionData);
      } else {
        await addParticipant({
          ...submissionData,
          isLeader: false,
        });
      }
      await fetchParticipants();
      setIsAdding(false);
      setEditingParticipant(null);
    } catch (error) {
      console.error("Failed to save participant:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${name} 참가자를 삭제하시겠습니까?`)) return;

    try {
      await deleteParticipant(id);
      setParticipants(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Failed to delete participant:", error);
      alert("참가자 삭제에 실패했습니다.");
    }
  };

  const teams: TeamType[] = ["초신자팀", "기신자팀", "1팀", "2팀", "3팀", "4팀", "5팀", "6팀", "웰컴팀", "임원단", "사역자"];
  const attendanceTypes: AttendanceType[] = ["A형", "B-1형", "B-2형", "C형", "D형"];

  // Filtering logic
  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.name.includes(searchTerm) || p.phone.includes(searchTerm);
    const matchesTeam = teamFilter ? p.team === teamFilter : true;
    const matchesAttendance = attendanceFilter ? p.attendanceType === attendanceFilter : true;
    return matchesSearch && matchesTeam && matchesAttendance;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-toss-black">참가자 관리</h1>
          <p className="text-xs lg:text-sm text-toss-gray mt-1">참가자 명단을 확인하고 기본 정보를 관리합니다.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <button 
            onClick={() => alert("엑셀 내보내기 기능은 준비 중입니다.")}
            className="whitespace-nowrap bg-white text-toss-black border border-toss-border px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-toss-lightGray transition-all shadow-sm text-sm"
          >
            <Download size={16} className="lg:size-[18px]" />
            <span className="hidden sm:inline">엑셀 내보내기</span>
            <span className="sm:hidden">내보내기</span>
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="whitespace-nowrap bg-toss-blue text-white px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-toss-blue/90 transition-all shadow-sm shadow-toss-blue/20 text-sm"
          >
            <UserPlus size={18} className="lg:size-[20px]" />
            참가자 추가
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <select 
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-toss-border rounded-xl text-sm font-bold outline-none focus:border-toss-blue whitespace-nowrap"
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
          >
            <option value="">팀 전체</option>
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select 
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-toss-border rounded-xl text-sm font-bold outline-none focus:border-toss-blue whitespace-nowrap"
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value)}
          >
            <option value="">참석구분 전체</option>
            {attendanceTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-toss-gray" />
          <input 
            type="text" 
            placeholder="이름 또는 전화번호 검색..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-toss-border rounded-xl text-sm font-medium outline-none focus:border-toss-blue transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-toss-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-toss-lightGray/50 text-toss-gray text-[10px] lg:text-[11px] font-black uppercase tracking-wider">
                <th className="px-4 lg:px-6 py-4">이름 / 팀 / 또래</th>
                <th className="px-4 lg:px-6 py-4">연락처</th>
                <th className="px-4 lg:px-6 py-4">참석구분</th>
                <th className="px-4 lg:px-6 py-4">조 / 역할</th>
                <th className="px-4 lg:px-6 py-4">숙소</th>
                <th className="px-4 lg:px-6 py-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-toss-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-toss-blue" size={32} />
                      <p className="text-sm font-bold text-toss-gray">참가자 정보를 불러오는 중...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-20 text-center">
                    <p className="text-sm font-bold text-toss-gray">등록된 참가자가 없습니다.</p>
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((user) => (
                  <tr key={user.id} className="hover:bg-toss-lightGray/20 transition-colors group">
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-toss-lightGray flex items-center justify-center font-bold text-toss-gray text-[10px] lg:text-xs">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-toss-black">{user.name}</p>
                          <p className="text-[10px] lg:text-[11px] font-medium text-toss-gray">
                            {user.team} {user.birthYear && `· ${user.birthYear}또래`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-xs font-bold text-toss-gray whitespace-nowrap">{user.phone}</td>
                    <td className="px-4 lg:px-6 py-4 text-xs font-bold text-toss-gray">{user.attendanceType}</td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-toss-black">{user.group ? `${user.group}조` : "미배정"}</span>
                        {user.isLeader && <span className="text-[9px] lg:text-[10px] font-black bg-toss-blue text-white px-2 py-1 rounded-lg italic">LEADER</span>}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-xs font-bold text-toss-gray">{user.room || "미배정"}</td>
                    <td className="px-4 lg:px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingParticipant(user)}
                          className="p-2 text-toss-gray hover:text-toss-blue hover:bg-toss-blue/5 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-2 text-toss-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Participant Add/Edit Modal */}
      {(isAdding || editingParticipant) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => { setIsAdding(false); setEditingParticipant(null); }}>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 lg:px-8 py-4 lg:py-6 border-b border-toss-border flex justify-between items-center">
              <h2 className="text-lg lg:text-xl font-black text-toss-black">
                {editingParticipant ? "참가자 정보 수정" : "참가자 등록"}
              </h2>
              <button onClick={() => { setIsAdding(false); setEditingParticipant(null); }} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors text-toss-gray">
                <X size={24} />
              </button>
            </div>
            <form className="p-6 lg:p-8 space-y-4 lg:space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] lg:text-xs font-black text-toss-gray px-1 italic uppercase tracking-wider">이름</label>
                  <input 
                    type="text" 
                    placeholder="실명" 
                    className="w-full px-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm lg:text-base" 
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] lg:text-xs font-black text-toss-gray px-1 italic uppercase tracking-wider">또래 (숫자만)</label>
                  <input 
                    type="text" 
                    maxLength={2} 
                    placeholder="예: 01" 
                    className="w-full px-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm lg:text-base" 
                    value={formData.birthYear}
                    onChange={e => setFormData(prev => ({ ...prev, birthYear: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] lg:text-xs font-black text-toss-gray px-1 italic uppercase tracking-wider">팀 선택</label>
                <select 
                  className="w-full px-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none appearance-none bg-white font-bold text-sm lg:text-base"
                  value={formData.team}
                  onChange={e => setFormData(prev => ({ ...prev, team: e.target.value as TeamType }))}
                >
                  {teams.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] lg:text-xs font-black text-toss-gray px-1 italic uppercase tracking-wider">전화번호</label>
                <input 
                  type="tel" 
                  placeholder="010-0000-0000" 
                  className="w-full px-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm lg:text-base" 
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] lg:text-xs font-black text-toss-gray px-1 italic uppercase tracking-wider">참석 구분</label>
                <select 
                  className="w-full px-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none appearance-none bg-white font-bold text-sm lg:text-base"
                  value={formData.attendanceType}
                  onChange={e => setFormData(prev => ({ ...prev, attendanceType: e.target.value as AttendanceType }))}
                >
                  {attendanceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] lg:text-xs font-black text-toss-gray px-1 italic uppercase tracking-wider">조 (숫자)</label>
                  <input 
                    type="number" 
                    placeholder="미배정" 
                    className="w-full px-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm lg:text-base" 
                    value={formData.group}
                    onChange={e => setFormData(prev => ({ ...prev, group: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] lg:text-xs font-black text-toss-gray px-1 italic uppercase tracking-wider">숙소</label>
                  <input 
                    type="text" 
                    placeholder="미배정" 
                    className="w-full px-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm lg:text-base" 
                    value={formData.room}
                    onChange={e => setFormData(prev => ({ ...prev, room: e.target.value }))}
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 lg:py-4 rounded-2xl font-bold text-toss-gray bg-toss-lightGray hover:bg-toss-border transition-all text-sm lg:text-base" disabled={isSubmitting}>
                  취소
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-3 lg:py-4 rounded-2xl font-bold text-white bg-toss-blue hover:bg-toss-blue/90 transition-all shadow-lg shadow-toss-blue/20 text-sm lg:text-base flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={20} />}
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
