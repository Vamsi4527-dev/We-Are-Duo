import Logo from "./Logo";

export default function AuthLayout({ messages = [], tagline = "", onNavigate, children }) {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-[minmax(22rem,5fr)_6fr] bg-[#f3f6f6]">
      <aside className="hidden lg:flex flex-col justify-between p-12 h-screen sticky top-0 bg-[#e2f3f1] border-r border-[#d9e2e1]" aria-hidden="true">
        <div>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("splash")}
            className="cursor-pointer hover:opacity-90 transition"
          >
            <Logo size="lg" />
          </button>
        </div>

        <div className="flex flex-col gap-2 max-w-[22rem] w-full my-auto">
          {messages.map((item, index) => (
            <div
              key={index}
              className={`max-w-[85%] px-4 py-3 rounded-[18px] text-sm leading-snug ${
                item.incoming
                  ? "self-start bg-white border border-[#d9e2e1] text-[#10201f] rounded-bl-[6px]"
                  : "self-end bg-teal-700 text-white rounded-br-[6px]"
              }`}
            >
              {item.text}
            </div>
          ))}
        </div>

        <p className="text-2xl font-bold tracking-tight text-[#10201f] leading-tight max-w-[14ch]">
          {tagline}
        </p>
      </aside>

      <main className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 lg:p-12 gap-6 w-full min-h-screen">
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("splash")}
            className="cursor-pointer hover:opacity-90 transition"
          >
            <Logo size="base" />
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
