"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  ChevronRight,
  UserCheck,
  Trash2,
  X,
  Loader2,
  Search,
  Download,
} from "lucide-react";
import {
  getParticipants,
  updateParticipant,
} from "@/lib/services/participantService";
import { getGroups, addGroup } from "@/lib/services/groupService";
import { Participant } from "@/types/database";
import { exportToExcel } from "@/lib/utils/excel";

interface GroupInfo {
  id: number;
  members: Participant[];
}

export default function AdminGroupsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [groupNumbers, setGroupNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupInfo | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [newGroupNumber, setNewGroupNumber] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [data, firestoreGroups] = await Promise.all([
        getParticipants(),
        getGroups(),
      ]);
      setParticipants(data);
      const nums = Array.from(
        new Set([
          ...firestoreGroups.map(g => g.groupNumber),
          ...data.filter(p => p.group != null).map(p => p.group as number),
        ])
      ).sort((a, b) => a - b);
      setGroupNumbers(nums);

      if (selectedGroup) {
        const updatedMembers = data.filter(p => p.group === selectedGroup.id);
        setSelectedGroup({ id: selectedGroup.id, members: updatedMembers });
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetLeader = async (participantId: string, groupId: number) => {
    try {
      const currentLeader = participants.find(p => p.group === groupId && p.isLeader);
      if (currentLeader) {
        await updateParticipant(currentLeader.id, { isLeader: false });
      }
      await updateParticipant(participantId, { isLeader: true });
      await fetchData();
    } catch (error) {
      console.error("Failed to set leader:", error);
      alert("조장 지정에 실패했습니다.");
    }
  };

  const handleRemoveFromGroup = async (participantId: string) => {
    if (!confirm("이 참가자를 조에서 제외하시겠습니까?")) return;
    try {
      await updateParticipant(participantId, { group: undefined, isLeader: false });
      await fetchData();
    } catch (error) {
      console.error("Failed to remove from group:", error);
      alert("조원 제외에 실패했습니다.");
    }
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const gNum = parseInt(newGroupNumber);
    if (isNaN(gNum)) return;
    try {
      setIsSubmitting(true);
      await addGroup(gNum);
      setNewGroupNumber("");
      setIsAddingGroup(false);
      await fetchData();
    } catch (error) {
      console.error("Failed to add group:", error);
      alert("조 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const groups: GroupInfo[] = groupNumbers.map(id => ({
    id,
    members: participants.filter(p => p.group === id).sort((a, b) => a.name.localeCompare(b.name)),
  }));

  const unassignedParticipants = participants.filter(p => p.group == null);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-toss-black">조 관리</h1>
          <p className="text-xs lg:text-sm text-toss-gray mt-1">참가자들의 조 편성을 관리하고 조장을 지정합니다.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const rows = groups.flatMap(g =>
                g.members.map(m => ({
                  조: g.id,
                  이름: m.name,
                  팀: m.team,
                  역할: m.isLeader ? "조장" : "조원",
                  또래: m.birthYear || "",
                  전화번호: m.phone,
                }))
              );
              exportToExcel(rows, "조_편성_명단");
            }}
            className="whitespace-nowrap bg-white text-toss-black border border-toss-border px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-toss-lightGray transition-all shadow-sm text-sm"
          >
            <Download size={16} />
            엑셀 내보내기
          </button>
          <button
            onClick={() => setIsAddingGroup(true)}
            className="whitespace-nowrap bg-toss-blue text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-toss-blue/90 transition-all shadow-sm shadow-toss-blue/20 text-sm"
          >
            <Plus size={20} />
            새 조 생성
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-toss-border shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-toss-lightGray/50 text-toss-gray text-[10px] lg:text-[11px] font-black uppercase tracking-wider">
                <th className="px-6 py-4 w-24 text-center">조</th>
                <th className="px-6 py-4">조장</th>
                <th className="px-6 py-4">조원 수</th>
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
              ) : groups.map((group) => {
                const leader = group.members.find(m => m.isLeader);
                return (
                  <tr
                    key={group.id}
                    className="hover:bg-toss-lightGray/20 transition-colors group cursor-pointer"
                    onClick={() => setSelectedGroup(group)}
                  >
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-toss-blue/10 text-toss-blue font-black text-base">
                        {group.id}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <UserCheck size={16} className={leader ? "text-toss-blue" : "text-toss-gray/30"} />
                        <span className={`text-sm font-bold ${leader ? "text-toss-black" : "text-toss-gray italic"}`}>
                          {leader?.name || "미지정"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-medium text-toss-gray">
                        총 <span className="font-bold text-toss-black">{group.members.length}</span>명
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end items-center gap-1 text-toss-blue font-bold text-sm">
                        관리하기
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && groups.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-toss-gray font-medium">
                    생성된 조가 없습니다. 새 조 생성 버튼을 눌러 조를 만들어 주세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Group Detail Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedGroup(null)}>
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 lg:px-8 py-4 lg:py-6 border-b border-toss-border flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-lg lg:text-xl font-black text-toss-black">{selectedGroup.id}조 조원 관리</h2>
                <p className="text-xs lg:text-sm text-toss-gray mt-1">조장을 지정하고 조원을 관리할 수 있습니다.</p>
              </div>
              <button onClick={() => setSelectedGroup(null)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors text-toss-gray">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 lg:p-8 space-y-6 overflow-y-auto">
              <div className="space-y-3">
                {selectedGroup.members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 lg:p-4 bg-toss-lightGray/30 rounded-2xl border border-toss-border/40 group/item">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white flex items-center justify-center font-bold text-toss-gray text-xs lg:text-sm">
                        {member.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-toss-black">{member.name}</p>
                        <p className="text-[10px] lg:text-[11px] text-toss-gray font-medium">{member.team}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3">
                      {member.isLeader ? (
                        <span className="text-[9px] lg:text-[10px] font-black bg-toss-blue text-white px-2 py-1 rounded-lg">조장</span>
                      ) : (
                        <button
                          onClick={() => handleSetLeader(member.id, selectedGroup.id)}
                          className="text-[9px] lg:text-[10px] font-bold text-toss-gray hover:text-toss-blue sm:opacity-0 group-hover/item:opacity-100 transition-all"
                        >
                          조장지정
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveFromGroup(member.id)}
                        className="p-1.5 lg:p-2 text-toss-gray hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {selectedGroup.members.length === 0 && (
                  <p className="text-center py-8 text-toss-gray text-sm font-medium">조원이 없습니다.</p>
                )}
              </div>

              <button
                onClick={() => setIsAddingMember(true)}
                className="w-full py-3 lg:py-4 rounded-2xl border-2 border-dashed border-toss-border text-toss-gray font-bold text-sm hover:bg-toss-lightGray transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                조원 추가하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddingMember && selectedGroup && (() => {
        const filtered = unassignedParticipants.filter(p =>
          p.name.includes(memberSearch.trim())
        );
        const closeMemberModal = () => { setIsAddingMember(false); setMemberSearch(""); };
        return (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={closeMemberModal}>
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-toss-border flex justify-between items-center shrink-0">
                <h2 className="text-lg font-black text-toss-black">{selectedGroup.id}조 조원 추가</h2>
                <button onClick={closeMemberModal} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors text-toss-gray">
                  <X size={24} />
                </button>
              </div>
              <div className="px-4 pt-4 shrink-0">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-toss-gray/50" />
                  <input
                    type="text"
                    placeholder="이름 검색"
                    value={memberSearch}
                    onChange={e => setMemberSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all text-sm font-medium"
                    autoFocus
                  />
                </div>
              </div>
              <div className="p-4 overflow-y-auto space-y-2">
                <p className="text-xs font-bold text-toss-gray px-2 mb-2">미배정 참가자 목록</p>
                {unassignedParticipants.length === 0 && (
                  <p className="text-center py-8 text-toss-gray text-sm">미배정 참가자가 없습니다.</p>
                )}
                {unassignedParticipants.length > 0 && filtered.length === 0 && (
                  <p className="text-center py-8 text-toss-gray text-sm">검색 결과가 없습니다.</p>
                )}
                {filtered.map(p => (
                  <button
                    key={p.id}
                    onClick={async () => {
                      await updateParticipant(p.id, { group: selectedGroup.id });
                      await fetchData();
                      closeMemberModal();
                    }}
                    className="w-full flex items-center justify-between p-3 hover:bg-toss-lightGray/50 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-toss-lightGray flex items-center justify-center text-xs font-bold">{p.name[0]}</div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-toss-black">{p.name}</p>
                        <p className="text-[10px] text-toss-gray">{p.team}</p>
                      </div>
                    </div>
                    <Plus size={16} className="text-toss-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Group Add Modal */}
      {isAddingGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsAddingGroup(false)}>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 lg:px-8 py-4 lg:py-6 border-b border-toss-border flex justify-between items-center">
              <h2 className="text-lg lg:text-xl font-black text-toss-black">새 조 생성</h2>
              <button onClick={() => setIsAddingGroup(false)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors text-toss-gray">
                <X size={24} />
              </button>
            </div>
            <form className="p-6 lg:p-8 space-y-4 lg:space-y-5" onSubmit={handleAddGroup}>
              <div className="space-y-1.5">
                <label className="text-[10px] lg:text-xs font-black text-toss-gray px-1 italic uppercase tracking-wider">조 번호</label>
                <input
                  type="number"
                  placeholder="예: 22"
                  className="w-full px-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm lg:text-base"
                  value={newGroupNumber}
                  onChange={e => setNewGroupNumber(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddingGroup(false)} className="flex-1 py-3 lg:py-4 rounded-2xl font-bold text-toss-gray bg-toss-lightGray hover:bg-toss-border transition-all text-sm lg:text-base">취소</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-3 lg:py-4 rounded-2xl font-bold text-white bg-toss-blue hover:bg-toss-blue/90 transition-all shadow-lg shadow-toss-blue/20 text-sm lg:text-base disabled:opacity-60">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : "생성하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
