"use client";

import { useState } from "react";
import { ChevronLeft, User, Phone, Home, Users, UserCheck } from "lucide-react";
import Link from "next/link";

type Participant = {
  id: number;
  name: string;
  role: "조장" | "조원";
  team: string;
  phone: string;
  room: string;
};

export default function MyGroupPage() {
  const groupNumber = 21;
  
  // Mock data for group members
  const [members] = useState<Participant[]>([
    { id: 1, name: "홍길동", role: "조장", team: "1팀", phone: "010-1234-5678", room: "101호" },
    { id: 2, name: "김철수", role: "조원", team: "2팀", phone: "010-2345-6789", room: "101호" },
    { id: 3, name: "이영희", role: "조원", team: "기신자팀", phone: "010-3456-7890", room: "205호" },
    { id: 4, name: "박민준", role: "조원", team: "3팀", phone: "010-4567-8901", room: "302호" },
    { id: 5, name: "최서연", role: "조원", team: "웰컴팀", phone: "010-5678-9012", room: "410호" },
    { id: 6, name: "강하늘", role: "조원", team: "1팀", phone: "010-6789-0123", room: "101호" },
  ]);

  const leader = members.find(m => m.role === "조장");
  const regularMembers = members.filter(m => m.role === "조원");

  return (
    <div className="min-h-screen bg-toss-lightGray pb-20">
      <header className="bg-white sticky top-0 z-50 border-b border-toss-border h-12 flex items-center px-4">
        <Link href="/" className="p-2 -ml-2"><ChevronLeft size={20} /></Link>
        <h1 className="flex-1 text-center font-bold text-[15px] mr-8">내 조 확인</h1>
      </header>
      
      <main className="p-4 space-y-4 max-w-[420px] mx-auto">
        {/* 1. 조 타이틀 */}
        <div className="flex flex-col items-center py-4">
          <h2 className="text-3xl font-black text-toss-black">{groupNumber}조</h2>
          <p className="text-sm text-toss-gray mt-1 font-bold">총 {members.length}명의 조원이 함께합니다.</p>
        </div>

        {/* 2. 조장 섹션 */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 px-1">
            <UserCheck size={14} className="text-toss-blue" />
            <h3 className="text-xs font-bold text-toss-gray uppercase tracking-wider">우리 조장님</h3>
          </div>
          {leader && <MemberCard member={leader} isLeader />}
        </div>

        {/* 3. 조원 섹션 */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 px-1">
            <Users size={14} className="text-toss-gray" />
            <h3 className="text-xs font-bold text-toss-gray uppercase tracking-wider">조원 명단</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {regularMembers.map(member => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>

        {/* 4. 조별 안내 메시지 */}
        <div className="bg-white/60 p-5 rounded-3xl border border-toss-border/40 text-center mt-4">
          <p className="text-[11px] text-toss-gray leading-relaxed font-medium">
            조원들과 소통하며 은혜로운 시간 보내세요! <br />
            수련회 기간 중 문의사항은 조장님께 먼저 말씀해주세요.
          </p>
        </div>
      </main>
    </div>
  );
}

function MemberCard({ member, isLeader = false }: { member: Participant, isLeader?: boolean }) {
  return (
    <div className={`bg-white p-4 rounded-toss shadow-sm border transition-all ${isLeader ? 'border-toss-blue/20 ring-1 ring-toss-blue/5' : 'border-toss-border/40'}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isLeader ? 'bg-toss-blue text-white' : 'bg-toss-lightGray text-toss-gray'}`}>
            {member.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-toss-black">{member.name}</span>
              {isLeader && <span className="text-[9px] font-bold bg-toss-blue text-white px-1.5 py-0.5 rounded italic">LEADER</span>}
            </div>
            <p className="text-[11px] text-toss-gray font-medium mt-0.5">{member.team}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-toss-blue bg-toss-blue/5 px-2 py-0.5 rounded-lg">
            <Home size={10} />
            {member.room}
          </div>
          <span className="text-[11px] font-mono font-medium text-toss-gray/60">{member.phone}</span>
        </div>
      </div>
    </div>
  );
}
