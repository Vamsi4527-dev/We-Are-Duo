import Logo from "./Logo";

export default function AuthLayout({
  messages = [],
  tagline = "",
  onNavigate,
  children,
}) {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-[minmax(22rem,5fr)_7fr] bg-[#FFFFFF] dark:bg-[#0D1211]">
      
      <aside className="hidden lg:flex flex-col justify-between p-12 min-h-screen bg-[#D9E2E1] dark:bg-[#151C1B] border-r border-[#D9E2E1] dark:border-[#303C39] sticky top-0">
        
        <div>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("splash")}
            className="cursor-pointer"
          >
            <Logo size="lg" />
          </button>
        </div>

        <div className="flex flex-col gap-3 max-w-[22rem]">
          {messages.map((item, index) => (
            <div
              key={index}
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                item.incoming
                  ? "self-start bg-white dark:bg-[#26322F] border border-[#D9E2E1] dark:border-[#303C39] text-[#10201F] dark:text-[#AAB8B5] rounded-bl-sm"
                  : "self-end bg-[#0F766E] dark:bg-[#0F766E] text-[#FFFFFF] rounded-br-sm"
              }`}
            >
              {item.text}
            </div>
          ))}
        </div>

        <p className="text-2xl font-bold tracking-tight text-[#10201F] dark:text-[#FFFFFF] leading-snug max-w-[14ch]">
          {tagline}
        </p>
      </aside>

      <main className="flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 gap-6 w-full bg-[#FFFFFF] dark:bg-[#0D1211]">

        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("splash")}
            className="cursor-pointer"
          >
            <Logo size="base" />
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}