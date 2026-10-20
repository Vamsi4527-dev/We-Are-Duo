import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") !== "light";
  });

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <button
      type="button"
      onClick={() => setDarkMode((current) => !current)}
      aria-label="Toggle dark mode"
      className="group relative w-[58px] h-[34px] rounded-full
        bg-[#eaf0ef] dark:bg-[#101615]
        border border-[#d9e2e1] dark:border-[#303c39]
        shadow-[inset_0_1px_2px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.08)]
        dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.04),0_2px_8px_rgba(0,0,0,0.35)]
        transition-all duration-300 ease-[cubic-bezier(0.65,0,0.35,1)]
        cursor-pointer">


      <span
        className={`absolute top-[3px] w-[26px] h-[26px] rounded-full
          border border-black/10 dark:border-[#FFFFFF]/10
          shadow-[0_2px_5px_rgba(0,0,0,0.22)]
          transition-all duration-300
          ease-[cubic-bezier(0.65,0,0.35,1)]
          ${
            darkMode
              ? "left-[3px] bg-[#FFFFFF]"
              : "left-[27px] bg-[#0f766e]"
          }`}/>

      <span
        className={`absolute inset-[2px] rounded-full
          pointer-events-none
          transition-all duration-300
          ${
            darkMode
              ? "shadow-[inset_2px_0_5px_rgba(255,255,255,0.04)]"
              : "shadow-[inset_-2px_0_5px_rgba(0,0,0,0.05)]"
          }`}
      />
    </button>
  );
}