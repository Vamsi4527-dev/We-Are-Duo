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
        className="w-full max-w-[26rem] sm:max-w-[30rem] bg-white border border-[#d9e2e1] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-5"
        aria-labelledby="register-title"
      >
        <header className="flex flex-col gap-1">
          <h1
            id="register-title"
            className="text-2xl font-bold tracking-tight text-[#10201f]"
          >
            Create your account
          </h1>

          <p className="text-sm text-[#566867]">
            Set up your details to request access.
          </p>
        </header>

        <div className="bg-[#eaf0ef] border border-[#d9e2e1] text-[#10201f] rounded-xl p-3.5 text-sm">
          <span className="block font-semibold mb-0.5">
            Creating an account doesn't open the chat
          </span>

          <span className="text-[#566867]">
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
              className="bg-[#fdecea] border border-[#f5c2c7] text-[#b42318] rounded-xl p-3.5 text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold text-[#10201f]"
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
              className="w-full h-11 px-4 border border-[#b3c2c0] rounded-[10px] bg-white text-[#10201f] placeholder:text-[#566867]/60 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold text-[#10201f]"
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
              className="w-full h-11 px-4 border border-[#b3c2c0] rounded-[10px] bg-white text-[#10201f] placeholder:text-[#566867]/60 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold text-[#10201f]"
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
                className="w-full h-11 pl-4 pr-11 border border-[#b3c2c0] rounded-[10px] bg-white text-[#10201f] focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-0 h-11 w-11 flex items-center justify-center text-[#566867] hover:text-[#10201f] transition cursor-pointer"
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
              className="flex flex-col gap-1 mt-1 text-sm text-[#566867]"
              aria-label="Password requirements"
            >
              <li
                className={`flex items-center gap-2 ${
                  hasEightChars ? "text-[#10201f]" : ""
                }`}
              >
                <span className="sr-only">
                  {hasEightChars ? "Met: " : "Not met: "}
                </span>

                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                    hasEightChars
                      ? "bg-[#0a6b45] border-[#0a6b45] text-[#e3f5ec]"
                      : "border-[#b3c2c0]"
                  }`}
                  aria-hidden="true"
                >
                  {hasEightChars ? "✓" : ""}
                </span>

                At least 8 characters
              </li>

              <li
                className={`flex items-center gap-2 ${
                  hasUpperCase ? "text-[#10201f]" : ""
                }`}
              >
                <span className="sr-only">
                  {hasUpperCase ? "Met: " : "Not met: "}
                </span>

                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                    hasUpperCase
                      ? "bg-[#0a6b45] border-[#0a6b45] text-[#e3f5ec]"
                      : "border-[#b3c2c0]"
                  }`}
                  aria-hidden="true"
                >
                  {hasUpperCase ? "✓" : ""}
                </span>

                One uppercase letter
              </li>

              <li
                className={`flex items-center gap-2 ${
                  hasNumber ? "text-[#10201f]" : ""
                }`}
              >
                <span className="sr-only">
                  {hasNumber ? "Met: " : "Not met: "}
                </span>

                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                    hasNumber
                      ? "bg-[#0a6b45] border-[#0a6b45] text-[#e3f5ec]"
                      : "border-[#b3c2c0]"
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
              className="text-sm font-semibold text-[#10201f]"
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
              className="w-full h-11 px-4 border border-[#b3c2c0] rounded-[10px] bg-white text-[#10201f] focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition"
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer text-sm text-[#10201f]">
            <input
              type="checkbox"
              name="terms"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              required
              className="w-4 h-4 mt-0.5 rounded border-[#b3c2c0] text-teal-700 focus:ring-teal-700 cursor-pointer"
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
            className="w-full h-11 px-5 rounded-[10px] bg-teal-700 hover:bg-[#0b5f58] text-white font-semibold transition cursor-pointer disabled:opacity-70 disabled:cursor-wait"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-center text-[#566867]">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => onNavigate("login")}
            className="font-semibold text-teal-700 hover:underline cursor-pointer"
          >
            Sign in
          </button>
        </p>
      </section>

    </AuthLayout>
  );
}