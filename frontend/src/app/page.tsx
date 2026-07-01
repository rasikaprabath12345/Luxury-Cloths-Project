"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { glass } from "@/utils/theme";
import ProductCard, { Product, ProductSkeleton } from "@/components/ProductCard";

// ─── CUSTOM HERO IMAGE ──────────────────────────────────────────────────────
// Change this to your own image (local path inside /public or full URL)
const HERO_IMAGE = "/qw.jpg"; // e.g. "/images/hero-bg.jpg" or "https://example.com/my-image.jpg"

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface User {
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "customer";
}

const MOCK_USER: User = {
  name: "Ashan Silva",
  email: "ashan@luxurycloth.lk",
  role: "admin",
};

// ─── GLASS STYLES (inline so no Tailwind conflicts) ───────────────────────────

// ─── SKELETON ─────────────────────────────────────────────────────────────────

// ─── USER MENU ────────────────────────────────────────────────────────────────
function UserMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)}
        style={{ ...glass.pill, display: "flex", alignItems: "center", gap: 8, padding: "5px 14px 5px 5px", cursor: "pointer" }}>
        <span style={{
          width: 30, height: 30, borderRadius: "50%",
          background: "linear-gradient(135deg, #007AFF, #5856D6)",
          color: "#fff", fontSize: 11, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{initials}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>{user.name.split(" ")[0]}</span>
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth={2.5}
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div style={{
          ...glass.card,
          position: "absolute", right: 0, top: "calc(100% + 10px)",
          width: 240, zIndex: 100, overflow: "hidden",
          background: "rgba(250,250,252,0.92)",
        }}>
          <div style={{ padding: "14px 16px", borderBottom: "0.5px solid rgba(0,0,0,0.07)" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E", margin: 0 }}>{user.name}</p>
            <p style={{ fontSize: 11, color: "#8E8E93", margin: "2px 0 0" }}>{user.email}</p>
            {user.role === "admin" && (
              <span style={{
                display: "inline-block", marginTop: 6, fontSize: 9, fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase", color: "#007AFF",
                background: "rgba(0,122,255,0.08)", border: "0.5px solid rgba(0,122,255,0.2)",
                padding: "2px 8px", borderRadius: 6,
              }}>Admin</span>
            )}
          </div>
          <div style={{ padding: "6px 0" }}>
            {[
              { href: "/profile", icon: "👤", label: "My Profile" },
              { href: "/orders", icon: "📦", label: "My Orders" },
              ...(user.role === "admin" ? [{ href: "/admin/products", icon: "⚙️", label: "Dashboard" }] : []),
            ].map(item => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
                  fontSize: 13, color: "#1C1C1E", textDecoration: "none"
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <span style={{
                  width: 26, height: 26, background: "rgba(120,120,128,0.1)", borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13
                }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
          <div style={{ padding: "6px 8px 8px", borderTop: "0.5px solid rgba(0,0,0,0.06)" }}>
            <button onClick={() => { setOpen(false); onLogout(); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#FF3B30",
                borderRadius: 12
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,59,48,0.06)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}>
              <span style={{
                width: 26, height: 26, background: "rgba(255,59,48,0.08)", borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12
              }}>↩</span>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── PRODUCT SLIDER COMPONENT ────────────────────────────────────────────────
function ProductSlider({ products }: { products: Product[] }) {
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isMoving, setIsMoving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 768) {
        setItemsPerPage(2);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(3);
      } else {
        setItemsPerPage(5);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalProducts = products.length;
  const isLoopable = totalProducts > itemsPerPage;

  // Align index with clone offset when mounted or resized
  useEffect(() => {
    setCurrentIndex(isLoopable ? itemsPerPage : 0);
    setIsTransitioning(false);
  }, [itemsPerPage, isLoopable]);

  // Auto slide effect
  useEffect(() => {
    if (!isLoopable || isHovered) return;
    const interval = setInterval(() => {
      handleNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [totalProducts, itemsPerPage, isHovered, isLoopable]);

  if (totalProducts === 0) return null;

  // Clone products to facilitate infinite loop scrolling
  const prepended = isLoopable ? products.slice(-itemsPerPage) : [];
  const appended = isLoopable ? products.slice(0, itemsPerPage) : [];
  const extendedProducts = [...prepended, ...products, ...appended];

  const handleNext = () => {
    if (!isLoopable || isMoving) return;
    setIsMoving(true);
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (!isLoopable || isMoving) return;
    setIsMoving(true);
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleTransitionEnd = () => {
    setIsMoving(false);
    if (currentIndex >= totalProducts + itemsPerPage) {
      setIsTransitioning(false);
      setCurrentIndex(itemsPerPage);
    } else if (currentIndex <= 0) {
      setIsTransitioning(false);
      setCurrentIndex(totalProducts);
    }
  };

  return (
    <div
      style={{ position: "relative", width: "100%" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slider Viewport */}
      <div style={{ overflow: "hidden", margin: "0 -8px", padding: "8px 0" }}>
        <div
          onTransitionEnd={handleTransitionEnd}
          style={{
            display: "flex",
            transform: `translateX(-${currentIndex * (100 / extendedProducts.length)}%)`,
            transition: isTransitioning ? "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)" : "none",
            width: `${(extendedProducts.length / itemsPerPage) * 100}%`,
          }}
        >
          {extendedProducts.map((product, index) => (
            <div key={`${product.id}-${index}`} style={{
              width: `${100 / extendedProducts.length}%`,
              padding: "0 8px",
              boxSizing: "border-box",
            }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {isLoopable && (
        <>
          <button
            onClick={handlePrev}
            style={{
              position: "absolute", left: -20, top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: "50%", width: 44, height: 44, cursor: "pointer", zIndex: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontSize: 18, color: "#1C1C1E",
              transition: "transform 0.2s, background 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-50%) scale(1.08)"; e.currentTarget.style.background = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(-50%)"; e.currentTarget.style.background = "rgba(255,255,255,0.9)"; }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            style={{
              position: "absolute", right: -20, top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: "50%", width: 44, height: 44, cursor: "pointer", zIndex: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontSize: 18, color: "#1C1C1E",
              transition: "transform 0.2s, background 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-50%) scale(1.08)"; e.currentTarget.style.background = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(-50%)"; e.currentTarget.style.background = "rgba(255,255,255,0.9)"; }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const categories = [
  { name: "Womenswear", sub: "For Her", count: "85+", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop", href: "/storefront/shop?category=women" },
  { name: "Menswear", sub: "For Him", count: "120+", image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=800&auto=format&fit=crop", href: "/storefront/shop?category=men" },
  { name: "Children's Wear", sub: "For Kids", count: "35+", image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&auto=format&fit=crop", href: "/storefront/shop?category=children" },
];

const trust = [
  { icon: "🚚", label: "Islandwide Delivery", sub: "2–4 business days" },
  { icon: "🔒", label: "Secure Checkout", sub: "100% encrypted" },
  { icon: "↩️", label: "7-Day Returns", sub: "Hassle-free exchanges" },
  { icon: "✦", label: "Premium Quality", sub: "Finest Ceylon fabrics" },
];

const brands = [
  { name: "PLATINUM", sub: "Men's Wear", color: "#1C1C1E" },
  { name: "NICK & NORA", sub: "Women's Wear", color: "#F5A623" },
  { name: "AERA", sub: "Women's Wear", color: "#00C7BE" },
  { name: "CRYSTAL", sub: "Men's Wear", color: "#E5E5EA" },
];

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [activeCategory, setActiveCategory] = useState<"Women" | "Men" | "Kids">("Women");
  const [newArrivalsFilter, setNewArrivalsFilter] = useState<"All" | "Women" | "Men" | "Kids">("All");

  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setUser(null); }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5226/api/Products");
        // Sort by ID descending to show latest products first
        const sorted = response.data.sort((a: any, b: any) => b.id - a.id);
        setProducts(sorted);
      } catch {
        console.error("Could not fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const img = heroRef.current.querySelector<HTMLElement>(".hero-bg");
        if (img) img.style.transform = `scale(1.1) translateY(${window.scrollY * 0.18}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredNewArrivals = products.filter(p => {
    if (newArrivalsFilter === "All") return true;
    const catName = p.category?.name?.toLowerCase() || "";
    const catSlug = p.category?.slug?.toLowerCase() || "";
    if (newArrivalsFilter === "Women") {
      return catName.includes("women") || catName.includes("girl") || catSlug === "women" || p.categoryId === 7 || p.categoryId === 2;
    }
    if (newArrivalsFilter === "Men") {
      return (catName.includes("men") || catName.includes("boy") || catSlug === "men" || catSlug === "mens-luxury" || p.categoryId === 8 || p.categoryId === 1) && !catName.includes("women");
    }
    if (newArrivalsFilter === "Kids") {
      return catName.includes("child") || catName.includes("kids") || catName.includes("children") || catSlug === "children" || catSlug === "kids" || p.categoryId === 9 || p.categoryId === 3;
    }
    return true;
  }).slice(0, 10);

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif",
      background: "linear-gradient(160deg, #F2F2F7 0%, #E8E8F0 40%, #EEF0F8 100%)",
      minHeight: "100vh", color: "#1C1C1E",
    }}>

      {/* ─── AMBIENT BLOBS ──────────────────────────────────────────────────── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-10%", right: "-5%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,122,255,0.10) 0%, transparent 70%)",
          filter: "blur(40px)",
        }} />
        <div style={{
          position: "absolute", bottom: "20%", left: "-8%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(88,86,214,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }} />
        <div style={{
          position: "absolute", top: "50%", right: "20%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,149,0,0.06) 0%, transparent 70%)",
          filter: "blur(30px)",
        }} />
      </div>


      {/* ─── HERO ───────────────────────────────────────────────────────────── */}
      <section ref={heroRef} style={{
        position: "relative", height: "60vh", minHeight: 400,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        {/* ─── Hero Image (custom) ──────────────────────────────────────── */}
        <img
          className="hero-bg"
          src={HERO_IMAGE}
          alt=""
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", scale: "1.1", willChange: "transform",
            filter: "brightness(0.55) saturate(1.1)",
          }}
        />

        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.6) 100%)",
        }} />

        {/* Delivery pill */}
        <div style={{
          position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)",
          ...glass.pill,
          background: "rgba(255,255,255,0.16)",
          border: "0.5px solid rgba(255,255,255,0.35)",
          padding: "6px 16px",
          display: "flex", alignItems: "center", gap: 8,
          whiteSpace: "nowrap",
        }}>
          <span style={{ fontSize: 13 }}>🚚</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", letterSpacing: "0.01em" }}>
            Free delivery on orders over Rs. 5,000
          </span>
        </div>

        {/* Hero content */}
        <div style={{
          position: "relative", zIndex: 2, textAlign: "center",
          maxWidth: 720, padding: "0 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        }}>
          <div style={{
            ...glass.pill,
            background: "rgba(0,122,255,0.18)", border: "0.5px solid rgba(0,122,255,0.35)",
            padding: "6px 18px",
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#64D2FF" }}>
              Summer Collection — 2026
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 6.5vw, 64px)", fontWeight: 900, lineHeight: 0.92,
            letterSpacing: "-0.04em", color: "#fff", margin: 0,
          }}>
            Define Your<br />
            <span style={{ WebkitTextStroke: "2px rgba(255,255,255,0.8)", color: "transparent" }}>
              Luxury.
            </span>
          </h1>

          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14.5, lineHeight: 1.4, margin: 0, fontWeight: 300 }}>
            Sri Lanka's finest premium fashion.<br />
            <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)" }}>Comfort, style, and craftsmanship — delivered.</span>
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/storefront/shop"
              style={{
                background: "rgba(255,255,255,0.95)", color: "#1C1C1E",
                fontWeight: 700, fontSize: 13, padding: "10px 24px",
                borderRadius: 14, textDecoration: "none",
                boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                transition: "transform 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
              Shop Collection
            </Link>
            <Link href="/storefront/new-arrivals"
              style={{
                background: "rgba(255,255,255,0.12)", color: "#fff",
                fontWeight: 600, fontSize: 13, padding: "10px 24px",
                borderRadius: 14, textDecoration: "none",
                border: "0.5px solid rgba(255,255,255,0.3)",
                backdropFilter: "blur(12px)",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}>
              New Arrivals
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        }}>
          <div style={{ width: 1, height: 20, background: "linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)" }} />
        </div>
      </section>

      {/* ─── TRUST STRIP ────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "48px 24px 32px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {trust.map((t, i) => (
            <div key={i} style={{ ...glass.card, padding: "20px 22px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "linear-gradient(135deg, rgba(0,122,255,0.10), rgba(88,86,214,0.08))",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
              }}>{t.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>{t.label}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#8E8E93" }}>{t.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── NEW ARRIVALS COLLECTION ─────────────────────────────────────────── */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "16px 24px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{
                margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "#007AFF"
              }}>Fresh Styles</p>
              <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em" }}>New Arrivals ✨</h2>
            </div>
            <Link href="/storefront/shop?filter=new" style={{ fontSize: 13, fontWeight: 600, color: "#007AFF", textDecoration: "none" }}>
              View All New Arrivals →
            </Link>
          </div>

          {/* Filter Pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["All", "Women", "Men", "Kids"] as const).map((filter) => {
              const active = newArrivalsFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setNewArrivalsFilter(filter)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    background: active ? "linear-gradient(135deg, #007AFF, #5856D6)" : "rgba(120,120,128,0.08)",
                    color: active ? "#fff" : "#48484A",
                    boxShadow: active ? "0 4px 12px rgba(0,122,255,0.24)" : "none",
                    transition: "all 0.2s ease-in-out",
                  }}
                  onMouseEnter={e => {
                    if (!active) e.currentTarget.style.background = "rgba(120,120,128,0.14)";
                  }}
                  onMouseLeave={e => {
                    if (!active) e.currentTarget.style.background = "rgba(120,120,128,0.08)";
                  }}
                >
                  {filter === "All" ? "All Arrivals" : filter === "Women" ? "Women's" : filter === "Men" ? "Men's" : "Children's"}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <ProductSkeleton key={n} />)}
          </div>
        ) : filteredNewArrivals.length === 0 ? (
          <div style={{ ...glass.card, padding: 40, textAlign: "center", color: "#8E8E93", fontSize: 14 }}>
            No new products available for this selection.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {filteredNewArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ─── BEST SELLERS COLLECTION ─────────────────────────────────────────── */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "16px 24px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <p style={{
              margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "#007AFF"
            }}>Trending Items</p>
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em" }}>Best Sellers 🔥</h2>
          </div>
          <Link href="/storefront/shop?filter=sale" style={{ fontSize: 13, fontWeight: 600, color: "#007AFF", textDecoration: "none" }}>
            View All Best Sellers →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(n => <ProductSkeleton key={n} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={{ ...glass.card, padding: 40, textAlign: "center", color: "#8E8E93", fontSize: 14 }}>
            No best sellers available.
          </div>
        ) : (
          <ProductSlider products={(products.filter((p: any) => p.discount > 0).length > 0
            ? products.filter((p: any) => p.discount > 0)
            : products.slice(4, 12)
          ).slice(0, 10)} />
        )}
      </section>

      {/* ─── CATEGORIES ─────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "16px 24px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{
            margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "#007AFF"
          }}>Browse</p>
          <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", color: "#1C1C1E" }}>
            Shop by Category
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {categories.map((cat, i) => (
            <Link key={i} href={cat.href} style={{
              position: "relative", height: 280, borderRadius: 24, overflow: "hidden",
              cursor: "pointer", boxShadow: "0 2px 24px rgba(0,0,0,0.10)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              display: "block",
              textDecoration: "none",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.16)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 24px rgba(0,0,0,0.10)";
              }}>
              <img src={cat.image} alt={cat.name} style={{
                width: "100%", height: "100%", objectFit: "cover",
                transition: "transform 0.6s ease",
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)")}
                onMouseLeave={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")} />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.60) 0%, transparent 55%)",
              }} />
              <div style={{
                position: "absolute", bottom: 16, left: 16, right: 16,
                background: "rgba(255,255,255,0.14)", backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)", border: "0.5px solid rgba(255,255,255,0.28)",
                borderRadius: 16, padding: "12px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{cat.sub}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 15, color: "#fff", fontWeight: 700 }}>{cat.name}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{cat.count} items</span>
                  <div style={{
                    marginTop: 4, width: 28, height: 28, borderRadius: 10,
                    background: "rgba(255,255,255,0.2)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}>
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── WOMEN'S LUXURY COLLECTION ──────────────────────────────────────── */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "0px 24px 20px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <p style={{
              margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "#007AFF"
            }}>Sophisticated Styles</p>
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em" }}>Women's Collection 👚</h2>
          </div>
          <Link href="/storefront/shop?category=women" style={{ fontSize: 13, fontWeight: 600, color: "#007AFF", textDecoration: "none" }}>
            View All Women's Wear →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(n => <ProductSkeleton key={n} />)}
          </div>
        ) : products.filter(p => {
          const catName = p.category?.name?.toLowerCase() || "";
          const catSlug = p.category?.slug?.toLowerCase() || "";
          return catName.includes("women") || catName.includes("girl") || catSlug === "women" || p.categoryId === 7 || p.categoryId === 2;
        }).length === 0 ? (
          <div style={{ ...glass.card, padding: 40, textAlign: "center", color: "#8E8E93", fontSize: 14 }}>
            No women's products yet. Check back soon.
          </div>
        ) : (
          <ProductSlider products={products.filter(p => {
            const catName = p.category?.name?.toLowerCase() || "";
            const catSlug = p.category?.slug?.toLowerCase() || "";
            return catName.includes("women") || catName.includes("girl") || catSlug === "women" || p.categoryId === 7 || p.categoryId === 2;
          }).slice(0, 10)} />
        )}
      </section>

      {/* ─── MEN'S PREMIUM COLLECTION ───────────────────────────────────────── */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "0px 24px 20px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <p style={{
              margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "#007AFF"
            }}>Tailored Precision</p>
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em" }}>Men's Collection 👕</h2>
          </div>
          <Link href="/storefront/shop?category=men" style={{ fontSize: 13, fontWeight: 600, color: "#007AFF", textDecoration: "none" }}>
            View All Men's Wear →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(n => <ProductSkeleton key={n} />)}
          </div>
        ) : products.filter(p => {
          const catName = p.category?.name?.toLowerCase() || "";
          const catSlug = p.category?.slug?.toLowerCase() || "";
          return (catName.includes("men") || catName.includes("boy") || catSlug === "men" || catSlug === "mens-luxury" || p.categoryId === 8 || p.categoryId === 1) && !catName.includes("women");
        }).length === 0 ? (
          <div style={{ ...glass.card, padding: 40, textAlign: "center", color: "#8E8E93", fontSize: 14 }}>
            No men's products yet. Check back soon.
          </div>
        ) : (
          <ProductSlider products={products.filter(p => {
            const catName = p.category?.name?.toLowerCase() || "";
            const catSlug = p.category?.slug?.toLowerCase() || "";
            return (catName.includes("men") || catName.includes("boy") || catSlug === "men" || catSlug === "mens-luxury" || p.categoryId === 8 || p.categoryId === 1) && !catName.includes("women");
          }).slice(0, 10)} />
        )}
      </section>

      {/* ─── CHILDREN'S COLLECTION ─────────────────────────────────────────── */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "0px 24px 20px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <p style={{
              margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "#007AFF"
            }}>Playful & Durable</p>
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em" }}>Children's Collection 🧸</h2>
          </div>
          <Link href="/storefront/shop?category=children" style={{ fontSize: 13, fontWeight: 600, color: "#007AFF", textDecoration: "none" }}>
            View All Children's Wear →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(n => <ProductSkeleton key={n} />)}
          </div>
        ) : products.filter(p => {
          const catName = p.category?.name?.toLowerCase() || "";
          const catSlug = p.category?.slug?.toLowerCase() || "";
          return catName.includes("child") || catName.includes("kids") || catName.includes("children") || catSlug === "children" || catSlug === "kids" || p.categoryId === 9 || p.categoryId === 3;
        }).length === 0 ? (
          <div style={{ ...glass.card, padding: 40, textAlign: "center", color: "#8E8E93", fontSize: 14 }}>
            No children's products yet. Check back soon.
          </div>
        ) : (
          <ProductSlider products={products.filter(p => {
            const catName = p.category?.name?.toLowerCase() || "";
            const catSlug = p.category?.slug?.toLowerCase() || "";
            return catName.includes("child") || catName.includes("kids") || catName.includes("children") || catSlug === "children" || catSlug === "kids" || p.categoryId === 9 || p.categoryId === 3;
          }).slice(0, 10)} />
        )}
      </section>

      {/* ─── BEST SELLERS FEATURE BANNER ────────────────────────────────────── */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "8px 24px 40px", position: "relative", zIndex: 1 }}>
        <div style={{
          ...glass.dark,
          padding: "40px 48px",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24,
          background: "linear-gradient(135deg, rgba(28,28,30,0.9) 0%, rgba(44,44,56,0.9) 100%)",
          position: "relative", overflow: "hidden",
        }}>
          {/* Decorative circles */}
          <div style={{
            position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%",
            background: "rgba(0,122,255,0.12)", filter: "blur(40px)", pointerEvents: "none"
          }} />
          <div style={{
            position: "absolute", bottom: -40, left: "30%", width: 150, height: 150, borderRadius: "50%",
            background: "rgba(88,86,214,0.10)", filter: "blur(30px)", pointerEvents: "none"
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{
              margin: "0 0 6px", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "#64D2FF"
            }}>Best Sellers</p>
            <h2 style={{ margin: "0 0 10px", fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff" }}>
              Most Loved<br />This Season
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.55)", maxWidth: 340, lineHeight: 1.6 }}>
              From tees to tailored fits — discover what Sri Lanka is wearing right now.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, position: "relative", zIndex: 1 }}>
            <Link href="/storefront/best-sellers"
              style={{
                background: "#fff", color: "#1C1C1E",
                fontWeight: 700, fontSize: 14, padding: "14px 32px",
                borderRadius: 16, textDecoration: "none", textAlign: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
              }}>
              Shop Best Sellers
            </Link>
            <Link href="/storefront/sale"
              style={{
                background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)",
                fontWeight: 600, fontSize: 13, padding: "12px 28px",
                borderRadius: 14, textDecoration: "none", textAlign: "center",
                border: "0.5px solid rgba(255,255,255,0.15)",
              }}>
              View Sale Items →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── OUR BRANDS ─────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "8px 24px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{
            margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "#007AFF"
          }}>Curated</p>
          <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em" }}>Our Brands</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {brands.map((brand, i) => (
            <div key={i} style={{
              ...glass.card,
              padding: "24px 20px", textAlign: "center", cursor: "pointer",
              transition: "transform 0.25s, box-shadow 0.25s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(0,0,0,0.10)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = glass.card.boxShadow as string;
              }}>
              <div style={{
                height: 44, background: brand.color, borderRadius: 12, marginBottom: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: brand.color === "#E5E5EA" ? "0.5px solid rgba(0,0,0,0.1)" : "none",
              }}>
                <span style={{
                  fontSize: 13, fontWeight: 800, letterSpacing: "0.08em",
                  color: brand.color === "#F5A623" || brand.color === "#00C7BE" || brand.color === "#E5E5EA" ? "#1C1C1E" : "#fff",
                }}>{brand.name}</span>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: "#8E8E93", fontWeight: 500 }}>{brand.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── NEWSLETTER ─────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "8px 24px 64px", position: "relative", zIndex: 1 }}>
        <div style={{
          background: "linear-gradient(135deg, #007AFF 0%, #5856D6 60%, #AF52DE 100%)",
          borderRadius: 32, padding: "56px 48px", textAlign: "center",
          position: "relative", overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,122,255,0.25)",
        }}>
          <div style={{
            position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%",
            background: "rgba(255,255,255,0.07)", filter: "blur(40px)", pointerEvents: "none"
          }} />
          <div style={{
            position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%",
            background: "rgba(255,255,255,0.05)", filter: "blur(30px)", pointerEvents: "none"
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{
              margin: "0 0 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.65)"
            }}>Exclusive Offer</p>
            <h2 style={{ margin: "0 0 8px", fontSize: 40, fontWeight: 900, letterSpacing: "-0.03em", color: "#fff" }}>
              Get 10% Off
            </h2>
            <p style={{
              margin: "0 auto 32px", fontSize: 15, color: "rgba(255,255,255,0.65)",
              maxWidth: 360, lineHeight: 1.6, fontWeight: 300
            }}>
              New arrivals and exclusive deals — straight to your inbox. Unsubscribe anytime.
            </p>

            <div style={{ display: "flex", gap: 10, maxWidth: 440, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  flex: "1 1 200px", padding: "14px 20px", borderRadius: 16, border: "none",
                  fontSize: 14, color: "#1C1C1E", background: "rgba(255,255,255,0.95)",
                  outline: "none", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)",
                }}
              />
              <button style={{
                background: "#1C1C1E", border: "none", borderRadius: 16, padding: "14px 28px",
                fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)", flexShrink: 0,
                transition: "transform 0.1s",
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = "scale(1.02)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}>
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}