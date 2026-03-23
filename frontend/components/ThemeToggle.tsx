"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const toggle = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="flex bg-[var(--surface)] self-center rounded-full p-1 border border-[var(--glass-border)]">
      <button
        onClick={() => toggle("dark")}
        className={`px-3 py-1 rounded-full font-mono text-[11px] transition-colors ${
          theme === "dark" 
            ? "bg-[var(--accent)] text-ink-950 font-medium" 
            : "text-[var(--text-2)] hover:text-[var(--text-1)]"
        }`}
        aria-pressed={theme === "dark"}
      >
        Dark
      </button>
      <button
        onClick={() => toggle("light")}
        className={`px-3 py-1 rounded-full font-mono text-[11px] transition-colors ${
          theme === "light" 
            ? "bg-[var(--accent)] text-parchment-50 font-medium" 
            : "text-[var(--text-2)] hover:text-[var(--text-1)]"
        }`}
        aria-pressed={theme === "light"}
      >
        Light
      </button>
    </div>
  );
}
