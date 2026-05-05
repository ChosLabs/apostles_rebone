"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types/database";
import { getSession } from "@/lib/services/authService";
import { usePathname, useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginState: (user: User) => void;
  logoutState: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginState: () => {},
  logoutState: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== "/login") {
        router.replace("/login");
      } else if (user && pathname === "/login") {
        if (user.role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/");
        }
      } else if (user && user.role !== "admin" && pathname.startsWith("/admin")) {
        router.replace("/");
      }
    }
  }, [user, loading, pathname, router]);

  const loginState = (userData: User) => {
    setUser(userData);
  };

  const logoutState = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginState, logoutState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
