import { useState } from "react";
import AuthLayout from "./AuthLayout";
import { resetUserPassword } from "../firebase/auth";

export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const previewMessages = [
    { text: "I can't remember my password.", incoming: true },
    { text: "It happens. Request a reset link.", incoming: false },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage("");
    setErrorMessage("");

    try {
      setIsLoading(true);
      await resetUserPassword(email);
      setStatusMessage("If an account exists with this email, a password reset link has been sent.");
    } catch (error) {
      console.error("Password reset error:", error);
      if (error.code === "auth/invalid-email") {
        setErrorMessage("Please enter a valid email address.");
      } else if (error.code === "auth/too-many-requests") {
        setErrorMessage("Too many requests. Please wait a few moments and try again.");
      } else {
        setErrorMessage("Unable to send reset link. Please check the address and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      messages={previewMessages}
      tagline="Locked out? You'll be back in a minute."
      onNavigate={onNavigate}
    >
      <section
        className="w-full max-w-[26rem] sm:max-w-[30rem] bg-white dark:bg-[#151c1b] border border-[#d9e2e1] dark:border-[#303c39] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-5"
        aria-labelledby="forgot-title"
      >
        <header className="flex flex-col gap-1">
          <h1 id="forgot-title" className="text-2xl font-bold tracking-tight text-[#10201f] dark:text-white">
            Reset your password
          </h1>
          <p className="text-sm text-[#566867] dark:text-[#aab8b5]">
            Enter your email address and we'll send you a link to choose a new password.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" method="post">
          {statusMessage && (
            <div
              className="bg-[#e3f5ec] dark:bg-[#133025] border border-[#a3e4c4] dark:border-[#255f46] text-[#0a6b45] dark:text-[#5be2a3] rounded-xl p-3.5 text-sm"
              role="status"
            >
              {statusMessage}
            </div>
          )}

          {errorMessage && (
            <div
              className="bg-[#fdecea] dark:bg-[#2d1b1b] border border-[#f5c2c7] dark:border-[#5c2b2b] text-[#b42318] dark:text-[#ff8f85] rounded-xl p-3.5 text-sm"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#10201f] dark:text-white" htmlFor="forgot-email">
              Email address
            </label>
            <input
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              required
              className="w-full h-11 px-4 border border-[#b3c2c0] dark:border-[#46534f] rounded-[10px] bg-white dark:bg-[#101615] text-[#10201f] dark:text-white placeholder:text-[#566867]/60 dark:placeholder:text-[#7f908b] focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 px-5 rounded-[10px] bg-teal-700 hover:bg-[#0b5f58] text-white font-semibold transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
          >
            {isLoading ? "Sending link..." : "Send reset link"}
          </button>
        </form>

        <p className="text-sm text-center text-[#566867] dark:text-[#aab8b5]">
          <button
            type="button"
            onClick={() => onNavigate("login")}
            className="font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
          >
            Back to sign in
          </button>
        </p>
      </section>
      
    </AuthLayout>
  );
}
