"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { showStorefrontToast } from "@/utils/toast";

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

// ─── MEGA MENU DATA ───────────────────────────────────────────────────────────
const MEGA_MENUS: Record<string, { image: string; columns: { title: string; items: { label: string; href: string }[] }[] }> = {
  Women: {
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&q=80&auto=format&fit=crop",
    columns: [
      {
        title: "Women's Wear",
        items: [
          { label: "Tops & Blouses", href: "/storefront/shop?category=women&sub=tops" },
          { label: "Dresses", href: "/storefront/shop?category=women&sub=dresses" },
          { label: "Sarees & Lehengas", href: "/storefront/shop?category=women&sub=sarees" },
          { label: "Kurtis & Tunics", href: "/storefront/shop?category=women&sub=kurtis" },
          { label: "Trousers & Pants", href: "/storefront/shop?category=women&sub=trousers" },
          { label: "Skirts", href: "/storefront/shop?category=women&sub=skirts" },
          { label: "Casual Wear", href: "/storefront/shop?category=women&sub=casual" },
          { label: "Formal Wear", href: "/storefront/shop?category=women&sub=formal" },
        ],
      },
      {
        title: "Footwear",
        items: [
          { label: "Heels & Pumps", href: "/storefront/shop?category=women&sub=heels" },
          { label: "Flats & Sandals", href: "/storefront/shop?category=women&sub=sandals" },
          { label: "Sneakers", href: "/storefront/shop?category=women&sub=sneakers" },
        ],
      },
      {
        title: "Accessories",
        items: [
          { label: "Bags & Clutches", href: "/storefront/shop?category=women&sub=bags" },
          { label: "Jewellery", href: "/storefront/shop?category=women&sub=jewellery" },
          { label: "Scarves & Shawls", href: "/storefront/shop?category=women&sub=scarves" },
          { label: "Sunglasses", href: "/storefront/shop?category=women&sub=sunglasses" },
        ],
      },
    ],
  },
  Men: {
    image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=300&q=80&auto=format&fit=crop",
    columns: [
      {
        title: "Men's Wear",
        items: [
          { label: "T-Shirts", href: "/storefront/shop?category=men&sub=tshirts" },
          { label: "Casual Shirts", href: "/storefront/shop?category=men&sub=casual-shirts" },
          { label: "Formal Shirts", href: "/storefront/shop?category=men&sub=formal-shirts" },
          { label: "Jackets", href: "/storefront/shop?category=men&sub=jackets" },
          { label: "Jeans", href: "/storefront/shop?category=men&sub=jeans" },
          { label: "Casual Trousers", href: "/storefront/shop?category=men&sub=trousers" },
          { label: "Formal Trousers", href: "/storefront/shop?category=men&sub=formal-trousers" },
          { label: "Shorts", href: "/storefront/shop?category=men&sub=shorts" },
          { label: "Track Pants & Joggers", href: "/storefront/shop?category=men&sub=joggers" },
          { label: "Sarong", href: "/storefront/shop?category=men&sub=sarong" },
        ],
      },
      {
        title: "Footwear",
        items: [
          { label: "Formal Shoes", href: "/storefront/shop?category=men&sub=formal-shoes" },
          { label: "Sandals & Floaters", href: "/storefront/shop?category=men&sub=sandals" },
          { label: "Flip Flops", href: "/storefront/shop?category=men&sub=flip-flops" },
          { label: "Socks", href: "/storefront/shop?category=men&sub=socks" },
        ],
      },
      {
        title: "Fashion Accessories",
        items: [
          { label: "Belts", href: "/storefront/shop?category=men&sub=belts" },
          { label: "Caps & Hats", href: "/storefront/shop?category=men&sub=caps" },
          { label: "Sunglasses & Frames", href: "/storefront/shop?category=men&sub=sunglasses" },
        ],
      },
      {
        title: "Bags & Backpacks",
        items: [
          { label: "Backpacks", href: "/storefront/shop?category=men&sub=backpacks" },
          { label: "Messenger Bags", href: "/storefront/shop?category=men&sub=messenger" },
          { label: "Laptop Bags", href: "/storefront/shop?category=men&sub=laptop-bags" },
        ],
      },
    ],
  },
  Kids: {
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=300&q=80&auto=format&fit=crop",
    columns: [
      {
        title: "Boys",
        items: [
          { label: "T-Shirts & Tops", href: "/storefront/shop?category=children&sub=boys-tops" },
          { label: "Shirts", href: "/storefront/shop?category=children&sub=boys-shirts" },
          { label: "Trousers & Jeans", href: "/storefront/shop?category=children&sub=boys-trousers" },
          { label: "Shorts", href: "/storefront/shop?category=children&sub=boys-shorts" },
          { label: "Sportswear", href: "/storefront/shop?category=children&sub=boys-sports" },
          { label: "School Uniforms", href: "/storefront/shop?category=children&sub=boys-uniforms" },
        ],
      },
      {
        title: "Girls",
        items: [
          { label: "Dresses & Frocks", href: "/storefront/shop?category=children&sub=girls-dresses" },
          { label: "Tops & Blouses", href: "/storefront/shop?category=children&sub=girls-tops" },
          { label: "Leggings & Pants", href: "/storefront/shop?category=children&sub=girls-pants" },
          { label: "Skirts", href: "/storefront/shop?category=children&sub=girls-skirts" },
          { label: "School Uniforms", href: "/storefront/shop?category=children&sub=girls-uniforms" },
        ],
      },
      {
        title: "Footwear & Acc.",
        items: [
          { label: "Shoes & Sneakers", href: "/storefront/shop?category=children&sub=shoes" },
          { label: "Sandals", href: "/storefront/shop?category=children&sub=sandals" },
          { label: "Bags & Backpacks", href: "/storefront/shop?category=children&sub=bags" },
          { label: "Accessories", href: "/storefront/shop?category=children&sub=accessories" },
        ],
      },
    ],
  },
};

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
      suppressHydrationWarning
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
          background: "#aa841c", color: "#fff",
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
      suppressHydrationWarning
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
            background: "#aa841c", color: "#fff",
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
function SearchBar({ onLinkClick }: { onLinkClick?: () => void }) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholders = ["dresses…", "linen shirts…", "silk sarees…", "designer shoes…"];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem("luxury_search_history");
    if (history) {
      try {
        setRecentSearches(JSON.parse(history));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    if (focused) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [focused]);

  // Global keydown listener for '/' and 'Ctrl+K' / 'Cmd+K' shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.hasAttribute("contenteditable"))
      ) {
        return;
      }

      if (e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key === "k")) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const saveSearchToHistory = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const nextHistory = [
      trimmed,
      ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase()),
    ].slice(0, 5); // Keep last 5 searches
    setRecentSearches(nextHistory);
    localStorage.setItem("luxury_search_history", JSON.stringify(nextHistory));
  };

  const removeSearchFromHistory = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const nextHistory = recentSearches.filter((s) => s !== term);
    setRecentSearches(nextHistory);
    localStorage.setItem("luxury_search_history", JSON.stringify(nextHistory));
  };

  const handleSearchSubmit = (term: string) => {
    if (!term.trim()) return;
    saveSearchToHistory(term);
    window.location.href = `/storefront/shop?search=${encodeURIComponent(term)}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit(query);
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "0 4px 0 16px",
        height: 42,
        width: "100%",
        maxWidth: 540,
        borderRadius: "100px",
        background: "#ffffff",
        border: focused
          ? "1px solid #aa841c"
          : hovered
            ? "1px solid #1C1C1E"
            : "1px solid rgba(0, 0, 0, 0.12)",
        boxShadow: focused
          ? "0 8px 24px rgba(170, 132, 28, 0.08), 0 2px 6px rgba(0, 0, 0, 0.02)"
          : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
        flex: "0 0 auto",
        position: "relative",
      }}
    >
      <input
        suppressHydrationWarning
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder={focused ? "Search products, categories…" : `Search ${placeholders[placeholderIndex]}`}
        style={{
          background: "none",
          border: "none",
          outline: "none",
          fontSize: 12.5,
          fontWeight: 400,
          color: "#1C1C1E",
          width: "100%",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
        }}
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          style={{
            background: "rgba(120, 120, 128, 0.12)",
            border: "none",
            borderRadius: "50%",
            width: 18,
            height: 18,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            padding: 0,
            transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(120, 120, 128, 0.24)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(120, 120, 128, 0.12)")}
        >
          <svg width={8} height={8} viewBox="0 0 24 24" fill="none"
            stroke="#6C6C70" strokeWidth={3} strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Keyboard Shortcut Badge */}
      {!focused && !query && (
        <span style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0, 0, 0, 0.04)",
          color: "#8E8E93",
          fontSize: 10,
          fontWeight: 600,
          padding: "2px 6px",
          borderRadius: "5px",
          border: "0.5px solid rgba(0, 0, 0, 0.06)",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          pointerEvents: "none",
          flexShrink: 0,
          marginRight: 2,
        }}>
          /
        </span>
      )}

      {/* Search Submission Button */}
      <button
        suppressHydrationWarning
        onClick={() => handleSearchSubmit(query)}
        style={{
          background: "#1C1C1E",
          color: "#ffffff",
          border: "none",
          borderRadius: "50%",
          width: 34,
          height: 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "background 0.2s ease, transform 0.1s ease",
          flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#aa841c"}
        onMouseLeave={e => e.currentTarget.style.background = "#1C1C1E"}
      >
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
          stroke="#ffffff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>

      {/* Quick Suggestions & History Dropdown on Focus */}
      {focused && (
        <div
          style={{
            position: "absolute",
            top: 46,
            right: 0,
            width: 320,
            background: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(30px) saturate(190%)",
            WebkitBackdropFilter: "blur(30px) saturate(190%)",
            border: "1px solid rgba(170, 132, 28, 0.18)",
            borderRadius: 20,
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0,0,0,0.02)",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            animation: "searchDropdownOpen 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            zIndex: 1000,
          }}
          onMouseDown={e => e.preventDefault()} // Prevents loss of focus (blur) when clicking items
        >
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "0 0 8px 0",
              }}>
                <p style={{
                  margin: 0,
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#8E8E93",
                }}>Recent Searches</p>
                <button
                  suppressHydrationWarning
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem("luxury_search_history");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#aa841c",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >Clear All</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    onClick={() => handleSearchSubmit(term)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 8px",
                      borderRadius: 8,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(170, 132, 28, 0.05)";
                      const termSpan = e.currentTarget.querySelector(".search-term");
                      if (termSpan) (termSpan as HTMLElement).style.color = "#aa841c";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "none";
                      const termSpan = e.currentTarget.querySelector(".search-term");
                      if (termSpan) (termSpan as HTMLElement).style.color = "#3C3C43";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth={2.5} style={{ opacity: 0.8 }}>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span className="search-term" style={{
                        fontSize: 12.5,
                        color: "#3C3C43",
                        fontWeight: 500,
                        transition: "color 0.15s",
                      }}>{term}</span>
                    </div>
                    <button
                      suppressHydrationWarning
                      onClick={(e) => removeSearchFromHistory(term, e)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth={3}>
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, margin: "0 0 8px 0" }}>
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#aa841c" strokeWidth={3}>
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
              <p style={{
                margin: 0,
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#8E8E93",
                textAlign: "left"
              }}>Trending Searches</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {["Summer Dresses", "Linen Shirts", "Premium Sarees", "Designer Footwear"].map((term) => (
                <button
                  suppressHydrationWarning
                  key={term}
                  onClick={() => handleSearchSubmit(term)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "none",
                    border: "none",
                    padding: "6px 8px",
                    borderRadius: 8,
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: 12.5,
                    color: "#3C3C43",
                    width: "100%",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(170, 132, 28, 0.05)";
                    e.currentTarget.style.color = "#aa841c";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "none";
                    e.currentTarget.style.color = "#3C3C43";
                  }}
                >
                  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ opacity: 0.6 }}>
                    <line x1="19" y1="5" x2="5" y2="19" strokeLinecap="round" />
                    <polyline points="19 15 19 5 9 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Shop by Category */}
          <div style={{ borderTop: "0.5px solid rgba(0,0,0,0.06)", paddingTop: 10 }}>
            <p style={{
              margin: "0 0 8px 0",
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#8E8E93",
              textAlign: "left"
            }}>Shop by Category</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-start" }}>
              {[
                { label: "Women", href: "/storefront/shop?category=women" },
                { label: "Men", href: "/storefront/shop?category=men" },
                { label: "New Arrival", href: "/storefront/shop?filter=new" }
              ].map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  onClick={onLinkClick}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textDecoration: "none",
                    color: "#aa841c",
                    background: "rgba(170, 132, 28, 0.08)",
                    border: "0.5px solid rgba(170, 132, 28, 0.2)",
                    padding: "5px 12px",
                    borderRadius: 100,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "#aa841c";
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(170, 132, 28, 0.08)";
                    e.currentTarget.style.color = "#aa841c";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── USER DROPDOWN ────────────────────────────────────────────────────────────
function UserMenu({
  user, onLogout,
}: {
  user: { fullName: string; email: string; role: "admin" | "customer"; avatar?: string };
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
        suppressHydrationWarning
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
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.fullName}
            style={{
              width: 24, height: 24, borderRadius: "50%",
              objectFit: "cover",
              border: "1px solid rgba(170, 132, 28, 0.3)",
            }}
          />
        ) : (
          <span style={{
            width: 24, height: 24, borderRadius: "50%",
            background: "linear-gradient(135deg, #aa841c, #d4af37)",
            color: "#fff", fontSize: 9, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{initials}</span>
        )}
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
                textTransform: "uppercase" as const, color: "#aa841c",
                background: "rgba(170,132,28,0.08)", border: "0.5px solid rgba(170,132,28,0.2)",
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
              suppressHydrationWarning
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

function MegaMenu({ label, data, onLinkClick }: { label: string; data: typeof MEGA_MENUS[string]; onLinkClick?: () => void }) {
  return (
    <div style={{
      position: "relative",
      ...glass.dropdown,
      width: data.columns.length >= 4 ? 620 : data.columns.length === 3 ? 480 : 360,
      zIndex: 200, overflow: "hidden",
    }}>
      {/* Header row with title + View All */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px 12px",
        borderBottom: "0.5px solid rgba(0,0,0,0.06)",
      }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#1C1C1E", letterSpacing: "-0.01em" }}>
          Shop {label}
        </p>
        <Link href={`/storefront/shop?category=${label.toLowerCase() === "kids" ? "children" : label.toLowerCase()}`}
          onClick={onLinkClick}
          style={{
            fontSize: 11, fontWeight: 700, color: "#aa841c",
            textDecoration: "none", letterSpacing: "0.04em",
            display: "flex", alignItems: "center", gap: 4,
          }}>
          View All →
        </Link>
      </div>

      {/* Category columns */}
      <div style={{
        display: "flex", gap: 0,
        padding: "16px 20px 20px",
      }}>
        {data.columns.map((col, i) => (
          <div key={i} style={{
            flex: 1,
            paddingRight: 16,
            borderRight: i < data.columns.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none",
            paddingLeft: i > 0 ? 16 : 0,
          }}>
            <p style={{
              margin: "0 0 8px", fontSize: 10, fontWeight: 700,
              color: "#aa841c", textTransform: "uppercase", letterSpacing: "0.1em"
            }}>{col.title}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {col.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onLinkClick}
                  style={{
                    fontSize: 12.5, color: "#3C3C43", textDecoration: "none",
                    padding: "5px 8px", borderRadius: 8,
                    transition: "all 0.15s ease",
                    display: "block",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(170,132,28,0.06)";
                    (e.currentTarget as HTMLElement).style.color = "#aa841c";
                    (e.currentTarget as HTMLElement).style.paddingLeft = "12px";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#3C3C43";
                    (e.currentTarget as HTMLElement).style.paddingLeft = "8px";
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
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
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const megaMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const promoMessages = [
    <>Sign up and get <span style={{ color: "#d4af37", fontWeight: 700 }}>10% off</span> on your first order</>,
    <>Free delivery on orders over <span style={{ color: "#d4af37", fontWeight: 700 }}>Rs. 5,000</span></>,
    <>Discover the premium <span style={{ color: "#d4af37", fontWeight: 700 }}>Summer Collection — 2026</span></>
  ];
  const [promoIndex, setPromoIndex] = useState(0);
  const autoplayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    autoplayTimerRef.current = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % promoMessages.length);
    }, 5000);
  }, [promoMessages.length, stopAutoplay]);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  const handleNextPromo = () => {
    setPromoIndex((prev) => (prev + 1) % promoMessages.length);
    startAutoplay();
  };

  const handlePrevPromo = () => {
    setPromoIndex((prev) => (prev - 1 + promoMessages.length) % promoMessages.length);
    startAutoplay();
  };

  useEffect(() => {
    const current = NAV_TABS.find(
      t => pathname === t.href || pathname.startsWith(t.href + "/")
    );
    setActiveTab(current?.href || pathname);
    setIsDrawerOpen(false);
    setIsWishlistDrawerOpen(false);
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
          overflow: "visible",
        }}
      >
        {/* Promo strip */}
        <div 
          className="promo-strip"
          style={{
            height: 34,
            borderBottom: "1px solid rgba(212, 175, 55, 0.25)",
            background: "linear-gradient(90deg, #151516 0%, #1e1c19 35%, #352f26 50%, #1e1c19 65%, #151516 100%)",
            color: "#f3e5c8",
            fontSize: 11,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 48px",
            width: "100%",
            overflow: "hidden",
            letterSpacing: "0.08em",
            position: "relative",
          }}
        >
          {/* Left Arrow */}
          <button
            suppressHydrationWarning
            onClick={handlePrevPromo}
            style={{
              position: "absolute",
              left: 16,
              background: "none",
              border: "none",
              color: "rgba(243, 229, 200, 0.45)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 4,
              transition: "color 0.25s, transform 0.25s",
              zIndex: 10,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "#d4af37";
              e.currentTarget.style.transform = "scale(1.15)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "rgba(243, 229, 200, 0.45)";
              e.currentTarget.style.transform = "scale(1)";
            }}
            aria-label="Previous message"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div style={{ maxWidth: 1400, width: "100%", margin: "0 auto", display: "flex", justifyContent: "center", alignItems: "center", gap: 14 }}>
            <svg
              className="promo-sparkle"
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                fill: "#d4af37",
                filter: "drop-shadow(0 0 2.5px rgba(212, 175, 55, 0.6))",
                display: "inline-block",
              }}
            >
              <path d="M12 0L15.2 8.8L24 12L15.2 15.2L12 24L8.8 15.2L0 12L8.8 8.8L12 0Z" />
            </svg>

            <span key={promoIndex} style={{
              fontSize: 11,
              fontFamily: "var(--font-montserrat), sans-serif",
              letterSpacing: "0.08em",
              animation: "promoFade 5s infinite ease-in-out",
              display: "inline-block",
              textTransform: "uppercase" as const,
              userSelect: "none",
            }}>
              {promoMessages[promoIndex]}
            </span>

            <svg
              className="promo-sparkle"
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                fill: "#d4af37",
                filter: "drop-shadow(0 0 2.5px rgba(212, 175, 55, 0.6))",
                display: "inline-block",
              }}
            >
              <path d="M12 0L15.2 8.8L24 12L15.2 15.2L12 24L8.8 15.2L0 12L8.8 8.8L12 0Z" />
            </svg>
          </div>

          {/* Right Arrow Controls */}
          <div style={{ position: "absolute", right: 16, display: "flex", alignItems: "center", zIndex: 10 }}>
            <button
              suppressHydrationWarning
              onClick={handleNextPromo}
              style={{
                background: "none",
                border: "none",
                color: "rgba(243, 229, 200, 0.45)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 4,
                transition: "color 0.25s, transform 0.25s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "#d4af37";
                e.currentTarget.style.transform = "scale(1.15)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "rgba(243, 229, 200, 0.45)";
                e.currentTarget.style.transform = "scale(1)";
              }}
              aria-label="Next message"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        <div style={{
          background: scrolled
            ? "rgba(255, 255, 255, 0.96)"
            : "#ffffff",
          backdropFilter: "blur(40px) saturate(200%)",
          WebkitBackdropFilter: "blur(40px) saturate(200%)",
          borderBottom: "0.5px solid rgba(0,0,0,0.08)",
          boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.06)" : "none",
          transition: "background 0.3s, box-shadow 0.3s",
          overflow: "visible",
        }}>
          {/* ── TOP ROW: Logo | Search | Icons ── */}
          <div style={{
            maxWidth: 1400, margin: "0 auto",
            padding: "0 28px", height: 58,
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 20,
          }}>

            {/* ── LOGO ── */}
            <Link href="/"
              onClick={() => {
                setIsDrawerOpen(false);
                setIsWishlistDrawerOpen(false);
              }}
              style={{ textDecoration: "none", flexShrink: 0, transition: "transform 0.2s ease", display: "inline-block" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.02)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "scale(1)"}
            >
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1, alignItems: "center" }}>
                <span style={{
                  fontSize: 22, fontWeight: 800, letterSpacing: "0.12em",
                  color: "#1C1C1E",
                  fontFamily: "var(--font-playfair), serif",
                  textTransform: "uppercase",
                }}>
                  LUXURY
                  <span style={{
                    color: "#aa841c",
                    fontStyle: "normal",
                    marginLeft: 2,
                    marginRight: 2,
                  }}>.</span>
                  <span style={{ fontSize: 16, fontWeight: 400, letterSpacing: "0.05em", color: "#6C6C70" }}>lk</span>
                </span>
                <span style={{
                  fontSize: 7.5, fontWeight: 600, letterSpacing: "0.3em",
                  textTransform: "uppercase" as const, color: "#8E8E93",
                  marginTop: 3,
                  fontFamily: "var(--font-montserrat), sans-serif",
                }}>
                  Premium Boutique
                </span>
              </div>
            </Link>

            {/* ── SEARCH ── */}
            <div style={{ flex: 1, maxWidth: 580, display: "flex", justifyContent: "center" }}>
              <SearchBar onLinkClick={() => {
                setIsDrawerOpen(false);
                setIsWishlistDrawerOpen(false);
              }} />
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
                onClick={() => {
                  if (!user) {
                    showStorefrontToast("Please login or signup to view your wishlist.", "info");
                    setTimeout(() => {
                      window.location.href = "/auth/login";
                    }, 1500);
                  } else {
                    window.location.href = "/storefront/wishlist";
                  }
                }}
                icon={<WishlistIcon />}
              />
              <IconBtnLabeled
                label="Cart"
                badge={cartCount}
                onClick={() => {
                  if (!user) {
                    showStorefrontToast("Please login or signup to view your cart.", "info");
                    setTimeout(() => {
                      window.location.href = "/auth/login";
                    }, 1500);
                  } else {
                    setIsDrawerOpen(!isDrawerOpen);
                  }
                }}
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
            background: scrolled
              ? "rgba(255, 255, 255, 0.92)"
              : "#ffffff",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            overflow: "visible",
          }}>
            <div style={{
              maxWidth: 1400, margin: "0 auto",
              padding: "0 28px",
              display: "flex", alignItems: "stretch",
              gap: 4, height: 40,
              overflow: "visible",
            }}>
              <Link
                href="/"
                onClick={() => {
                  setActiveTab("/");
                  setIsDrawerOpen(false);
                  setIsWishlistDrawerOpen(false);
                }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 32, height: 32, alignSelf: "center", borderRadius: "50%",
                  color: activeTab === "/" ? "#aa841c" : "#3C3C43",
                  transition: "all 0.2s ease",
                  background: activeTab === "/" ? "rgba(170, 132, 28, 0.06)" : "transparent",
                  marginRight: 8,
                }}
                onMouseEnter={e => {
                  if (activeTab !== "/") {
                    (e.currentTarget as HTMLElement).style.background = "rgba(0, 0, 0, 0.04)";
                    (e.currentTarget as HTMLElement).style.color = "#3C3C43";
                  }
                }}
                onMouseLeave={e => {
                  if (activeTab !== "/") {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#3C3C43";
                  }
                }}
                aria-label="Home"
              >
                <HomeIcon />
              </Link>
              {NAV_TABS.map(tab => {
                const isActive = activeTab === tab.href;
                const isNew = tab.label === "New Arrival";
                const isOffer = tab.label === "Offers";
                const hasMega = tab.label in MEGA_MENUS;
                const isMegaOpen = hoveredTab === tab.label;
                return (
                  <div
                    key={tab.href}
                    style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}
                    onMouseEnter={() => {
                      if (megaMenuTimer.current) clearTimeout(megaMenuTimer.current);
                      if (hasMega) setHoveredTab(tab.label);
                    }}
                    onMouseLeave={() => {
                      megaMenuTimer.current = setTimeout(() => setHoveredTab(null), 300);
                    }}
                  >
                    <Link
                      href={tab.href}
                      onClick={() => {
                        setActiveTab(tab.href);
                        setHoveredTab(null);
                        setIsDrawerOpen(false);
                        setIsWishlistDrawerOpen(false);
                      }}
                      className={`nav-link ${isActive ? "active" : ""} ${isOffer ? "offer" : ""}`}
                      style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tab.label}
                      {hasMega && (
                        <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                          style={{ opacity: 0.5, transition: "transform 0.2s", transform: isMegaOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      )}
                      {isNew && (
                        <span style={{
                          fontSize: 8, fontWeight: 800, letterSpacing: "0.06em",
                          textTransform: "uppercase" as const,
                          background: "linear-gradient(135deg, #FF9500, #FF6B00)",
                          color: "#fff", padding: "1px 5px", borderRadius: 4,
                        }}>NEW</span>
                      )}
                    </Link>

                    {/* Mega Menu Dropdown */}
                    {hasMega && isMegaOpen && (
                      <div
                        onMouseEnter={() => { if (megaMenuTimer.current) clearTimeout(megaMenuTimer.current); }}
                        style={{ position: "absolute", left: 0, top: "100%", paddingTop: "8px", animation: "megaFadeIn 0.2s ease forwards" }}
                      >
                        <MegaMenu
                          label={tab.label}
                          data={MEGA_MENUS[tab.label]}
                          onLinkClick={() => {
                            setIsDrawerOpen(false);
                            setIsWishlistDrawerOpen(false);
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed nav (top 58 + bottom 40 + promo 34 = 132px) */}
      <div style={{ height: 132 }} />

      <style>{`
        @keyframes megaFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes searchDropdownOpen {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes promoFade {
          0% { opacity: 0; filter: blur(4px); letter-spacing: 0.16em; transform: scale(0.97); }
          4% { opacity: 1; filter: blur(0); letter-spacing: 0.08em; transform: scale(1); }
          96% { opacity: 1; filter: blur(0); letter-spacing: 0.08em; transform: scale(1); }
          100% { opacity: 0; filter: blur(4px); letter-spacing: 0.16em; transform: scale(1.03); }
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0 16px;
          height: 100%;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #3C3C43;
          position: relative;
          transition: color 0.22s ease, background 0.22s ease;
          border-radius: 6px;
          font-family: var(--font-montserrat), sans-serif;
        }
        .nav-link:hover {
          color: #aa841c;
          background: rgba(170, 132, 28, 0.04);
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 16px;
          right: 16px;
          height: 2px;
          background: linear-gradient(90deg, #aa841c, #d4af37);
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-link:hover::after,
        .nav-link.active::after {
          transform: scaleX(1);
        }
        .nav-link.active {
          color: #aa841c;
          font-weight: 700;
        }
        .nav-link.offer {
          color: #FF3B30;
        }
        .nav-link.offer::after {
          background: #FF3B30;
        }
        .nav-link.offer:hover {
          background: rgba(255, 59, 48, 0.04);
        }
      `}</style>

      {isDrawerOpen && (
        <CartDrawer onClose={() => setIsDrawerOpen(false)} />
      )}
      {isWishlistDrawerOpen && (
        <WishlistDrawer onClose={() => setIsWishlistDrawerOpen(false)} />
      )}
    </>
  );
}