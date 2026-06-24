"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import CartDrawer from "@/components/CartDrawer";
import { useAuth } from "@/context/AuthContext";

// ─── NAV TABS ─────────────────────────────────────────────────────────────────
const NAV_TABS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/storefront/product" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
];

// ─── CART ICON BUTTON ─────────────────────────────────────────────────────────
function CartButton({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center w-9 h-9
                 bg-white/80 backdrop-blur-xl border border-white/90
                 rounded-full shadow-sm hover:shadow-md
                 transition-all duration-200 active:scale-95 flex-shrink-0"
      aria-label={`Cart, ${count} item${count !== 1 ? "s" : ""}`}
    >
      {/* Cart SVG */}
      <svg
        className="w-[17px] h-[17px] text-[#1D1D1F]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h11"
        />
        <circle cx="9" cy="21" r="1" fill="currentColor" stroke="none" />
        <circle cx="18" cy="21" r="1" fill="currentColor" stroke="none" />
      </svg>

      {/* Badge */}
      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-[3px]
                     bg-blue-500 text-white text-[9px] font-bold
                     rounded-full flex items-center justify-center
                     border-[1.5px] border-white leading-none
                     shadow-sm"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

// ─── USER DROPDOWN ────────────────────────────────────────────────────────────
function UserMenu({
  user,
  onLogout,
}: {
  user: { fullName: string; email: string; role: "admin" | "customer" };
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, []);

  const initials = user.fullName
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
        <span
          className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
                         text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0"
        >
          {initials}
        </span>

        <span className="text-[13px] font-semibold text-[#1D1D1F] hidden sm:block">
          {user.fullName.split(" ")[0]}
        </span>

        <svg
          className={`w-3.5 h-3.5 text-[#86868B] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-64
                        bg-white/90 backdrop-blur-2xl border border-white/80
                        rounded-2xl shadow-2xl shadow-black/10 overflow-hidden z-50"
        >
          {/* User header */}
          <div className="px-4 py-3.5 border-b border-gray-100/80">
            <p className="text-[13px] font-semibold text-[#1D1D1F]">
              {user.fullName}
            </p>

            <p className="text-[11px] text-[#86868B] mt-0.5">
              {user.email}
            </p>

            {user.role === "admin" && (
              <span
                className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-widest
                               text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md"
              >
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
              <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-[12px]">
                👤
              </span>
              My Profile
            </Link>

            <Link
              href="/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#1D1D1F] hover:bg-gray-50 transition-colors"
            >
              <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-[12px]">
                📦
              </span>
              My Orders
            </Link>

            {user.role === "admin" && (
              <Link
                href="/admin/products"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#1D1D1F] hover:bg-gray-50 transition-colors"
              >
                <span className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-[12px]">
                  ⚙️
                </span>

                Dashboard

                <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-blue-500">
                  Admin
                </span>
              </Link>
            )}
          </div>

          {/* Sign Out */}
          <div className="px-2 pb-2 border-t border-gray-100/80 pt-1.5">
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-red-500
                         hover:bg-red-50 rounded-xl transition-colors font-medium"
            >
              <span className="w-6 h-6 bg-red-50 rounded-lg flex items-center justify-center text-[12px]">
                ↩
              </span>
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
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("/");
  const { user, logout, isLoading } = useAuth();

  // ✅ FIXED
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 🛒 Cart count
  const [cartCount, setCartCount] = useState(0);

  // Sync activeTab with current pathname
  useEffect(() => {
    const currentTab = NAV_TABS.find(tab => pathname === tab.href || pathname.startsWith(tab.href + '/'));
    setActiveTab(currentTab?.href || pathname);
  }, [pathname]);

  async function handleLogout() {
    await logout();
  }

  return (
    <>
      <nav
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
        }}
        className="fixed top-0 inset-x-0 z-50
                   bg-white/95 backdrop-blur-sm
                   border-b border-gray-200/50 shadow-sm"
      >
        {/* ── Main row ── */}
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-[15px] font-black tracking-tight text-[#1D1D1F] flex-shrink-0"
          >
            LUXURY<span className="text-blue-500">.</span>lk
          </Link>

          {/* Desktop Tabs */}
          <div
            className="hidden md:flex items-center gap-0.5
                          bg-black/[0.04] border border-black/[0.06]
                          rounded-full px-1 py-1"
          >
            {NAV_TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setActiveTab(tab.href)}
                className={`
                  px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200
                  ${
                    activeTab === tab.href
                      ? "bg-white text-[#1D1D1F] shadow-sm shadow-black/10 font-semibold"
                      : "text-[#424245] hover:text-[#1D1D1F]"
                  }
                `}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Cart */}
            <CartButton
              count={cartCount}
              onClick={() => setIsDrawerOpen(true)}
            />

            {user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    href="/admin/products"
                    className="hidden sm:flex items-center gap-1.5 text-[12px] font-semibold text-blue-600
                               bg-blue-50 hover:bg-blue-100 border border-blue-100
                               px-3.5 py-1.5 rounded-full transition-all duration-150 active:scale-95"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z
                           M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z
                           M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z
                           M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>

                    Dashboard
                  </Link>
                )}

                <UserMenu user={user} onLogout={handleLogout} />
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-[13px] font-semibold text-[#1D1D1F]
                             hover:text-blue-600 transition-colors hidden sm:block"
                >
                  Sign In
                </Link>

                <Link
                  href="/auth/signup"
                  className="bg-[#1D1D1F] hover:bg-blue-600 active:scale-95 text-white
                             text-[12px] font-semibold px-5 py-2 rounded-full
                             transition-all duration-150 shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden px-3 pb-2 overflow-x-auto scrollbar-none">
          <div
            className="flex items-center gap-0.5 bg-black/[0.04] border border-black/[0.06]
                          rounded-full px-1 py-1 min-w-max"
          >
            {NAV_TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setActiveTab(tab.href)}
                className={`
                  px-3.5 py-1 rounded-full text-[12px] font-medium transition-all duration-200 whitespace-nowrap
                  ${
                    activeTab === tab.href
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

      {/* Cart Drawer */}
      {isDrawerOpen && (
        <CartDrawer onClose={() => setIsDrawerOpen(false)} />
      )}
    </>
  );
}