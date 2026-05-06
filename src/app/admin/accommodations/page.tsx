"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  ChevronRight,
  Trash2,
  X,
  Home,
  Loader2,
  Search,
} from "lucide-react";
import {
  getParticipants,
  updateParticipant,
} from "@/lib/services/participantService";
import { getRooms, addRoom } from "@/lib/services/roomService";
import { Participant } from "@/types/database";

interface RoomInfo {
  id: string;
  members: Participant[];
}

export default function AdminAccommodationsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [roomNames, setRoomNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [newRoomName, setNewRoomName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [data, firestoreRooms] = await Promise.all([
        getParticipants(),
        getRooms(),
      ]);
      setParticipants(data);
      const names = Array.from(
        new Set([
          ...firestoreRooms.map(r => r.name),
          ...data.filter(p => !!p.room).map(p => p.room as string),
        ])
      ).sort((a, b) => a.localeCompare(b));
      setRoomNames(names);

      if (selectedRoom) {
        const updatedMembers = data.filter(p => p.room === selectedRoom.id);
        setSelectedRoom({ id: selectedRoom.id, members: updatedMembers });
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromRoom = async (participantId: string) => {
    if (!confirm("이 참가자를 숙소에서 제외하시겠습니까?")) return;
    try {
      await updateParticipant(participantId, { room: undefined });
      await fetchData();
    } catch (error) {
      console.error("Failed to remove from room:", error);
      alert("숙소 제외에 실패했습니다.");
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    try {
      setIsSubmitting(true);
      await addRoom(newRoomName.trim());
      setNewRoomName("");
      setIsAddingRoom(false);
      await fetchData();
    } catch (error) {
      console.error("Failed to add room:", error);
      alert("숙소 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const rooms: RoomInfo[] = roomNames.map(id => ({
    id,
    members: participants.filter(p => p.room === id).sort((a, b) => a.name.localeCompare(b.name)),
  }));

  const unassignedParticipants = participants.filter(p => !p.room);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-toss-black">숙소 관리</h1>
          <p className="text-xs lg:text-sm text-toss-gray mt-1">참가자들의 숙소 배정을 관리합니다.</p>
        </div>
        <button
          onClick={() => setIsAddingRoom(true)}
          className="whitespace-nowrap bg-toss-blue text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-toss-blue/90 transition-all shadow-sm shadow-toss-blue/20 text-sm"
        >
          <Plus size={20} />
          새 숙소 등록
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-toss-border shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-toss-lightGray/50 text-toss-gray text-[10px] lg:text-[11px] font-black uppercase tracking-wider">
                <th className="px-6 py-4">숙소 명칭</th>
                <th className="px-6 py-4">배정 인원</th>
                <th className="px-6 py-4">미리보기</th>
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
              ) : rooms.map((room) => (
                <tr
                  key={room.id}
                  className="hover:bg-toss-lightGray/20 transition-colors group cursor-pointer"
                  onClick={() => setSelectedRoom(room)}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600">
                        <Home size={20} />
                      </div>
                      <span className="text-sm font-bold text-toss-black">{room.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium text-toss-gray">
                      현재 <span className="font-bold text-toss-black">{room.members.length}</span>명 입실
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex -space-x-2 overflow-hidden">
                      {room.members.slice(0, 5).map((member, i) => (
                        <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-toss-lightGray flex items-center justify-center text-[10px] font-bold text-toss-gray">
                          {member.name[0]}
                        </div>
                      ))}
                      {room.members.length > 5 && (
                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-toss-lightGray flex items-center justify-center text-[10px] font-bold text-toss-gray">
                          +{room.members.length - 5}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end items-center gap-1 text-green-600 font-bold text-sm">
                      관리하기
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rooms.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-toss-gray font-medium">
                    등록된 숙소가 없습니다. 새 숙소 등록 버튼을 눌러 숙소를 만들어 주세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Room Detail Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedRoom(null)}>
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 lg:px-8 py-4 lg:py-6 border-b border-toss-border flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-lg lg:text-xl font-black text-toss-black">{selectedRoom.id} 숙소 관리</h2>
                <p className="text-xs lg:text-sm text-toss-gray mt-1">해당 숙소에 배정된 인원을 관리합니다.</p>
              </div>
              <button onClick={() => setSelectedRoom(null)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors text-toss-gray">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 lg:p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedRoom.members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 lg:p-4 bg-white border border-toss-border rounded-2xl group/item">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-toss-lightGray flex items-center justify-center font-bold text-toss-gray text-xs">
                        {member.name[0]}
                      </div>
                      <p className="text-sm font-bold text-toss-black">{member.name}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveFromRoom(member.id)}
                      className="p-2 text-toss-gray hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {selectedRoom.members.length === 0 && (
                  <p className="col-span-full text-center py-8 text-toss-gray text-sm font-medium">배정된 인원이 없습니다.</p>
                )}
              </div>
              <button
                onClick={() => setIsAddingMember(true)}
                className="w-full py-3 lg:py-4 rounded-2xl border-2 border-dashed border-toss-border text-toss-gray font-bold text-sm hover:bg-toss-lightGray transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                인원 추가하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddingMember && selectedRoom && (() => {
        const filtered = unassignedParticipants.filter(p =>
          p.name.includes(memberSearch.trim())
        );
        const closeMemberModal = () => { setIsAddingMember(false); setMemberSearch(""); };
        return (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={closeMemberModal}>
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-toss-border flex justify-between items-center shrink-0">
                <h2 className="text-lg font-black text-toss-black">{selectedRoom.id} 인원 추가</h2>
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
                      await updateParticipant(p.id, { room: selectedRoom.id });
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

      {/* Room Add Modal */}
      {isAddingRoom && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsAddingRoom(false)}>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 lg:px-8 py-4 lg:py-6 border-b border-toss-border flex justify-between items-center">
              <h2 className="text-lg lg:text-xl font-black text-toss-black">새 숙소 등록</h2>
              <button onClick={() => setIsAddingRoom(false)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors text-toss-gray">
                <X size={24} />
              </button>
            </div>
            <form className="p-6 lg:p-8 space-y-4 lg:space-y-5" onSubmit={handleAddRoom}>
              <div className="space-y-1.5">
                <label className="text-[10px] lg:text-xs font-black text-toss-gray px-1 italic uppercase tracking-wider">숙소 명칭 / 호수</label>
                <input
                  type="text"
                  placeholder="예: 102호 또는 비전홀"
                  className="w-full px-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm lg:text-base"
                  value={newRoomName}
                  onChange={e => setNewRoomName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddingRoom(false)} className="flex-1 py-3 lg:py-4 rounded-2xl font-bold text-toss-gray bg-toss-lightGray hover:bg-toss-border transition-all text-sm lg:text-base">취소</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-3 lg:py-4 rounded-2xl font-bold text-white bg-toss-blue hover:bg-toss-blue/90 transition-all shadow-lg shadow-toss-blue/20 text-sm lg:text-base disabled:opacity-60">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : "등록하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
