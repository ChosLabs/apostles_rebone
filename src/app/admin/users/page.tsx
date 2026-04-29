"use client";

import React, { useState } from "react";
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Home, 
  Users, 
  Phone,
  Download,
  X,
  Plus,
  ChevronRight,
  UserCheck,
  DoorOpen,
  LayoutGrid
} from "lucide-react";

type TeamType = "초신자팀" | "기신자팀" | "1팀" | "2팀" | "3팀" | "4팀" | "5팀" | "6팀" | "웰컴팀" | "임원단";

interface Participant {
  id: number;
  name: string;
  team: TeamType;
  phone: string;
  group?: number;
  isLeader: boolean;
  room?: string;
}

interface GroupInfo {
  id: number;
  members: Participant[];
}

interface RoomInfo {
  id: string;
  members: Participant[];
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"all" | "groups" | "rooms">("all");
  const [selectedGroup, setSelectedGroup] = useState<GroupInfo | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null);

  // ... (mock data and logic remain the same)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-toss-black">참가자 관리</h1>
          <p className="text-xs lg:text-sm text-toss-gray mt-1">참가자 명단 확인, 조 및 숙소 편성을 관리합니다.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {selectedTab === "all" && (
            <>
              <button className="whitespace-nowrap bg-white text-toss-black border border-toss-border px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-toss-lightGray transition-all shadow-sm text-sm">
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
            </>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex p-1 bg-toss-lightGray rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar">
        {[
          { id: "all", label: "전체 명단", icon: <LayoutGrid size={16} /> },
          { id: "groups", label: "조 편성", icon: <Users size={16} /> },
          { id: "rooms", label: "숙소 편성", icon: <DoorOpen size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex-1 sm:flex-none px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-bold text-xs lg:text-sm flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
              selectedTab === tab.id 
                ? "bg-white text-toss-blue shadow-sm" 
                : "text-toss-gray hover:text-toss-black"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conditional Rendering based on Tab */}
      {selectedTab === "all" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex gap-2 w-full sm:w-auto">
              <select className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-toss-border rounded-xl text-sm font-bold outline-none focus:border-toss-blue">
                <option value="">팀 전체</option>
                {teams.map(t => <option key={t} value={t}>{t}</option>)}
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
                    <th className="px-4 lg:px-6 py-4">이름 / 팀</th>
                    <th className="px-4 lg:px-6 py-4">연락처</th>
                    <th className="px-4 lg:px-6 py-4">조 / 역할</th>
                    <th className="px-4 lg:px-6 py-4">숙소</th>
                    <th className="px-4 lg:px-6 py-4 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-toss-border">
                  {sortedParticipants.map((user) => (
                    <tr key={user.id} className="hover:bg-toss-lightGray/20 transition-colors group">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-toss-lightGray flex items-center justify-center font-bold text-toss-gray text-[10px] lg:text-xs">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-toss-black">{user.name}</p>
                            <p className="text-[10px] lg:text-[11px] font-medium text-toss-gray">{user.team}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-xs font-bold text-toss-gray whitespace-nowrap">{user.phone}</td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-toss-black">{user.group}조</span>
                          {user.isLeader && <span className="text-[9px] lg:text-[10px] font-black bg-toss-blue text-white px-2 py-1 rounded-lg italic">LEADER</span>}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-xs font-bold text-toss-gray">{user.room}</td>
                      <td className="px-4 lg:px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-toss-gray hover:text-toss-blue hover:bg-toss-blue/5 rounded-lg transition-all"><Edit2 size={16} /></button>
                          <button className="p-2 text-toss-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedTab === "groups" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {groups.map(group => (
            <div 
              key={group.id} 
              onClick={() => setSelectedGroup(group)}
              className="bg-white p-5 lg:p-6 rounded-3xl border border-toss-border shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-toss-blue/10 flex items-center justify-center text-toss-blue font-black text-lg lg:text-xl">
                  {group.id}
                </div>
                <button className="p-2 text-toss-gray hover:bg-toss-lightGray rounded-xl transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
              <h3 className="text-base lg:text-lg font-black text-toss-black mb-1">{group.id}조</h3>
              <p className="text-xs lg:text-sm text-toss-gray font-medium mb-4">총 {group.members.length}명의 조원</p>
              
              <div className="space-y-2">
                <p className="text-[10px] lg:text-[11px] font-black text-toss-gray uppercase tracking-widest">조장</p>
                <div className="flex items-center gap-2 text-sm font-bold text-toss-blue">
                  <UserCheck size={16} />
                  {group.members.find(m => m.isLeader)?.name || "미지정"}
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center text-toss-blue font-bold text-sm">
                조원 관리하기
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
          <button 
            onClick={() => setIsAddingGroup(true)}
            className="border-2 border-dashed border-toss-border rounded-3xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-white hover:border-toss-blue/30 transition-all text-toss-gray hover:text-toss-blue"
          >
            <Plus size={32} strokeWidth={1.5} />
            <span className="font-bold text-sm">새 조 생성하기</span>
          </button>
        </div>
      )}

      {selectedTab === "rooms" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {rooms.map(room => (
            <div 
              key={room.id} 
              onClick={() => setSelectedRoom(room)}
              className="bg-white p-5 lg:p-6 rounded-3xl border border-toss-border shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 font-black text-base lg:text-lg italic">
                  <Home size={20} lg:size={22} />
                </div>
                <button className="p-2 text-toss-gray hover:bg-toss-lightGray rounded-xl transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
              <h3 className="text-base lg:text-lg font-black text-toss-black mb-1">{room.id}</h3>
              <p className="text-xs lg:text-sm text-toss-gray font-medium mb-4">현재 {room.members.length}명 입실 중</p>
              
              <div className="flex -space-x-2 overflow-hidden mb-4">
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

              <div className="mt-2 flex justify-between items-center text-green-600 font-bold text-sm">
                숙소 관리하기
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
          <button 
            onClick={() => setIsAddingRoom(true)}
            className="border-2 border-dashed border-toss-border rounded-3xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-white hover:border-toss-blue/30 transition-all text-toss-gray hover:text-toss-blue"
          >
            <Plus size={32} strokeWidth={1.5} />
            <span className="font-bold text-sm">새 숙소 등록하기</span>
          </button>
        </div>
      )}

      {/* Group Detail Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedGroup(null)}>
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 lg:px-8 py-4 lg:py-6 border-b border-toss-border flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-lg lg:text-xl font-black text-toss-black">{selectedGroup.id}조 조원 관리</h2>
                <p className="text-xs lg:text-sm text-toss-gray mt-1">조장을 지정하고 조원을 추가/삭제할 수 있습니다.</p>
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
                        <button className="text-[9px] lg:text-[10px] font-bold text-toss-gray hover:text-toss-blue sm:opacity-0 group-hover/item:opacity-100 transition-all">조장지정</button>
                      )}
                      <button className="p-1.5 lg:p-2 text-toss-gray hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full py-3 lg:py-4 rounded-2xl border-2 border-dashed border-toss-border text-toss-gray font-bold text-sm hover:bg-toss-lightGray transition-all flex items-center justify-center gap-2">
                <Plus size={18} />
                조원 추가하기
              </button>
            </div>
          </div>
        </div>
      )}

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
                    <button className="p-2 text-toss-gray hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full py-3 lg:py-4 rounded-2xl border-2 border-dashed border-toss-border text-toss-gray font-bold text-sm hover:bg-toss-lightGray transition-all flex items-center justify-center gap-2">
                <Plus size={18} />
                인원 추가하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Participant Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsAdding(false)}>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 lg:px-8 py-4 lg:py-6 border-b border-toss-border flex justify-between items-center">
              <h2 className="text-lg lg:text-xl font-black text-toss-black">참가자 등록</h2>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors text-toss-gray">
                <X size={24} />
              </button>
            </div>
            <form className="p-6 lg:p-8 space-y-4 lg:space-y-5">
              <div className="space-y-1.5"><label className="text-[10px] lg:text-xs font-black text-toss-gray px-1 italic uppercase tracking-wider">이름</label><input type="text" placeholder="실명을 입력하세요" className="w-full px-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm lg:text-base" /></div>
              <div className="space-y-1.5"><label className="text-[10px] lg:text-xs font-black text-toss-gray px-1 italic uppercase tracking-wider">팀 선택</label><select className="w-full px-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none appearance-none bg-white font-bold text-sm lg:text-base">{teams.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="space-y-1.5"><label className="text-[10px] lg:text-xs font-black text-toss-gray px-1 italic uppercase tracking-wider">전화번호</label><input type="tel" placeholder="010-0000-0000" className="w-full px-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm lg:text-base" /></div>
              <div className="pt-4 flex gap-3"><button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 lg:py-4 rounded-2xl font-bold text-toss-gray bg-toss-lightGray hover:bg-toss-border transition-all text-sm lg:text-base">취소</button><button type="submit" className="flex-[2] py-3 lg:py-4 rounded-2xl font-bold text-white bg-toss-blue hover:bg-toss-blue/90 transition-all shadow-lg shadow-toss-blue/20 text-sm lg:text-base">등록하기</button></div>
            </form>
          </div>
        </div>
      )}

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
            <form className="p-6 lg:p-8 space-y-4 lg:space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] lg:text-xs font-black text-toss-gray px-1 italic uppercase tracking-wider">조 번호</label>
                <input 
                  type="number" 
                  placeholder="예: 22"
                  className="w-full px-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm lg:text-base"
                />
              </div>
              <p className="text-[10px] lg:text-xs text-toss-gray px-1">조 생성 후 조원 관리 모달에서 조원을 추가할 수 있습니다.</p>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddingGroup(false)} className="flex-1 py-3 lg:py-4 rounded-2xl font-bold text-toss-gray bg-toss-lightGray hover:bg-toss-border transition-all text-sm lg:text-base">취소</button>
                <button type="submit" className="flex-[2] py-3 lg:py-4 rounded-2xl font-bold text-white bg-toss-blue hover:bg-toss-blue/90 transition-all shadow-lg shadow-toss-blue/20 text-sm lg:text-base">생성하기</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            <form className="p-6 lg:p-8 space-y-4 lg:space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] lg:text-xs font-black text-toss-gray px-1 italic uppercase tracking-wider">숙소 명칭 / 호수</label>
                <input 
                  type="text" 
                  placeholder="예: 102호 또는 비전홀"
                  className="w-full px-4 py-2.5 lg:py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm lg:text-base"
                />
              </div>
              <p className="text-[10px] lg:text-xs text-toss-gray px-1">숙소 등록 후 숙소 관리 모달에서 인원을 배정할 수 있습니다.</p>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddingRoom(false)} className="flex-1 py-3 lg:py-4 rounded-2xl font-bold text-toss-gray bg-toss-lightGray hover:bg-toss-border transition-all text-sm lg:text-base">취소</button>
                <button type="submit" className="flex-[2] py-3 lg:py-4 rounded-2xl font-bold text-white bg-toss-blue hover:bg-toss-blue/90 transition-all shadow-lg shadow-toss-blue/20 text-sm lg:text-base">등록하기</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
