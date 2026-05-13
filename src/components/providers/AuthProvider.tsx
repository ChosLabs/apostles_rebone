"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types/database";
import { getSession, clearSession } from "@/lib/services/authService";
import { subscribeGuestMode } from "@/lib/services/appConfigService";
import { usePathname, useRouter } from "next/navigation";

const GUEST_ID_KEY = "rebone_guest_id";

function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = `guest_${crypto.randomUUID()}`;
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}

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
        // 게스트 모드 ON: 관리자 제외 모든 실 세션 제거 후 게스트로 교체
        const currentSession = getSession();
        if (currentSession?.role !== "admin") {
          if (currentSession) clearSession();
          const guestId = getOrCreateGuestId();
          setUser({
            uid: guestId,
            email: "",
            name: "게스트",
            role: "user",
            createdAt: new Date().toISOString(),
          });
        }
        setLoading(false);
      } else if (!fromCache) {
        // 서버가 OFF를 확인 → 게스트 세션 제거, 다시 로그인 필요
        setUser((prev) => (prev?.uid.startsWith("guest_") ? null : prev));
        setLoading(false);
      }
      // 캐시가 OFF를 반환한 경우: 서버 응답 대기, loading 유지
    });

    return unsub;
  }, []);

  const isGuest = (isGuestMode && user?.role !== "admin") || !!user?.uid.startsWith("guest_");

  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== "/login") {
        router.replace("/login");
      } else if (user && pathname === "/login") {
        router.replace(user.role === "admin" ? "/admin" : "/");
      } else if (user && user.role !== "admin" && pathname.startsWith("/admin")) {
        router.replace("/");
      }
    }
  }, [user, loading, isGuest, pathname, router]);

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
