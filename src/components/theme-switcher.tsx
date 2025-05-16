// app/components/ThemeSwitcher.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Alterna entre light e dark
  const toggleTheme = () => {
    setAnimating(true);
    setTheme(theme === "dark" ? "light" : "dark");
    setTimeout(() => setAnimating(false), 400);
  };

  const isDark = theme === "dark";

  return (
    <button
      aria-label="Alternar tema"
      onClick={toggleTheme}
      className={`transition-colors duration-300 border-[1px] border-black dark:border-white rounded-none px-3 py-2 text-xl flex items-center justify-center
        ${isDark ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white text-black dark:bg-black dark:text-white"}
        hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black
        relative overflow-hidden`}
      style={{
        outline: "none",
        width: 44,
        height: 44,
        borderColor: isDark ? "#fff" : "#000"
      }}
    >
      <span
        className={`block transition-all duration-500 ease-in-out ${
          animating ? "scale-125 rotate-12 opacity-0" : "scale-100 rotate-0 opacity-100"
        } absolute inset-0 flex items-center justify-center`}
        key={isDark ? "moon" : "sun"}
      >
        {isDark ? (
          // Moon icon
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path
              d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        ) : (
          // Sun icon
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
            <g stroke="currentColor" strokeWidth="1.5">
              <line x1="12" y1="2" x2="12" y2="4"/>
              <line x1="12" y1="20" x2="12" y2="22"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="2" y1="12" x2="4" y2="12"/>
              <line x1="20" y1="12" x2="22" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </g>
          </svg>
        )}
      </span>
      <span
        className={`block transition-all duration-500 ease-in-out ${
          animating ? "scale-100 rotate-0 opacity-100" : "scale-0 opacity-0"
        } absolute inset-0 flex items-center justify-center`}
        key={isDark ? "sun" : "moon"}
      >
        {!isDark ? (
          // Moon icon (for animation out)
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path
              d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        ) : (
          // Sun icon (for animation out)
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
            <g stroke="currentColor" strokeWidth="1.5">
              <line x1="12" y1="2" x2="12" y2="4"/>
              <line x1="12" y1="20" x2="12" y2="22"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="2" y1="12" x2="4" y2="12"/>
              <line x1="20" y1="12" x2="22" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </g>
          </svg>
        )}
      </span>
      <span className="opacity-0">
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}
