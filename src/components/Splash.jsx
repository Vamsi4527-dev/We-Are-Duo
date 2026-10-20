import Logo from "./Logo";

export default function Splash({ onNavigate }) {
  return (
    <main className="min-h-screen grid place-items-center 
    bg-[#FFFFFF] dark:bg-[#0d1211] px-4 py-12 text-center">
      <div className="flex flex-col items-center gap-6 max-w-xs w-full">
        <Logo size="xl" animated={true} />

        <p className="text-[#566867] dark:text-[#aab8b5] text-base">
          Private conversations for two.
        </p>

        <div className="relative w-32 h-1 bg-[#eaf0ef] dark:bg-[#26322f] rounded-full overflow-hidden"
        role="progressbar" aria-label="Loading We Are Duo">
          <div className="absolute inset-y-0 w-2/5 rounded-full bg-[#0f766e] animate-loader-sweep"></div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("login")}
          className="w-full h-11 px-5 rounded-[10px] bg-white dark:bg-[#151c1b] border border-[#b3c2c0]
          dark:border-[#303c39] text-[#10201f] dark:text-[#FFFFFF] font-semibold hover:bg-[#eaf0ef] dark:hover:bg-[#26322f] transition cursor-pointer">
          Continue to sign in
        </button>
      </div>
    </main>
  );
}
