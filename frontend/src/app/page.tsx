"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Link from "next/link";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  image?: string;
  description?: string;
}

interface User {
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "customer";
}

// ─── MOCK AUTH (replace with your real auth logic) ────────────────────────────
// Swap this with your actual session/JWT/NextAuth logic
const MOCK_USER: User = {
  name: "Ashan Silva",
  email: "ashan@luxurycloth.lk",
  role: "admin",
};

// ─── SKELETON ─────────────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden bg-white/60 backdrop-blur-xl border border-white/80 shadow-sm p-4 space-y-4 animate-pulse flex flex-col h-[440px]">
      <div className="h-64 bg-gray-100 rounded-2xl w-full" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-200 rounded-full w-2/3" />
        <div className="h-3 bg-gray-100 rounded-full w-full" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="h-5 bg-gray-200 rounded-full w-1/3" />
        <div className="h-9 bg-gray-200 rounded-2xl w-1/3" />
      </div>
    </div>
  );
}

// ─── USER AVATAR DROPDOWN ─────────────────────────────────────────────────────
function UserMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 bg-white/80 backdrop-blur-xl border border-white/90
                   rounded-full pl-1 pr-3.5 py-1 shadow-sm hover:shadow-md transition-all duration-200
                   active:scale-95"
      >
        {/* Avatar circle */}
        <span
          className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
                      text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0"
        >
          {initials}
        </span>
        <span className="text-[13px] font-semibold text-[#1D1D1F] hidden sm:block">{user.name.split(" ")[0]}</span>
        <svg
          className={`w-3.5 h-3.5 text-[#86868B] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-64
                      bg-white/90 backdrop-blur-2xl border border-white/80
                      rounded-2xl shadow-2xl shadow-black/10 overflow-hidden z-50
                      animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* User info header */}
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

          {/* Menu items */}
          <div className="py-1.5">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#1D1D1F]
                         hover:bg-gray-50 transition-colors"
            >
              <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-[12px]">👤</span>
              My Profile
            </Link>
            <Link
              href="/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#1D1D1F]
                         hover:bg-gray-50 transition-colors"
            >
              <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-[12px]">📦</span>
              My Orders
            </Link>
            {user.role === "admin" && (
              <Link
                href="/admin/products"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#1D1D1F]
                           hover:bg-gray-50 transition-colors"
              >
                <span className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-[12px]">⚙️</span>
                Dashboard
                <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-blue-500">Admin</span>
              </Link>
            )}
          </div>

          {/* Logout */}
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

// ─── NAV TABS ─────────────────────────────────────────────────────────────────
const NAV_TABS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/storefront/product" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
];

// ─── DATA ─────────────────────────────────────────────────────────────────────
const categories = [
  {
    name: "Menswear",
    sub: "For Him",
    count: "120+ Items",
    image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Womenswear",
    sub: "For Her",
    count: "85+ Items",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Accessories",
    sub: "Finish the Look",
    count: "40+ Items",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop",
  },
];

const trust = [
  { icon: "✦", label: "Islandwide Delivery", sub: "2–4 business days to your door" },
  { icon: "◈", label: "Secure Payments", sub: "100% encrypted checkout" },
  { icon: "⟳", label: "7-Day Returns", sub: "Hassle-free exchanges" },
  { icon: "◇", label: "Premium Quality", sub: "Finest Ceylon fabrics" },
];

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null); // null = logged out
  const [activeTab, setActiveTab] = useState("/");
  const heroRef = useRef<HTMLDivElement>(null);

  // Simulate checking auth on mount — replace with real session check
  useEffect(() => {
    // e.g. const session = await getSession(); setUser(session?.user ?? null);
    // For demo, we start logged out:
    setUser(null);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5226/api/Products");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Parallax hero
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const img = heroRef.current.querySelector<HTMLElement>(".hero-img");
        if (img) img.style.transform = `scale(1.08) translateY(${window.scrollY * 0.16}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleLogout() {
    setUser(null);
    // call your real signOut() here
  }

  // Demo login toggle (remove in production)
  function handleDemoLogin() {
    setUser(MOCK_USER);
  }

  return (
    <div
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" }}
      className="bg-[#F5F5F7] text-[#1D1D1F] min-h-screen antialiased"
    >

      {/* ── NAV ──────────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 inset-x-0 z-50
                   bg-[rgba(245,245,247,0.75)] backdrop-blur-2xl
                   border-b border-white/50 shadow-sm"
      >
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="text-[15px] font-black tracking-tight text-[#1D1D1F] flex-shrink-0">
            LUXURY<span className="text-blue-500">.</span>lk
          </Link>

          {/* ── iOS pill tab bar (desktop) ── */}
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
                  relative px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200
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

          {/* Right side — auth */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {user ? (
              <>
                {/* Dashboard shortcut (only for admins, visible at a glance) */}
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
                {/* Sign In */}
                <button
                  onClick={handleDemoLogin}   // ← replace with router.push('/login')
                  className="text-[13px] font-semibold text-[#1D1D1F]
                             hover:text-blue-600 transition-colors hidden sm:block"
                >
                  Sign In
                </button>
                {/* Sign Up */}
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
          </div>

        </div>

        {/* Mobile tab strip */}
        <div className="md:hidden flex items-center gap-0.5 px-3 pb-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-0.5 bg-black/[0.04] border border-black/[0.06] rounded-full px-1 py-1 min-w-max">
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

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden bg-black pt-14"
      >
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1800&auto=format&fit=crop"
          alt="Hero"
          className="hero-img absolute inset-0 w-full h-full object-cover scale-[1.08] origin-center will-change-transform"
          style={{ opacity: 0.42 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/75" />

        <div className="relative z-10 text-center max-w-4xl px-6 flex flex-col items-center gap-5">
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-blue-400
                           bg-blue-500/10 border border-blue-500/25 px-4 py-1.5 rounded-full backdrop-blur-md">
            Summer Collection — 2026
          </span>
          <h1 className="text-5xl md:text-[82px] font-black leading-[0.93] tracking-tighter text-white">
            Define Your<br />
            <span className="text-transparent" style={{ WebkitTextStroke: "2px rgba(255,255,255,0.85)" }}>
              Luxury.
            </span>
          </h1>
          <p className="text-gray-300 text-base md:text-lg max-w-lg leading-relaxed font-light">
            Comfort and modern style — all in one place.<br />
            <span className="text-gray-400 text-sm">Sri Lanka's finest premium fashion, delivered.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full sm:w-auto">
            <Link
              href="/storefront/product"
              className="bg-white text-black font-semibold text-sm px-8 py-4 rounded-2xl
                         hover:bg-gray-100 active:scale-95 transition-all duration-150
                         shadow-xl shadow-black/25 text-center"
            >
              Shop Collection
            </Link>
            {!user && (
              <button
                onClick={handleDemoLogin}
                className="bg-white/10 hover:bg-white/20 border border-white/25 text-white
                           font-semibold text-sm px-8 py-4 rounded-2xl backdrop-blur-md transition text-center"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        <div className="absolute bottom-8 inset-x-0 flex justify-center">
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/60 to-transparent" />
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {trust.map((t, i) => (
            <div key={i}
              className="bg-white/70 backdrop-blur-xl border border-white/90 rounded-3xl px-6 py-5
                         shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-1.5">
              <span className="text-blue-500 text-xl font-light">{t.icon}</span>
              <p className="text-[13px] font-semibold text-[#1D1D1F]">{t.label}</p>
              <p className="text-[11px] text-[#86868B] leading-snug">{t.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <p className="text-blue-600 text-[11px] font-bold uppercase tracking-[0.18em] mb-1">Browse</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            Shop by Category
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <div key={i}
              className="group relative h-72 rounded-3xl overflow-hidden cursor-pointer
                         ring-1 ring-black/5 hover:ring-2 hover:ring-blue-500/30 transition-all duration-300">
              <img
                src={cat.image} alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4
                              bg-white/10 backdrop-blur-xl border border-white/20
                              rounded-2xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-[11px] font-medium opacity-70">{cat.sub}</p>
                  <p className="text-white font-bold text-sm">{cat.name}</p>
                </div>
                <span className="text-white/60 text-[11px] font-medium">{cat.count}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRODUCTS ─────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-blue-600 text-[11px] font-bold uppercase tracking-[0.18em] mb-1">Top Picks</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Trending Right Now
            </h2>
          </div>
          <Link href="/storefront/product"
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm
                       flex items-center gap-1.5 transition whitespace-nowrap pb-1">
            View all <span className="text-lg leading-none">›</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => <ProductSkeleton key={n} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-[#86868B] py-20 text-sm font-medium
                          bg-white/60 rounded-3xl border border-white/80">
            No products available yet. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <div key={product.id}
                className="group bg-white/70 backdrop-blur-xl border border-white/90
                           rounded-3xl overflow-hidden shadow-sm hover:shadow-xl
                           hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-[440px]">
                <div className="relative h-64 bg-gray-50 overflow-hidden flex-shrink-0">
                  <img
                    src={product.imageUrl || product.image || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white
                                   text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg">
                    New
                  </span>
                </div>
                <div className="flex flex-col justify-between flex-1 p-4">
                  <div className="space-y-0.5">
                    <h3 className="font-semibold text-[13px] text-[#1D1D1F] line-clamp-1 group-hover:text-blue-600 transition">
                      {product.name}
                    </h3>
                    <p className="text-[#86868B] text-[11px] line-clamp-1">
                      {product.description || "Premium luxury clothing — crafted for quality."}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-[15px] font-bold text-[#1D1D1F]">
                      LKR {product.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                    <button className="bg-[#1D1D1F] hover:bg-blue-600 active:scale-95 text-white
                                       text-[11px] font-semibold px-4 py-2 rounded-xl
                                       transition-all duration-150 whitespace-nowrap">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-8 mb-12">
        <div className="relative overflow-hidden rounded-[2.5rem] px-8 md:px-16 py-14 text-center
                        bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white
                        shadow-2xl shadow-blue-600/30">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <p className="text-blue-200 text-[11px] font-bold uppercase tracking-[0.2em] mb-2">Exclusive Offer</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Get 10% Off</h2>
          <p className="text-blue-200 text-sm font-light max-w-sm mx-auto mb-8 leading-relaxed">
            New arrivals and exclusive deals — straight to your inbox. Unsubscribe anytime, no spam.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-5 py-3.5 rounded-2xl text-[#1D1D1F] text-sm placeholder:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/95 shadow-inner"
            />
            <button className="bg-black hover:bg-zinc-800 active:scale-95 text-white font-semibold text-sm
                               px-7 py-3.5 rounded-2xl transition-all duration-150 shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="bg-[#1D1D1F] text-[#6E6E73] text-sm">
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-3">
            <h3 className="text-white text-lg font-black tracking-tight">
              LUXURY<span className="text-blue-500">.</span>lk
            </h3>
            <p className="text-xs text-[#6E6E73] leading-relaxed max-w-[200px]">
              Sri Lanka's premiere fashion destination. Quality first, always.
            </p>
          </div>
          {[
            { title: "Shop", links: [{ label: "All Products", href: "/storefront/product" }, { label: "Menswear", href: "#" }, { label: "Womenswear", href: "#" }, { label: "Accessories", href: "#" }] },
            { title: "Company", links: [{ label: "About Us", href: "/about" }, { label: "Contact", href: "#" }, { label: "Careers", href: "#" }] },
            { title: "Support", links: [{ label: "FAQs", href: "#" }, { label: "Shipping Info", href: "#" }, { label: "Returns & Exchanges", href: "#" }] },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500 mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((l, j) => (
                  <li key={j}><Link href={l.href} className="text-xs hover:text-white transition">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[11px] text-[#424245]">© 2026 Luxury Cloths Pvt Ltd. All rights reserved.</p>
            <p className="text-[11px] text-[#424245]">Made in Sri Lanka · Built with Next.js</p>
          </div>
        </div>
      </footer>

    </div>
  );
}