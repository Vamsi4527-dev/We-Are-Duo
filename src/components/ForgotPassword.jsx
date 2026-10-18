import { useState } from "react";
import AuthLayout from "./AuthLayout";
import { resetUserPassword } from "../firebase/auth";

export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState("");

  const previewMessages = [
    { text: "I can't remember my password.", incoming: true },
    { text: "It happens. Request a reset link.", incoming: false },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await resetUserPassword(email);
      alert("Password reset link sent! Check your email.");

    } catch (error) {
      alert("Failed to send reset link: " + error.message);
    }
  };

  return (
    <AuthLayout
      messages={previewMessages}
      tagline="Locked out? You'll be back in a minute."
      onNavigate={onNavigate}
    >
      <section
        className="w-full max-w-[26rem] sm:max-w-[30rem] bg-white border border-[#d9e2e1] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-5"
        aria-labelledby="forgot-title"
      >
        <header className="flex flex-col gap-1">
          <h1 id="forgot-title" className="text-2xl font-bold tracking-tight text-[#10201f]">
            Reset your password
          </h1>
          <p className="text-sm text-[#566867]">
            Enter your email address and we'll send you a link to choose a new password.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" method="post">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#10201f]" htmlFor="forgot-email">
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
              className="w-full h-11 px-4 border border-[#b3c2c0] rounded-[10px] bg-white text-[#10201f] placeholder:text-[#566867]/60 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 px-5 rounded-[10px] bg-teal-700 hover:bg-[#0b5f58] text-white font-semibold transition cursor-pointer"
          >
            Send reset link
          </button>
        </form>

        <p className="text-sm text-center text-[#566867]">
          <button
            type="button"
            onClick={() => onNavigate("login")}
            className="font-semibold text-teal-700 hover:underline cursor-pointer"
          >
            Back to sign in
          </button>
        </p>
      </section>
      
    </AuthLayout>
  );
}
