import { useState } from "react";
import AuthLayout from "./AuthLayout";
import { registerUser } from "../firebase/auth";
import { createUserProfile } from "../firebase/users";

export default function Register({ onNavigate }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const previewMessages = [
    { text: "Did you manage to sign up?", incoming: true },
    { text: "Yes. Now I just need to be approved.", incoming: false },
    { text: "Done on my side.", incoming: true },
  ];

  const hasEightChars = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (!hasEightChars || !hasUpperCase || !hasNumber) {
      setError("Please meet all password requirements.");
      return;
    }

    if (!terms) {
      setError("Please accept the terms of use.");
      return;
    }

    try {
      setIsLoading(true);

      const user = await registerUser(name, email, password);
      await createUserProfile(user);
      alert("Account created successfully!");
      onNavigate("login");
      
    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak.");
      } else {
        setError("Unable to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      messages={previewMessages}
      tagline="Only two people get in. Everyone else stays out."
      onNavigate={onNavigate}
    >
      <section
        className="w-full max-w-[26rem] sm:max-w-[30rem] bg-white dark:bg-[#151C1B] border border-[#D9E2E1] dark:border-[#303C39] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-5"
        aria-labelledby="register-title"
      >
        <header className="flex flex-col gap-1">
          <h1
            id="register-title"
            className="text-2xl font-bold tracking-tight text-[#10201F] dark:text-[#FFFFFF]"
          >
            Create your account
          </h1>

          <p className="text-sm text-[#566867] dark:text-[#7F908B]">
            Set up your details to request access.
          </p>
        </header>

        <div className="bg-[#F1F5F4] dark:bg-[#26322F] border border-[#D9E2E1] dark:border-[#303C39] text-[#10201F] dark:text-[#AAB8B5] rounded-xl p-3.5 text-sm">
          <span className="block font-semibold mb-0.5">
            Creating an account doesn't open the chat
          </span>

          <span className="text-[#566867] dark:text-[#7F908B]">
            Only the two approved users can enter. Your account is checked
            against that list before you get access.
          </span>
        </div>

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
              htmlFor="register-name"
            >
              Full name
            </label>

            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Morgan"
              required
              className="w-full h-11 px-4 border border-[#D9E2E1] dark:border-[#46534F] rounded-[10px] bg-white dark:bg-[#26322F] text-[#10201F] dark:text-[#AAB8B5] placeholder:text-[#566867]/60 dark:placeholder:text-[#7F908B] focus:outline-none focus:ring-2 focus:ring-[#0F766E] dark:focus:ring-[#0F766E] focus:border-transparent transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold text-[#10201F] dark:text-[#FFFFFF]"
              htmlFor="register-email"
            >
              Email address
            </label>

            <input
              id="register-email"
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
            <label
              className="text-sm font-semibold text-[#10201F] dark:text-[#FFFFFF]"
              htmlFor="register-password"
            >
              Password
            </label>

            <div className="relative flex items-center">
              <input
                id="register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                aria-describedby="register-password-rules"
                className="w-full h-11 pl-4 pr-11 border border-[#D9E2E1] dark:border-[#46534F] rounded-[10px] bg-white dark:bg-[#26322F] text-[#10201F] dark:text-[#AAB8B5] focus:outline-none focus:ring-2 focus:ring-[#0F766E] dark:focus:ring-[#0F766E] focus:border-transparent transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
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

            <ul
              id="register-password-rules"
              className="flex flex-col gap-1 mt-1 text-sm text-[#566867] dark:text-[#7F908B]"
              aria-label="Password requirements"
            >
              <li
                className={`flex items-center gap-2 ${
                  hasEightChars ? "text-[#10201F] dark:text-[#AAB8B5]" : ""
                }`}
              >
                <span className="sr-only">
                  {hasEightChars ? "Met: " : "Not met: "}
                </span>

                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                    hasEightChars
                      ? "bg-[#0F766E] dark:bg-[#0F766E] border-[#0F766E] dark:border-[#0F766E] text-white"
                      : "border-[#D9E2E1] dark:border-[#303C39]"
                  }`}
                  aria-hidden="true"
                >
                  {hasEightChars ? "✓" : ""}
                </span>

                At least 8 characters
              </li>

              <li
                className={`flex items-center gap-2 ${
                  hasUpperCase ? "text-[#10201F] dark:text-[#AAB8B5]" : ""
                }`}
              >
                <span className="sr-only">
                  {hasUpperCase ? "Met: " : "Not met: "}
                </span>

                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                    hasUpperCase
                      ? "bg-[#0F766E] dark:bg-[#0F766E] border-[#0F766E] dark:border-[#0F766E] text-white"
                      : "border-[#D9E2E1] dark:border-[#303C39]"
                  }`}
                  aria-hidden="true"
                >
                  {hasUpperCase ? "✓" : ""}
                </span>

                One uppercase letter
              </li>

              <li
                className={`flex items-center gap-2 ${
                  hasNumber ? "text-[#10201F] dark:text-[#AAB8B5]" : ""
                }`}
              >
                <span className="sr-only">
                  {hasNumber ? "Met: " : "Not met: "}
                </span>

                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                    hasNumber
                      ? "bg-[#0F766E] dark:bg-[#0F766E] border-[#0F766E] dark:border-[#0F766E] text-white"
                      : "border-[#D9E2E1] dark:border-[#303C39]"
                  }`}
                  aria-hidden="true"
                >
                  {hasNumber ? "✓" : ""}
                </span>

                One number
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold text-[#10201F] dark:text-[#FFFFFF]"
              htmlFor="register-confirm"
            >
              Confirm password
            </label>

            <input
              id="register-confirm"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full h-11 px-4 border border-[#D9E2E1] dark:border-[#46534F] rounded-[10px] bg-white dark:bg-[#26322F] text-[#10201F] dark:text-[#AAB8B5] focus:outline-none focus:ring-2 focus:ring-[#0F766E] dark:focus:ring-[#0F766E] focus:border-transparent transition"
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer text-sm text-[#10201F] dark:text-[#AAB8B5]">
            <input
              type="checkbox"
              name="terms"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              required
              className="w-4 h-4 mt-0.5 rounded border-[#D9E2E1] dark:border-[#303C39] text-[#0F766E] focus:ring-[#0F766E] cursor-pointer"
            />

            <span className="leading-snug">
              I understand this chat is limited to two approved users, and I
              accept the terms of use.
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
            className="w-full h-11 px-5 rounded-[10px] bg-[#0F766E] dark:bg-[#0F766E] hover:bg-[#0F766E] dark:hover:bg-[#0F766E] text-[#FFFFFF] font-semibold transition cursor-pointer disabled:opacity-70 disabled:cursor-wait"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-center text-[#566867] dark:text-[#7F908B]">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => onNavigate("login")}
            className="font-semibold text-[#0F766E] dark:text-[#0F766E] hover:underline cursor-pointer"
          >
            Sign in
          </button>
        </p>
      </section>

    </AuthLayout>
  );
}