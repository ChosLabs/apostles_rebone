"use client";

import React, { useState } from "react";
import {
  User,
  Phone,
  Users,
  Home,
  Tag,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Settings,
  Sun,
  Moon,
  Lock,
  X,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { logout, logoutGuest, verifyPassword, changePassword } from "@/lib/services/authService";

export default function MyProfilePage() {
  const router = useRouter();
  const { user, isGuest } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  const closeModal = () => {
    setShowPasswordModal(false);
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setError(""); setShowCurrent(false); setShowNew(false); setShowConfirm(false);
  };

  const handleChangePassword = async () => {
    setError("");
    if (currentPw.length !== 4 || newPw.length !== 4 || confirmPw.length !== 4) {
      setError("비밀번호는 숫자 4자리입니다."); return;
    }
    if (newPw !== confirmPw) {
      setError("새 비밀번호가 일치하지 않습니다."); return;
    }
    if (newPw === currentPw) {
      setError("현재 비밀번호와 동일합니다."); return;
    }
    setSubmitting(true);
    try {
      const valid = await verifyPassword(user.uid, currentPw);
      if (!valid) { setError("현재 비밀번호가 틀렸습니다."); return; }
      await changePassword(user.uid, newPw);
      alert("비밀번호가 변경되었습니다.");
      closeModal();
    } catch {
      setError("변경 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-surface px-5 pt-8 pb-6 border-b border-toss-border/50">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 text-toss-gray"
          >
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <h1 className="text-lg font-bold text-toss-black absolute left-1/2 -translate-x-1/2">내 정보</h1>
          <button className="text-toss-gray">
            <Settings size={22} />
          </button>
        </div>

        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-toss-lightGray flex items-center justify-center text-toss-gray/40 relative">
            <User size={40} />
            {!isGuest && (
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full border border-toss-border shadow-sm flex items-center justify-center text-toss-gray">
                <Tag size={14} />
              </button>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-black text-toss-black flex items-center gap-2">
              {isGuest ? "게스트" : user.name}
              <span className="text-xs bg-toss-blue/10 text-toss-blue px-2 py-0.5 rounded-lg font-bold">
                {isGuest ? "미로그인" : user.role === "admin" ? "관리자" : "참가자"}
              </span>
            </h2>
            {!isGuest && (
              <p className="text-sm text-toss-gray font-medium mt-1">{user.phone || "-"}</p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="px-5 py-6 space-y-4">
        {/* Retreat Info */}
        <section className="bg-white dark:bg-surface rounded-3xl p-6 shadow-sm border border-toss-border/30">
          <h3 className="text-xs font-black text-toss-gray uppercase tracking-widest mb-5 italic flex items-center gap-2">
            <ShieldCheck size={14} className="text-toss-blue" />
            수련회 배정 정보
          </h3>
          {isGuest ? (
            <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-toss-lightGray flex items-center justify-center text-toss-gray/40">
                <Lock size={22} />
              </div>
              <p className="text-sm font-bold text-toss-black">로그인 후 참가자 정보가 표시됩니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-y-6">
              <InfoItem icon={<Users size={18} />} label="소속 팀" value={user.team || "미배정"} />
              <InfoItem icon={<Users size={18} />} label="또래" value={user.birthYear ? `${user.birthYear}또래` : "미배정"} />
              <InfoItem icon={<Users size={18} />} label="배정 조" value={user.group ? `${user.group}조` : "미배정"} />
              <InfoItem icon={<Home size={18} />} label="배정 숙소" value={user.room || "미배정"} />
              <InfoItem icon={<Tag size={18} />} label="참석 구분" value={user.attendanceType || "미배정"} />
            </div>
          )}
        </section>

        {/* Action List */}
        <div className="bg-white dark:bg-surface rounded-3xl overflow-hidden shadow-sm border border-toss-border/30">
          <MenuLink
            icon={theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            label={theme === "dark" ? "라이트 모드" : "다크 모드"}
            onClick={toggleTheme}
          />
          {!isGuest && user.role !== "admin" && (
            <MenuLink
              icon={<Lock size={18} />}
              label="비밀번호 변경"
              onClick={() => setShowPasswordModal(true)}
            />
          )}
          {isGuest ? (
            <MenuLink
              icon={<LogOut size={18} />}
              label="게스트 로그아웃"
              danger
              onClick={() => logoutGuest()}
            />
          ) : (
            <MenuLink
              icon={<LogOut size={18} />}
              label="로그아웃"
              danger
              onClick={() => logout()}
            />
          )}
        </div>

        {/* 비밀번호 변경 모달 */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={closeModal}>
            <div className="bg-white dark:bg-surface w-full max-w-[420px] rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-toss-black">비밀번호 변경</h2>
                <button onClick={closeModal} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors">
                  <X size={20} className="text-toss-gray" />
                </button>
              </div>

              <p className="text-xs text-toss-gray mb-5 leading-relaxed">
                로그인 시 사용하는 숫자 4자리 비밀번호를 변경합니다.
              </p>

              <div className="space-y-3 mb-4">
                <PwInput
                  label="현재 비밀번호"
                  value={currentPw}
                  show={showCurrent}
                  onChange={(v) => { setCurrentPw(v); setError(""); }}
                  onToggle={() => setShowCurrent((p) => !p)}
                />
                <PwInput
                  label="새 비밀번호"
                  value={newPw}
                  show={showNew}
                  onChange={(v) => { setNewPw(v); setError(""); }}
                  onToggle={() => setShowNew((p) => !p)}
                />
                <PwInput
                  label="새 비밀번호 확인"
                  value={confirmPw}
                  show={showConfirm}
                  onChange={(v) => { setConfirmPw(v); setError(""); }}
                  onToggle={() => setShowConfirm((p) => !p)}
                />
              </div>

              {error && <p className="text-xs text-red-500 font-medium mb-4">{error}</p>}

              <button
                onClick={handleChangePassword}
                disabled={submitting}
                className="w-full bg-toss-blue text-white font-bold py-4 rounded-2xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                변경하기
              </button>
            </div>
          </div>
        )}

        {!isGuest && (
          <p className="text-center text-[11px] text-toss-gray pt-4 leading-relaxed">
            정보가 실제와 다를 경우 <br />
            <span className="font-bold underline cursor-pointer">운영국(임원단)</span>에 문의해 주세요.
          </p>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-toss-gray">
        <span className="opacity-60">{icon}</span>
        <span className="text-[11px] font-bold uppercase tracking-tight">{label}</span>
      </div>
      <p className="text-[15px] font-black text-toss-black ml-7">{value}</p>
    </div>
  );
}

function PwInput({ label, value, show, onChange, onToggle }: {
  label: string; value: string; show: boolean;
  onChange: (v: string) => void; onToggle: () => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold text-toss-gray mb-1.5">{label}</p>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          inputMode="numeric"
          maxLength={4}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="••••"
          className="w-full bg-toss-lightGray dark:bg-background rounded-xl px-4 py-3 text-sm font-bold text-toss-black focus:outline-none focus:ring-2 focus:ring-toss-blue/30 pr-10 tracking-[0.3em]"
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-toss-gray/60 hover:text-toss-gray transition-colors">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function MenuLink({ icon, label, danger = false, onClick }: { icon: React.ReactNode; label: string; danger?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-6 py-5 flex items-center justify-between hover:bg-toss-lightGray/30 transition-colors border-b border-toss-border/30 last:border-0"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl ${danger ? 'bg-red-50 text-red-500' : 'bg-toss-lightGray/50 text-toss-gray'}`}>
          {icon}
        </div>
        <span className={`text-[15px] font-bold ${danger ? 'text-red-500' : 'text-toss-black'}`}>{label}</span>
      </div>
      <ChevronRight size={18} className="text-toss-border" />
    </button>
  );
}
