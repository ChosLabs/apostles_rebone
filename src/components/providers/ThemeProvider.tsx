"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { subscribeDarkModeLocked } from "@/lib/services/appConfigService";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDarkModeLocked: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  isDarkModeLocked: false,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [isDarkModeLocked, setIsDarkModeLocked] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("rebone_theme") as Theme | null;
    const resolved = stored ?? "light";
    setTheme(resolved);
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, []);

  useEffect(() => {
    const unsub = subscribeDarkModeLocked((locked) => {
      setIsDarkModeLocked(locked);
      if (locked) {
        setTheme("dark");
        document.documentElement.classList.add("dark");
      }
    });
    return unsub;
  }, []);

  const toggleTheme = () => {
    if (isDarkModeLocked) return;
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("rebone_theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkModeLocked }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
