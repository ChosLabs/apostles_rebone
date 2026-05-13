"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types/database";
import { getSession, clearSession } from "@/lib/services/authService";
import { subscribeGuestMode } from "@/lib/services/appConfigService";
import { usePathname, useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuestMode: boolean;
  isGuest: boolean;
  loginState: (user: User) => void;
  logoutState: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isGuestMode: false,
  isGuest: false,
  loginState: () => {},
  logoutState: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
      setLoading(false);
    }

    const unsub = subscribeGuestMode((enabled, fromCache) => {
      setIsGuestMode(enabled);
      if (enabled) {
        const currentSession = getSession();
        if (currentSession?.role !== "admin") {
          if (currentSession?.uid?.startsWith("guest_")) {
            // 기존 게스트 세션 유지
            setUser(currentSession);
          } else if (currentSession) {
            // 일반 참가자 세션 → 초기화 (게스트 폼으로 유도)
            clearSession();
            setUser(null);
          }
          // 세션 없으면 null 유지 → 로그인 페이지에서 게스트 폼 표시
        }
        setLoading(false);
      } else if (!fromCache) {
        // 서버가 OFF 확인 → 게스트 세션 제거
        setUser((prev) => (prev?.uid?.startsWith("guest_") ? null : prev));
        setLoading(false);
      }
    });

    return unsub;
  }, []);

  // uid가 "guest_"로 시작하면 게스트
  const isGuest = !!user?.uid?.startsWith("guest_");

  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== "/login" && !pathname.startsWith("/admin")) {
        router.replace("/login");
      } else if (user && pathname === "/login") {
        router.replace(user.role === "admin" ? "/admin" : "/");
      }
      // /admin 접근 시 — admin/layout.tsx 에서 로그인 게이트 처리
    }
  }, [user, loading, pathname, router]);

  const loginState = (userData: User) => {
    setUser(userData);
  };

  const logoutState = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isGuestMode, isGuest, loginState, logoutState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
