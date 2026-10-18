import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./firebase/auth";

import Splash from "./components/Splash";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import AccessDenied from "./components/AccessDenied";
import Home from "./components/Home";
import Chat from "./components/Chat";
import Logo from "./components/Logo";
import ThemeToggle from "./components/ThemeToggle";
import { setUserOnline, setUserOffline } from "./firebase/presence";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("splash");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        setCurrentScreen("home");
        setSelectedContact(null)
        setMobileMenuOpen(false);
      } else {
        setCurrentScreen("login");
        setSelectedContact(null);
      }

      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
  if (!user) {
    return;
  }

  setUserOnline(user.uid).catch((error) => {
    console.error("Failed to set user online:", error);
  });

  return () => {
    setUserOffline(user.uid).catch((error) => {
      console.error("Failed to set user offline:", error);
    });
  };
}, [user]);

  const navigateTo = (screen) => {
    setCurrentScreen(screen);
    setMobileMenuOpen(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#f3f6f6] dark:bg-[#0d1211]">
        <p className="text-[#566867] font-medium">
          Loading Duo...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6f6] dark:bg-[#0d1211] flex flex-col">

      {/* Public Navigation */}
      {!user && (
        <header className="sticky top-0 z-50 bg-white dark:bg-[#111817]
        border-b border-[#d9e2e1] dark:border-[#293432]">

          {/* Header Bar */}
          <div className="px-4 py-3 flex items-center justify-between">

            {/* Logo */}
            <button
              type="button"
              onClick={() => navigateTo("splash")}
              className="cursor-pointer hover:opacity-80 transition">
              <Logo size="base"/>
            </button>

            {/* Header Controls */}
<div className="flex items-center gap-3">

    {/* Desktop Navigation */}
    <nav className="hidden md:flex items-center gap-2">

      <button
        type="button"
        onClick={() => navigateTo("splash")}
        className="px-3 py-2 rounded-lg text-sm font-semibold text-[#10201f] dark:text-white hover:bg-[#eaf0ef] dark:hover:bg-[#202a28] transition cursor-pointer"
      >
        Welcome
      </button>

      <button
        type="button"
        onClick={() => navigateTo("login")}
        className="px-3 py-2 rounded-lg text-sm font-semibold text-[#10201f] dark:text-white hover:bg-[#eaf0ef] dark:hover:bg-[#202a28] transition cursor-pointer"
      >
        Sign In
      </button>

      <button
        type="button"
        onClick={() => navigateTo("register")}
        className="px-3 py-2 rounded-lg text-sm font-semibold text-[#10201f] dark:text-white hover:bg-[#eaf0ef] dark:hover:bg-[#202a28] transition cursor-pointer"
      >
        Register
      </button>

      <button
        type="button"
        onClick={() => navigateTo("forgot-password")}
        className="px-3 py-2 rounded-lg text-sm font-semibold text-[#10201f] dark:text-white hover:bg-[#eaf0ef] dark:hover:bg-[#202a28] transition cursor-pointer"
      >
        Forgot Password
      </button>

    </nav>

    {/* One shared theme toggle */}
    <ThemeToggle />

    {/* Mobile Menu Button */}
    <button
      type="button"
      onClick={() => setMobileMenuOpen((previous) => !previous)}
      className="md:hidden w-10 h-10 rounded-lg bg-[#eaf0ef] dark:bg-[#202a28] text-[#10201f] dark:text-white text-xl font-semibold cursor-pointer hover:bg-[#d9e2e1] dark:hover:bg-[#2c3936] transition"
      aria-label="Toggle navigation menu"
      aria-expanded={mobileMenuOpen}
    >
      ☰
    </button>

  </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden bg-white dark:bg-[#111817] border-t border-[#d9e2e1] dark:border-[#293432] px-4 py-3 space-y-2">

              <button
                type="button"
                onClick={() => navigateTo("splash")}
                className="block w-full text-left px-3 py-2 rounded-lg 
                text-sm font-semibold text-[#10201f] hover:bg-[#eaf0ef] transition cursor-pointer">
                Welcome
              </button>


              <button
                type="button"
                onClick={() => navigateTo("login")}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-[#10201f] hover:bg-[#eaf0ef] transition cursor-pointer">
                Sign In
              </button>

              <button
                type="button"
                onClick={() => navigateTo("register")}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-[#10201f] hover:bg-[#eaf0ef] transition cursor-pointer">
                Register
              </button>

              <button
                type="button"
                onClick={() => navigateTo("forgot-password")}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-[#10201f] hover:bg-[#eaf0ef] transition cursor-pointer">
                Forgot Password
              </button>

            </nav>
          )}

        </div>
      </header>
      )}

      {/* Page Content */}
      <div className="flex-1">

        {currentScreen === "splash" && (
          <Splash onNavigate={navigateTo} />
        )}

        {currentScreen === "login" && (
          <Login onNavigate={navigateTo} />
        )}

        {currentScreen === "register" && (
          <Register onNavigate={navigateTo} />
        )}

        {currentScreen === "forgot-password" && (
          <ForgotPassword onNavigate={navigateTo} />
        )}

        {currentScreen === "access-denied" && (
          <AccessDenied onNavigate={navigateTo} />
        )}

       {currentScreen === "home" && (
        user ? (
        selectedContact ? (
        <Chat user={user}
              contact={selectedContact}
              onBack={() => setSelectedContact(null)}/>
            ):(
        <Home user={user}
              onOpenChat={(contact) => setSelectedContact(contact)}/>
            )
          ):(
            <Login onNavigate={navigateTo} />
          )
        )}

      </div>

    </div>
  );
}