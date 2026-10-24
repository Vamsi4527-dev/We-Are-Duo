import { useState } from "react";
import AuthLayout from "./AuthLayout";
import { loginUser } from "../firebase/auth";

export default function Login({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const previewMessages = [
    { text: "Landed. Heading to the hotel now.", incoming: true },
    { text: "Great. Text me when you're settled.", incoming: false },
    { text: "Will do.", incoming: true },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setIsLoading(true);
      await loginUser(email, password);
      onNavigate("home");
    } catch (err) {
      console.error("Sign in failed:", err);
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-email"
      ) {
        setError("Invalid email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Unable to sign in. Please verify your credentials and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      messages={previewMessages}
      tagline="A private place for exactly two people."
      onNavigate={onNavigate}
    >
      <section
        className="w-full max-w-[26rem] sm:max-w-[30rem] bg-white dark:bg-[#151C1B] border border-[#D9E2E1] dark:border-[#303C39] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-5"
        aria-labelledby="login-title"
      >
        <header className="flex flex-col gap-1">
          <h1
            id="login-title"
            className="text-2xl font-bold tracking-tight text-[#10201F] dark:text-[#FFFFFF]"
          >
            Sign in
          </h1>

          <p className="text-sm text-[#566867] dark:text-[#7F908B]">
            Welcome back. Sign in to open your conversation.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
          method="post"
        >
          {error && (
            <div
              className="bg-[#F1F5F4] dark:bg-[#26322F] border border-[#F1F5F4] dark:border-[#303C39] text-[#EF4444] dark:text-[#EF4444] rounded-xl p-3.5 text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold text-[#10201F] dark:text-[#FFFFFF]"
              htmlFor="login-email"
            >
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
              className="w-full h-11 px-4 border border-[#D9E2E1] dark:border-[#46534F] rounded-[10px] bg-white dark:bg-[#26322F] text-[#10201F] dark:text-[#AAB8B5] placeholder:text-[#566867]/60 dark:placeholder:text-[#7F908B] focus:outline-none focus:ring-2 focus:ring-[#0F766E] dark:focus:ring-[#0F766E] focus:border-transparent transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                className="text-sm font-semibold text-[#10201F] dark:text-[#FFFFFF]"
                htmlFor="login-password"
              >
                Password
              </label>

              <button
                type="button"
                onClick={() => onNavigate("forgot-password")}
                className="text-sm font-semibold text-[#0F766E] dark:text-[#0F766E] hover:underline cursor-pointer"
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
                className="w-full h-11 pl-4 pr-11 border border-[#D9E2E1] dark:border-[#46534F] rounded-[10px] bg-white dark:bg-[#26322F] text-[#10201F] dark:text-[#AAB8B5] placeholder:text-[#566867]/60 dark:placeholder:text-[#7F908B] focus:outline-none focus:ring-2 focus:ring-[#0F766E] dark:focus:ring-[#0F766E] focus:border-transparent transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                className="absolute right-0 h-11 w-11 flex items-center justify-center text-[#566867] dark:text-[#7F908B] hover:text-[#10201F] dark:hover:text-[#FFFFFF] transition cursor-pointer"
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-[#10201F] dark:text-[#AAB8B5]">
            <input
              type="checkbox"
              name="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-[#D9E2E1] dark:border-[#303C39] text-[#0F766E] focus:ring-[#0F766E] cursor-pointer"
            />

            <span>Remember me on this device</span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 px-5 rounded-[10px] bg-[#0F766E] dark:bg-[#0F766E] hover:bg-[#0F766E] dark:hover:bg-[#0F766E] text-[#FFFFFF] font-semibold transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-center text-[#566867] dark:text-[#7F908B]">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => onNavigate("register")}
            className="font-semibold text-[#0F766E] dark:text-[#0F766E] hover:underline cursor-pointer"
          >
            Create one
          </button>
        </p>
      </section>
    </AuthLayout>
  );
}