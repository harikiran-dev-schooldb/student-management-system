"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const toggleTheme = () => {
    // 1. Disable transitions
    document.documentElement.classList.add("disable-transitions");
    
    // 2. Switch theme
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);

    // 3. Re-enable transitions after a tiny delay (enough for the paint to finish)
    window.setTimeout(() => {
      document.documentElement.classList.remove("disable-transitions");
    }, 0);
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-opacity"
      title="Toggle Theme"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}