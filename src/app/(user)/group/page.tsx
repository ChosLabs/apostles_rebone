"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Users, UserCheck, Edit3, X, Save, Quote, Loader2, EyeOff, Eye, Lock, LogIn } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { subscribeGroup, subscribeGroupMembers, updateGroupInfo } from "@/lib/services/groupService";
import { Group, Participant } from "@/types/database";

export default function MyGroupPage() {
  const { user, isGuest } = useAuth();
  const groupNumber = user?.group;

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempNickname, setTempNickname] = useState("");
  const [tempSlogan, setTempSlogan] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hidePhone, setHidePhone] = useState(false);

  useEffect(() => {
    setHidePhone(localStorage.getItem("rebone_hide_phone") === "1");
  }, []);

  const toggleHidePhone = () => {
    const next = !hidePhone;
    setHidePhone(next);
    localStorage.setItem("rebone_hide_phone", next ? "1" : "0");
  };

  useEffect(() => {
    if (!groupNumber) {
      setLoading(false);
      return;
    }

    const unsubGroup = subscribeGroup(groupNumber, (g) => {
      setGroup(g);
      setLoading(false);
    });

    const unsubMembers = subscribeGroupMembers(groupNumber, setMembers);

    return () => {
      unsubGroup();
      unsubMembers();
    };
  }, [groupNumber]);

  const openEditModal = () => {
    setTempNickname(group?.nickname || "");
    setTempSlogan(group?.slogan || "");
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!groupNumber) return;
    try {
      setIsSaving(true);
      await updateGroupInfo(groupNumber, { nickname: tempNickname, slogan: tempSlogan });
      setIsEditModalOpen(false);
    } catch (e) {
      console.error(e);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isGuest || !groupNumber) {
    return (
      <div className="min-h-screen bg-toss-lightGray dark:bg-background pb-20">
        <header className="sticky top-0 z-50 bg-white dark:bg-surface px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
          <Link href="/" className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
            <ArrowLeft size={24} className="text-toss-black" />
          </Link>
          <h1 className="text-lg font-bold text-toss-black flex-1">우리 조</h1>
        </header>
        <div className="flex flex-col items-center justify-center py-24 px-6 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-toss-lightGray flex items-center justify-center text-toss-gray/40">
            <Lock size={28} />
          </div>
          <p className="text-base font-bold text-toss-black">
            {isGuest ? "로그인 후 참가자 정보가 표시됩니다" : "배정된 조가 없습니다"}
          </p>
          <p className="text-sm text-toss-gray">
            {isGuest ? "내 조 정보와 조원 명단을 확인하려면 로그인이 필요합니다." : "관리자에게 문의해주세요."}
          </p>
          {isGuest && (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-bold text-white bg-toss-blue px-5 py-2.5 rounded-xl mt-1"
            >
              <LogIn size={15} />
              로그인하기
            </Link>
          )}
        </div>
      </div>
    );
  }

  const leader = members.find((m) => m.isLeader);
  const regularMembers = members.filter((m) => !m.isLeader);

  return (
    <div className="min-h-screen bg-toss-lightGray dark:bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white dark:bg-surface px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
        <Link href="/" className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
          <ArrowLeft size={24} className="text-toss-black" />
        </Link>
        <h1 className="text-lg font-bold text-toss-black flex-1">우리 조</h1>
        <button
          onClick={toggleHidePhone}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all active:scale-95 ${
            hidePhone
              ? "bg-toss-blue/10 text-toss-blue border-toss-blue/20"
              : "bg-toss-lightGray text-toss-gray border-toss-border/40"
          }`}
        >
          {hidePhone ? <EyeOff size={13} /> : <Eye size={13} />}
          내 번호 {hidePhone ? "숨김" : "표시"}
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="animate-spin text-toss-blue" size={32} />
        </div>
      ) : (
        <main className="p-4 space-y-4 max-w-[420px] mx-auto">
          {/* 조 헤더 카드 */}
          <div className="bg-white dark:bg-surface rounded-3xl p-6 shadow-sm border border-toss-border/40 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <button
                onClick={openEditModal}
                className="p-2 bg-toss-lightGray/50 text-toss-gray hover:text-toss-blue hover:bg-toss-blue/5 rounded-full transition-all"
              >
                <Edit3 size={16} />
              </button>
            </div>

            <div className="w-16 h-16 bg-toss-blue/5 rounded-2xl flex items-center justify-center text-toss-blue mb-3">
              <span className="text-2xl font-black">{groupNumber}</span>
            </div>

            <h2 className="text-2xl font-black text-toss-black mb-1">
              {group?.nickname || `${groupNumber}조`}
            </h2>

            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-toss-lightGray/40 rounded-full mt-2">
              <Quote size={12} className="text-toss-blue shrink-0" />
              <p className="text-[13px] font-medium text-toss-gray leading-tight italic">
                {group?.slogan || "조 구호를 입력해주세요."}
              </p>
            </div>

            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-toss-border/40 w-full justify-center">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-toss-gray uppercase tracking-widest">조원 수</span>
                <span className="text-base font-black text-toss-black">{members.length}명</span>
              </div>
            </div>
          </div>

          {/* 조장 */}
          {leader && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 px-1">
                <UserCheck size={14} className="text-toss-blue" />
                <h3 className="text-xs font-bold text-toss-gray uppercase tracking-wider">우리 조장님</h3>
              </div>
              <MemberCard member={leader} isLeader hidePhone={hidePhone && leader.id === user?.uid} />
            </div>
          )}

          {/* 조원 */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 px-1">
              <Users size={14} className="text-toss-gray" />
              <h3 className="text-xs font-bold text-toss-gray uppercase tracking-wider">조원 명단</h3>
            </div>
            {regularMembers.length === 0 ? (
              <p className="text-sm text-toss-gray text-center py-6">등록된 조원이 없습니다.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {regularMembers.map((member) => (
                  <MemberCard key={member.id} member={member} hidePhone={hidePhone && member.id === user?.uid} />
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* 수정 모달 */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-surface w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-toss-black">조 정보 수정</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-toss-lightGray rounded-full transition-colors"
              >
                <X size={24} className="text-toss-gray" />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-toss-gray ml-1 uppercase tracking-wider">조 별명</label>
                <input
                  type="text"
                  value={tempNickname}
                  onChange={(e) => setTempNickname(e.target.value)}
                  placeholder="멋진 조 별명을 입력해주세요"
                  className="w-full px-4 py-3.5 rounded-2xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-base text-toss-black bg-toss-lightGray/20 dark:bg-surface"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-toss-gray ml-1 uppercase tracking-wider">조 구호</label>
                <textarea
                  rows={2}
                  value={tempSlogan}
                  onChange={(e) => setTempSlogan(e.target.value)}
                  placeholder="우리 조만의 구호를 입력해주세요"
                  className="w-full px-4 py-3.5 rounded-2xl border border-toss-border focus:border-toss-blue outline-none transition-all font-medium text-[15px] text-toss-black bg-toss-lightGray/20 dark:bg-surface resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-4 bg-toss-lightGray text-toss-gray font-bold rounded-2xl active:scale-95 transition-all"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-[2] py-4 bg-toss-blue text-white font-bold rounded-2xl shadow-lg shadow-toss-blue/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MemberCard({ member, isLeader = false, hidePhone = false }: { member: Participant; isLeader?: boolean; hidePhone?: boolean }) {
  return (
    <div
      className={`bg-white dark:bg-surface p-4 rounded-toss shadow-sm border transition-all ${
        isLeader ? "border-toss-blue/20 ring-1 ring-toss-blue/5" : "border-toss-border/40"
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              isLeader ? "bg-toss-blue text-white" : "bg-toss-lightGray text-toss-gray"
            }`}
          >
            {member.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-toss-black">{member.name}</span>
              {isLeader && (
                <span className="text-[9px] font-bold bg-toss-blue text-white px-1.5 py-0.5 rounded italic">
                  LEADER
                </span>
              )}
            </div>
            <p className="text-[11px] text-toss-gray font-medium mt-0.5">{member.team}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5">
            {member.birthYear && (
              <span className="text-[11px] font-bold text-toss-gray bg-toss-lightGray px-2 py-0.5 rounded-lg">
                {member.birthYear}또래
              </span>
            )}
            {member.room && (
              <span className="text-[11px] font-bold text-toss-blue bg-toss-blue/5 px-2 py-0.5 rounded-lg">
                {member.room}
              </span>
            )}
          </div>
          {!hidePhone && (
            <span className="text-[11px] font-mono font-medium text-toss-gray">{member.phone}</span>
          )}
        </div>
      </div>
    </div>
  );
}
