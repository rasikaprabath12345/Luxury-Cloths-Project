"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

// ─── TYPES ────────────────────────────────────────────────────────────────────
const NAV_TABS = [
  { label: "Women", href: "/storefront/shop?category=women" },
  { label: "Men", href: "/storefront/shop?category=men" },
  { label: "Kids", href: "/storefront/shop?category=children" },
  { label: "Home & Living", href: "/storefront/shop?category=home-living" },
  { label: "Gift Cards", href: "/storefront/shop?category=gift-cards" },
  { label: "Offers", href: "/storefront/shop?filter=offers" },
  { label: "New Arrival", href: "/storefront/shop?filter=new" },
];

// ─── GLASS STYLES ─────────────────────────────────────────────────────────────
const glass = {
  pill: {
    background: "rgba(255,255,255,0.72)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "0.5px solid rgba(255,255,255,0.88)",
    borderRadius: "100px",
    boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
  } as React.CSSProperties,
  dropdown: {
    background: "rgba(250,250,252,0.94)",
    backdropFilter: "blur(40px) saturate(200%)",
    WebkitBackdropFilter: "blur(40px) saturate(200%)",
    border: "0.5px solid rgba(255,255,255,0.85)",
    borderRadius: 20,
    boxShadow: "0 8px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
  } as React.CSSProperties,
};

// ─── ICON: SEARCH ─────────────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

// ─── ICON: CART ───────────────────────────────────────────────────────────────
function CartIcon() {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

// ─── ICON: WISHLIST ───────────────────────────────────────────────────────────
function WishlistIcon() {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// ─── ICON: TRACK ──────────────────────────────────────────────────────────────
function TrackIcon() {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// ─── ICON: USER ───────────────────────────────────────────────────────────────
function UserIcon() {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// ─── ICON: HOME ───────────────────────────────────────────────────────────────
function HomeIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

// ─── ICON BUTTON ──────────────────────────────────────────────────────────────
function IconBtn({
  onClick, badge, label, children,
}: {
  onClick?: () => void;
  badge?: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        ...glass.pill,
        width: 38, height: 38, padding: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        border: "none", cursor: "pointer",
        color: "#1C1C1E", position: "relative",
        transition: "transform 0.15s, box-shadow 0.15s",
        gap: 1,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1.06)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 8px rgba(0,0,0,0.07)";
      }}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span style={{
          position: "absolute", top: 1, right: 1,
          minWidth: 16, height: 16, padding: "0 4px",
          background: "#007AFF", color: "#fff",
          fontSize: 9, fontWeight: 800, borderRadius: 100,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1.5px solid rgba(242,242,247,0.9)",
          lineHeight: 1,
        }}>
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

// ─── ICON BUTTON WITH LABEL ───────────────────────────────────────────────────
function IconBtnLabeled({
  onClick, badge, label, icon,
}: {
  onClick?: () => void;
  badge?: number;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 3, background: "none", border: "none",
        cursor: "pointer", padding: "6px 10px",
        borderRadius: 14, position: "relative",
        color: "#3C3C43", transition: "background 0.15s",
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.05)")}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "none")}
    >
      <span style={{ position: "relative", display: "flex" }}>
        {icon}
        {badge !== undefined && badge > 0 && (
          <span style={{
            position: "absolute", top: -5, right: -6,
            minWidth: 16, height: 16, padding: "0 3px",
            background: "#007AFF", color: "#fff",
            fontSize: 9, fontWeight: 800, borderRadius: 100,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1.5px solid rgba(242,242,247,0.9)",
          }}>
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
      <span style={{ fontSize: 10, fontWeight: 500, color: "#3C3C43", whiteSpace: "nowrap" }}>
        {label}
      </span>
    </button>
  );
}

// ─── SEARCH BAR ───────────────────────────────────────────────────────────────
function SearchBar() {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <div style={{
      ...glass.pill,
      display: "flex", alignItems: "center", gap: 8,
      padding: "0 14px", height: 38,
      width: focused ? 280 : 220,
      transition: "width 0.3s ease, box-shadow 0.2s",
      boxShadow: focused
        ? "0 0 0 2px rgba(0,122,255,0.25), 0 2px 16px rgba(0,0,0,0.08)"
        : "0 1px 8px rgba(0,0,0,0.07)",
      flex: "0 0 auto",
    }}>
      <span style={{ color: "#8E8E93", flexShrink: 0, display: "flex" }}>
        <SearchIcon />
      </span>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search products, categories…"
        style={{
          background: "none", border: "none", outline: "none",
          fontSize: 12, color: "#1C1C1E", width: "100%",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
        }}
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          style={{
            background: "rgba(120,120,128,0.18)", border: "none",
            borderRadius: "50%", width: 16, height: 16, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, padding: 0,
          }}>
          <svg width={8} height={8} viewBox="0 0 24 24" fill="none"
            stroke="#6C6C70" strokeWidth={3} strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── USER DROPDOWN ────────────────────────────────────────────────────────────
function UserMenu({
  user, onLogout,
}: {
  user: { fullName: string; email: string; role: "admin" | "customer" };
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const initials = user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 3,
          background: "none", border: "none", cursor: "pointer",
          padding: "4px 8px", borderRadius: 12,
          transition: "background 0.15s",
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.05)")}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "none")}
      >
        <span style={{
          width: 24, height: 24, borderRadius: "50%",
          background: "linear-gradient(135deg, #007AFF, #5856D6)",
          color: "#fff", fontSize: 9, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{initials}</span>
        <span style={{ fontSize: 10, fontWeight: 500, color: "#3C3C43" }}>
          {user.fullName.split(" ")[0]}
        </span>
      </button>

      {open && (
        <div style={{
          ...glass.dropdown,
          position: "absolute", right: 0, top: "calc(100% + 8px)",
          width: 240, zIndex: 100, overflow: "hidden",
        }}>
          <div style={{ padding: "14px 16px", borderBottom: "0.5px solid rgba(0,0,0,0.07)" }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>{user.fullName}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#8E8E93" }}>{user.email}</p>
            {user.role === "admin" && (
              <span style={{
                display: "inline-block", marginTop: 6,
                fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase" as const, color: "#007AFF",
                background: "rgba(0,122,255,0.08)", border: "0.5px solid rgba(0,122,255,0.2)",
                padding: "2px 8px", borderRadius: 6,
              }}>Admin</span>
            )}
          </div>
          <div style={{ padding: "6px 0" }}>
            {[
              { href: "/profile", icon: "👤", label: "My Profile" },
              { href: "/orders", icon: "📦", label: "My Orders" },
              ...(user.role === "admin"
                ? [{ href: "/admin/dashboard", icon: "⚙️", label: "Dashboard" }]
                : []),
            ].map(item => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 16px", fontSize: 13, color: "#1C1C1E",
                  textDecoration: "none", transition: "background 0.12s",
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.04)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                <span style={{
                  width: 26, height: 26, background: "rgba(120,120,128,0.1)",
                  borderRadius: 8, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 13,
                }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
          <div style={{ padding: "6px 8px 8px", borderTop: "0.5px solid rgba(0,0,0,0.06)" }}>
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", background: "none", border: "none",
                cursor: "pointer", fontSize: 13, color: "#FF3B30", borderRadius: 12,
                transition: "background 0.12s",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,59,48,0.06)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "none")}>
              <span style={{
                width: 26, height: 26, background: "rgba(255,59,48,0.08)",
                borderRadius: 8, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 12,
              }}>↩</span>
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
  const { user, logout, isLoading } = useAuth();
  const { wishlistItems } = useWishlist();
  const { cartItems } = useCart();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);
  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const wishlistCount = wishlistItems.length;
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("/");

  useEffect(() => {
    const current = NAV_TABS.find(
      t => pathname === t.href || pathname.startsWith(t.href + "/")
    );
    setActiveTab(current?.href || pathname);
  }, [pathname]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <nav
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif",
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          background: scrolled
            ? "rgba(248,248,252,0.92)"
            : "rgba(248,248,252,0.82)",
          backdropFilter: "blur(40px) saturate(200%)",
          WebkitBackdropFilter: "blur(40px) saturate(200%)",
          borderBottom: "0.5px solid rgba(0,0,0,0.08)",
          boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.06)" : "none",
          transition: "background 0.3s, box-shadow 0.3s",
        }}
      >
        {/* ── TOP ROW: Logo | Search | Icons ── */}
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          padding: "0 28px", height: 58,
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 20,
        }}>

          {/* ── LOGO ── */}
          <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span style={{
                fontSize: 18, fontWeight: 900, letterSpacing: "-0.03em",
                color: "#1C1C1E",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
              }}>
                LUXURY
                <span style={{
                  color: "#007AFF",
                  fontStyle: "italic",
                }}>.</span>
                <span style={{ color: "#1C1C1E" }}>lk</span>
              </span>
              <span style={{
                fontSize: 9, fontWeight: 600, letterSpacing: "0.18em",
                textTransform: "uppercase" as const, color: "#8E8E93",
                marginTop: 1,
              }}>
                Premium Fashion
              </span>
            </div>
          </Link>

          {/* ── SEARCH ── */}
          <div style={{ flex: 1, maxWidth: 480, display: "flex", justifyContent: "center" }}>
            <SearchBar />
          </div>

          {/* ── RIGHT ICONS ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <IconBtnLabeled
              label="Track Order"
              icon={<TrackIcon />}
            />
            <IconBtnLabeled
              label="Wishlist"
              badge={wishlistCount}
              onClick={() => setIsWishlistDrawerOpen(true)}
              icon={<WishlistIcon />}
            />
            <IconBtnLabeled
              label="Cart"
              badge={cartCount}
              onClick={() => setIsDrawerOpen(true)}
              icon={<CartIcon />}
            />

            {!isLoading && (
              user ? (
                <UserMenu user={user} onLogout={logout} />
              ) : (
                <IconBtnLabeled
                  label="Login / Register"
                  icon={<UserIcon />}
                  onClick={() => {
                    window.location.href = "/auth/login";
                  }}
                />
              )
            )}
          </div>
        </div>

        {/* ── BOTTOM ROW: Category Tabs ── */}
        <div style={{
          borderTop: "0.5px solid rgba(0,0,0,0.06)",
          background: "rgba(255,255,255,0.50)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}>
          <div style={{
            maxWidth: 1280, margin: "0 auto",
            padding: "0 28px",
            display: "flex", alignItems: "center",
            gap: 2, height: 40,
            overflowX: "auto",
          }}>
            <Link
              href="/"
              onClick={() => setActiveTab("/")}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "6px 12px", borderRadius: 100,
                color: activeTab === "/" ? "#fff" : "#3C3C43",
                background: activeTab === "/" 
                  ? "linear-gradient(135deg, #007AFF, #5856D6)" 
                  : "transparent",
                boxShadow: activeTab === "/" 
                  ? "0 2px 10px rgba(0,122,255,0.28)" 
                  : "none",
                transition: "all 0.18s ease",
              }}
              onMouseEnter={e => {
                if (activeTab !== "/") (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.05)";
              }}
              onMouseLeave={e => {
                if (activeTab !== "/") (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
              aria-label="Home"
            >
              <HomeIcon />
            </Link>
            {NAV_TABS.map(tab => {
              const isActive = activeTab === tab.href;
              const isNew = tab.label === "New Arrival";
              const isOffer = tab.label === "Offers";
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setActiveTab(tab.href)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "5px 14px", borderRadius: 100,
                    fontSize: 12.5, fontWeight: isActive ? 600 : 500,
                    whiteSpace: "nowrap" as const, textDecoration: "none",
                    transition: "all 0.18s ease",
                    color: isActive
                      ? "#fff"
                      : isOffer
                        ? "#FF3B30"
                        : "#3C3C43",
                    background: isActive
                      ? "linear-gradient(135deg, #007AFF, #5856D6)"
                      : "transparent",
                    boxShadow: isActive
                      ? "0 2px 10px rgba(0,122,255,0.28)"
                      : "none",
                    letterSpacing: "-0.01em",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.05)";
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  {tab.label}
                  {isNew && (
                    <span style={{
                      fontSize: 8, fontWeight: 800, letterSpacing: "0.06em",
                      textTransform: "uppercase" as const,
                      background: "linear-gradient(135deg, #FF9500, #FF6B00)",
                      color: "#fff", padding: "1px 5px", borderRadius: 4,
                    }}>NEW</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Spacer for fixed nav (top 58 + bottom 40 = 98px) */}
      <div style={{ height: 98 }} />

      {isDrawerOpen && (
        <CartDrawer onClose={() => setIsDrawerOpen(false)} />
      )}
      {isWishlistDrawerOpen && (
        <WishlistDrawer onClose={() => setIsWishlistDrawerOpen(false)} />
      )}
    </>
  );
}