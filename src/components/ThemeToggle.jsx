import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
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
        bg-[#eef2f1] dark:bg-[#151b1a]
        border border-[#cbd5d3] dark:border-[#394442]
        shadow-[inset_0_1px_2px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.08)]
        dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.04),0_2px_8px_rgba(0,0,0,0.35)]
        transition-all duration-300 ease-[cubic-bezier(0.65,0,0.35,1)]
        cursor-pointer">


      <span
        className={`absolute top-[3px] w-[26px] h-[26px] rounded-full
          border border-black/10 dark:border-white/10
          shadow-[0_2px_5px_rgba(0,0,0,0.22)]
          transition-all duration-300
          ease-[cubic-bezier(0.65,0,0.35,1)]
          ${
            darkMode
              ? "left-[3px] bg-white"
              : "left-[27px] bg-black"
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