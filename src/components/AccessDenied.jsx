import AuthLayout from "./AuthLayout";

export default function AccessDenied({ onNavigate }) {
  const previewMessages = [
    { text: "Two rings. Two people.", incoming: true },
    { text: "No room for a third.", incoming: false },
  ];

  return (
    <AuthLayout
      messages={previewMessages}
      tagline="This conversation belongs to two people only."
      onNavigate={onNavigate}
    >
      <section
        className="w-full max-w-[26rem] sm:max-w-[30rem] bg-white dark:bg-[#151c1b] border border-[#d9e2e1] dark:border-[#303c39] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-5"
        aria-labelledby="denied-title"
      >
        <div className="w-14 h-14 rounded-full bg-[#F1F5F4] dark:bg-[#26322f] text-[#7F908B] dark:text-[#0F766E] flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>

        <header className="flex flex-col gap-1">
          <h1 id="denied-title" className="text-2xl font-bold tracking-tight text-[#10201f] dark:text-[#FFFFFF]">
            This chat is private
          </h1>
          <p className="text-sm text-[#566867] dark:text-[#aab8b5] leading-relaxed">
            jamie@example.com isn't one of the two approved users, so you can't open this conversation.
          </p>
        </header>

        <div className="bg-[#F1F5F4] dark:bg-[#26322f] border border-[#7F908B]/40 dark:border-[#303c39] text-[#7F908B] dark:text-[#0F766E] rounded-xl p-3.5 text-sm" role="alert">
          <span className="block font-semibold mb-0.5">Think this is a mistake?</span>
          <span className="text-[#7F908B]/90 dark:text-[#0F766E]">
            Ask one of the approved users to check that your email address matches the one on the approved list.
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => onNavigate("login")}
            className="w-full h-11 px-5 rounded-[10px] bg-[#0f766e] hover:bg-[#0F766E] text-[#FFFFFF] font-semibold transition cursor-pointer"
          >
            Sign out
          </button>
          <button
            type="button"
            onClick={() => onNavigate("splash")}
            className="w-full h-11 px-5 rounded-[10px] bg-white dark:bg-[#151c1b] border border-[#d9e2e1] dark:border-[#303c39] text-[#10201f] dark:text-[#FFFFFF] font-semibold hover:bg-[#eaf0ef] dark:hover:bg-[#26322f] transition cursor-pointer"
          >
            Back to start
          </button>
        </div>

        <p className="text-xs text-[#566867] dark:text-[#aab8b5] leading-relaxed">
          <span className="inline-block bg-[#eaf0ef] dark:bg-[#26322f] text-[#566867] dark:text-[#aab8b5] text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded mr-1">
            Demo
          </span>
          Deciding who is approved needs a backend. Later, Firebase security rules will do this check, not the page itself.
        </p>
      </section>
    </AuthLayout>
  );
}
