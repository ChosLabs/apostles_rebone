"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { login } from "@/lib/services/authService";
import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2, User, KeyRound, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { loginState } = useAuth();

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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 pb-20">
      <div className="w-full max-w-[360px] space-y-12">
        {/* Logo Section */}
        <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Image
            src="/rebon_logo_blue.png"
            alt="Re:본 로고"
            width={220}
            height={220}
            className="mx-auto"
            priority
            loading="eager"
          />
          <p className="text-[15px] font-bold text-toss-gray/60 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            2026 Apostles Summer Retreat
          </p>
        </div>

        {/* Login Form */}
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

        <div className="pt-8 text-center animate-in fade-in duration-1000 delay-500">
          <p className="text-[11px] text-toss-gray/40 font-medium leading-relaxed">
            수련회 신청 시 등록한 정보로 로그인해 주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
