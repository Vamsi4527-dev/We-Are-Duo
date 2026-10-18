import { useState } from "react";
import AuthLayout from "./AuthLayout";
import { loginUser } from "../firebase/auth";

export default function Login({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const previewMessages = [
    { text: "Landed. Heading to the hotel now.", incoming: true },
    { text: "Great. Text me when you're settled.", incoming: false },
    { text: "Will do.", incoming: true },
  ];

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await loginUser(email, password);
    alert("Signed in successfully!");
    onNavigate("home");
  } catch (error) {
    alert("Sign in failed: " + error.message);
  }
};

  return (
    <AuthLayout
      messages={previewMessages}
      tagline="A private place for exactly two people."
      onNavigate={onNavigate}
    >
      <section
        className="w-full max-w-[26rem] sm:max-w-[30rem] bg-white border border-[#d9e2e1] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-5"
        aria-labelledby="login-title"
      >
        <header className="flex flex-col gap-1">
          <h1 id="login-title" className="text-2xl font-bold tracking-tight text-[#10201f]">
            Sign in
          </h1>
          <p className="text-sm text-[#566867]">
            Welcome back. Sign in to open your conversation.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" method="post">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#10201f]" htmlFor="login-email">
              Email address
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              required
              className="w-full h-11 px-4 border border-[#b3c2c0] rounded-[10px] bg-white text-[#10201f] placeholder:text-[#566867]/60 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-[#10201f]" htmlFor="login-password">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate("forgot-password")}
                className="text-sm font-semibold text-teal-700 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative flex items-center">
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 pl-4 pr-11 border border-[#b3c2c0] rounded-[10px] bg-white text-[#10201f] focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-0 h-11 w-11 flex items-center justify-center text-[#566867] hover:text-[#10201f] transition cursor-pointer"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-[#10201f]">
            <input
              type="checkbox"
              name="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-[#b3c2c0] text-teal-700 focus:ring-teal-700 cursor-pointer"
            />
            <span>Remember me on this device</span>
          </label>

          <button
            type="submit"
            className="w-full h-11 px-5 rounded-[10px] bg-teal-700 hover:bg-[#0b5f58] text-white font-semibold transition cursor-pointer"
          >
            Sign in
          </button>
        </form>

        <p className="text-sm text-center text-[#566867]">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => onNavigate("register")}
            className="font-semibold text-teal-700 hover:underline cursor-pointer"
          >
            Create one
          </button>
        </p>
      </section>

    
    </AuthLayout>
  );
}
