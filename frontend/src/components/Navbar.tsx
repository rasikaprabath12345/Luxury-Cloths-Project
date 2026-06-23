"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface User {
  name: string;
  email: string;
  role: "admin" | "customer";
}

// ─── MOCK USER — replace with your real session/NextAuth logic ────────────────
const MOCK_USER: User = {
  name: "Ashan Silva",
  email: "ashan@luxurycloth.lk",
  role: "admin",
};

// ─── NAV TABS ─────────────────────────────────────────────────────────────────
const NAV_TABS = [
  { label: "Home",        href: "/" },
  { label: "Shop",        href: "/storefront/product" },
  { label: "Collections", href: "/collections" },
  { label: "About",       href: "/about" },
];

// ─── USER DROPDOWN ────────────────────────────────────────────────────────────
function UserMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 bg-white/80 backdrop-blur-xl
                   border border-white/90 rounded-full pl-1 pr-3.5 py-1
                   shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
      >
        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
                         text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
          {initials}
        </span>
        <span className="text-[13px] font-semibold text-[#1D1D1F] hidden sm:block">
          {user.name.split(" ")[0]}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-[#86868B] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-64
                        bg-white/90 backdrop-blur-2xl border border-white/80
                        rounded-2xl shadow-2xl shadow-black/10 overflow-hidden z-50">

          {/* User header */}
          <div className="px-4 py-3.5 border-b border-gray-100/80">
            <p className="text-[13px] font-semibold text-[#1D1D1F]">{user.name}</p>
            <p className="text-[11px] text-[#86868B] mt-0.5">{user.email}</p>
            {user.role === "admin" && (
              <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-widest
                               text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                Admin
              </span>
            )}
          </div>

          {/* Links */}
          <div className="py-1.5">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#1D1D1F] hover:bg-gray-50 transition-colors"
            >
              <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-[12px]">👤</span>
              My Profile
            </Link>
            <Link
              href="/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#1D1D1F] hover:bg-gray-50 transition-colors"
            >
              <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-[12px]">📦</span>
              My Orders
            </Link>
            {user.role === "admin" && (
              <Link
                href="/admin/products"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#1D1D1F] hover:bg-gray-50 transition-colors"
              >
                <span className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-[12px]">⚙️</span>
                Dashboard
                <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-blue-500">Admin</span>
              </Link>
            )}
          </div>

          {/* Sign Out */}
          <div className="px-2 pb-2 border-t border-gray-100/80 pt-1.5">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-red-500
                         hover:bg-red-50 rounded-xl transition-colors font-medium"
            >
              <span className="w-6 h-6 bg-red-50 rounded-lg flex items-center justify-center text-[12px]">↩</span>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const [activeTab, setActiveTab] = useState("/");
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Replace with your real auth check (e.g. useSession from NextAuth)
  useEffect(() => {
    setUser(null); // start logged out for demo
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleOutside);
      return () => document.removeEventListener("mousedown", handleOutside);
    }
  }, [mobileMenuOpen]);

  function handleLogin() {
    setUser(MOCK_USER); // replace with router.push('/login')
  }

  function handleLogout() {
    setUser(null); // replace with signOut()
  }

  return (
    <>
      <nav
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" }}
        className="fixed top-0 inset-x-0 z-50
                   bg-[rgba(245,245,247,0.75)] backdrop-blur-2xl
                   border-b border-white/50 shadow-sm"
      >
        {/* ── Main row ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-5 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="text-[15px] font-black tracking-tight text-[#1D1D1F] flex-shrink-0">
            LUXURY<span className="text-blue-500">.</span>lk
          </Link>

          {/* iOS segmented pill tabs — desktop */}
          <div className="hidden lg:flex items-center gap-0.5
                          bg-black/[0.04] border border-black/[0.06]
                          rounded-full px-1 py-1">
            {NAV_TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setActiveTab(tab.href)}
                className={`
                  px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200
                  ${activeTab === tab.href
                    ? "bg-white text-[#1D1D1F] shadow-sm shadow-black/10 font-semibold"
                    : "text-[#424245] hover:text-[#1D1D1F]"
                  }
                `}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Right — auth */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    href="/admin/products"
                    className="hidden sm:flex items-center gap-1.5 text-[12px] font-semibold text-blue-600
                               bg-blue-50 hover:bg-blue-100 border border-blue-100
                               px-3.5 py-1.5 rounded-full transition-all duration-150 active:scale-95"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z
                           M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z
                           M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z
                           M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Dashboard
                  </Link>
                )}
                <UserMenu user={user} onLogout={handleLogout} />
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="text-[13px] font-semibold text-[#1D1D1F]
                             hover:text-blue-600 transition-colors hidden sm:block"
                >
                  Sign In
                </button>
                <Link
                  href="/register"
                  className="bg-[#1D1D1F] hover:bg-blue-600 active:scale-95 text-white
                             text-[12px] font-semibold px-5 py-2 rounded-full
                             transition-all duration-150 shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Hamburger menu — mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#1D1D1F] hover:bg-black/5 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile pill tab strip ── */}
        <div className="hidden md:flex lg:hidden px-3 pb-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-0.5 bg-black/[0.04] border border-black/[0.06]
                          rounded-full px-1 py-1 min-w-max">
            {NAV_TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setActiveTab(tab.href)}
                className={`
                  px-3.5 py-1 rounded-full text-[12px] font-medium transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.href
                    ? "bg-white text-[#1D1D1F] shadow-sm font-semibold"
                    : "text-[#6E6E73] hover:text-[#1D1D1F]"
                  }
                `}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed inset-0 top-14 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-white w-full max-w-xs shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile nav tabs */}
            <div className="px-4 py-3 space-y-1 border-b border-gray-100">
              {NAV_TABS.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => {
                    setActiveTab(tab.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    block px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all
                    ${activeTab === tab.href
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-[#1D1D1F] hover:bg-gray-50"
                    }
                  `}
                >
                  {tab.label}
                </Link>
              ))}
            </div>

            {/* Mobile auth section */}
            <div className="px-4 py-3 border-b border-gray-100 space-y-2">
              {user ? (
                <>
                  {user.role === "admin" && (
                    <Link
                      href="/admin/products"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[14px] font-medium
                                 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      ⚙️ Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-[14px] font-medium
                               text-red-600 hover:bg-red-50 transition-colors"
                  >
                    ↩ Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      handleLogin();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 rounded-lg text-[14px] font-semibold
                               text-[#1D1D1F] hover:bg-gray-50 transition-colors"
                  >
                    Sign In
                  </button>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-2.5 rounded-lg text-[14px] font-semibold
                               text-white bg-[#1D1D1F] hover:bg-blue-600 transition-colors text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed navbar */}
      <div className="h-14" />
    </>
  );
}