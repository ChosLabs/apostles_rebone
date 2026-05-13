"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { login, loginAsGuest } from "@/lib/services/authService";
import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2, User, KeyRound, ArrowRight, ChevronDown } from "lucide-react";
import { clsx } from "clsx";

const GUEST_TEAMS = [
  "초신자팀", "기신자팀", "1팀", "2팀", "3팀", "4팀", "5팀", "6팀", "웰컴팀", "임원단",
] as const;

export default function LoginPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { loginState, isGuestMode } = useAuth();

  // Guest form
  const [guestName, setGuestName] = useState("");
  const [guestTeam, setGuestTeam] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestError, setGuestError] = useState("");
  const [isGuestSubmitting, setIsGuestSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const user = await login(name, password);
      if (user) {
        loginState(user);
        router.push("/");
      } else {
        setError("일치하는 정보를 찾을 수 없습니다.");
      }
    } catch (err) {
      console.error(err);
      setError("로그인 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) { setGuestError("이름을 입력해주세요."); return; }
    if (!guestTeam) { setGuestError("팀을 선택해주세요."); return; }
    if (!guestPhone || guestPhone.length !== 4) { setGuestError("전화번호 뒷 4자리를 입력해주세요."); return; }

    setIsGuestSubmitting(true);
    setGuestError("");
    try {
      const user = loginAsGuest(guestName.trim(), guestTeam, guestPhone);
      loginState(user);
      router.push("/");
    } finally {
      setIsGuestSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 pb-20">
      <div className="w-full max-w-[360px] space-y-10">
        {/* Logo Section */}
        <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Image
            src="/applogo.svg"
            alt="Re:본 로고"
            width={220}
            height={220}
            className="mx-auto"
            priority
            loading="eager"
            unoptimized
          />
          <p className="text-[15px] font-bold text-toss-gray/60 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            2026 Apostles Summer Retreat
          </p>
        </div>

        {isGuestMode ? (
          /* 게스트 모드 — 게스트 입장 폼 */
          <form
            onSubmit={handleGuestLogin}
            className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
          >
            <div className="text-center mb-2">
              <span className="inline-block text-xs font-bold bg-toss-blue/10 text-toss-blue px-3 py-1.5 rounded-full">
                게스트 입장
              </span>
            </div>

            {/* 이름 */}
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-toss-gray group-focus-within:text-toss-blue transition-colors" size={20} />
              <input
                type="text"
                placeholder="이름"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-toss-border focus:border-toss-blue outline-none transition-all font-bold placeholder:text-toss-gray/30 shadow-sm"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
            </div>

            {/* 팀 선택 */}
            <div className="relative group">
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-toss-gray pointer-events-none" size={20} />
              <select
                className={clsx(
                  "w-full px-4 py-4 rounded-2xl bg-white border border-toss-border focus:border-toss-blue outline-none transition-all font-bold shadow-sm appearance-none",
                  guestTeam ? "text-toss-black" : "text-toss-gray/30"
                )}
                value={guestTeam}
                onChange={(e) => setGuestTeam(e.target.value)}
              >
                <option value="">팀 선택</option>
                {GUEST_TEAMS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* 전화번호 뒷자리 */}
            <div className="relative group">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-toss-gray group-focus-within:text-toss-blue transition-colors" size={20} />
              <input
                type="number"
                placeholder="전화번호 뒷 4자리"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-toss-border focus:border-toss-blue outline-none transition-all font-bold placeholder:text-toss-gray/30 shadow-sm"
                value={guestPhone}
                maxLength={4}
                onChange={(e) => setGuestPhone(e.target.value.slice(0, 4))}
              />
            </div>

            {guestError && (
              <p className="text-xs font-bold text-red-500 text-center px-1 animate-in shake duration-300">
                {guestError}
              </p>
            )}

            <button
              type="submit"
              disabled={isGuestSubmitting}
              className="w-full bg-toss-blue text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-toss-blue/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 h-[56px]"
            >
              {isGuestSubmitting ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  입장하기
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* 일반 로그인 폼 */
          <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="space-y-2">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-toss-gray group-focus-within:text-toss-blue transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="이름"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-toss-border focus:border-toss-blue outline-none transition-all font-bold placeholder:text-toss-gray/30 shadow-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-toss-gray group-focus-within:text-toss-blue transition-colors" size={20} />
                <input
                  type="password"
                  placeholder="전화번호 뒷 4자리"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-toss-border focus:border-toss-blue outline-none transition-all font-bold placeholder:text-toss-gray/30 shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-red-500 text-center px-1 animate-in shake duration-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-toss-blue text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-toss-blue/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 h-[56px]"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  로그인하기
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-4 text-center animate-in fade-in duration-1000 delay-500">
          <p className="text-[11px] text-toss-gray/40 font-medium leading-relaxed">
            {isGuestMode
              ? "게스트 모드로 운영 중입니다."
              : "수련회 신청 시 등록한 정보로 로그인해 주세요."}
          </p>
        </div>
      </div>
    </div>
  );
}
