"use client";

import { useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

const STORAGE_KEY = "campulist-theme";

const readTheme = (): ThemeMode => {
  const current = document.documentElement.getAttribute("data-theme");
  if (current === "light" || current === "dark") {
    return current;
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") {
    return saved;
  }

  return "dark";
};

const applyTheme = (theme: ThemeMode) => {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEY, theme);
};

export function ThemeModeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const nextTheme = readTheme();
    setTheme(nextTheme);
    applyTheme(nextTheme);
    setMounted(true);
  }, []);

  const handleChange = (nextTheme: ThemeMode) => {
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  if (!mounted) {
    return <div className="theme-toggle-placeholder" aria-hidden="true" />;
  }

  return (
    <div className="theme-toggle" role="group" aria-label="화면 모드 선택">
      <button
        type="button"
        className={theme === "dark" ? "is-active" : ""}
        onClick={() => handleChange("dark")}
      >
        다크
      </button>
      <button
        type="button"
        className={theme === "light" ? "is-active" : ""}
        onClick={() => handleChange("light")}
      >
        라이트
      </button>
    </div>
  );
}
