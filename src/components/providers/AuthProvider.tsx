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

    // enabled 값이 같을 때 세션 처리가 두 번 실행되는 것을 방지
    // (Firestore가 fromCache=true 먼저, fromCache=false 나중에 두 번 전달하는 경우)
    const processedEnabled = { current: null as boolean | null };

    const unsub = subscribeGuestMode((enabled, fromCache) => {
      setIsGuestMode(enabled);
      const alreadyProcessed = processedEnabled.current === enabled;

      if (enabled) {
        if (!alreadyProcessed) {
          processedEnabled.current = enabled;
          const currentSession = getSession();
          if (currentSession?.role !== "admin") {
            if (currentSession?.uid?.startsWith("guest_")) {
              setUser(currentSession);
            } else if (currentSession) {
              clearSession();
              setUser(null);
            }
          }
        }
        setLoading(false);
      } else if (!fromCache) {
        processedEnabled.current = enabled;
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
