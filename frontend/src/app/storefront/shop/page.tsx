"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { productsAPI } from "@/lib/api";
import ProductCard, { Product, ProductSkeleton } from "@/components/ProductCard";
import { glass } from "@/utils/theme";

function ShopContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const filterType = searchParams.get("filter");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getAllProducts();
        // Sort by ID descending to show latest products first
        const sorted = response.data.sort((a: any, b: any) => b.id - a.id);
        setProducts(sorted);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product: any) => {
    // Filter by Category
    if (categoryFilter) {
      const slug = product.category?.slug?.toLowerCase() || "";
      const name = product.category?.name?.toLowerCase() || "";
      const filterLower = categoryFilter.toLowerCase();
      
      let isMatch = false;
      if (filterLower === "women") {
        isMatch = name.includes("women") || name.includes("girl") || name.includes("lady") || slug.includes("women") || slug.includes("girl") || product.categoryId === 7 || product.categoryId === 2;
      } else if (filterLower === "men") {
        isMatch = (name.includes("men") || name.includes("boy") || name.includes("gent") || slug.includes("men") || slug.includes("boy") || product.categoryId === 8 || product.categoryId === 1) && !name.includes("women");
      } else if (filterLower === "children" || filterLower === "kids") {
        isMatch = name.includes("child") || name.includes("kids") || name.includes("children") || name.includes("baby") || slug.includes("child") || slug.includes("kids") || slug.includes("children") || slug.includes("baby") || product.categoryId === 9 || product.categoryId === 3;
      } else {
        isMatch = slug === filterLower || name.includes(filterLower);
      }

      if (!isMatch) return false;
    }

    // Filter by Type (Offers/Sale or New)
    if (filterType === "sale" || filterType === "offers") {
      if (!(product.discount > 0)) return false;
    }

    if (filterType === "new") {
      // In a real app we'd filter by date, here we just show top N or everything since we sorted by ID desc
      // We can just keep it as is, or apply a specific logic
    }

    return true;
  });

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif",
      background: "linear-gradient(160deg, #F2F2F7 0%, #E8E8F0 40%, #EEF0F8 100%)",
      minHeight: "100vh", color: "#1C1C1E",
      paddingTop: 30, // Account for spacer inside Navbar.tsx
      paddingBottom: 60,
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
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 12, marginBottom: 40,
          borderBottom: "0.5px solid rgba(0,0,0,0.08)", paddingBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/" style={{
              display: "flex", alignItems: "center", gap: 6, textDecoration: "none",
              color: "#8E8E93", fontSize: 13, fontWeight: 600,
              transition: "color 0.2s"
            }} onMouseEnter={e => e.currentTarget.style.color = "#1C1C1E"} onMouseLeave={e => e.currentTarget.style.color = "#8E8E93"}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Home
            </Link>
          </div>
          <div>
            <p style={{
              margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "#007AFF"
            }}>Premium Collection</p>
            <h1 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#1C1C1E" }}>
              {filterType === "new" ? "New Arrivals ✨" :
                filterType === "sale" || filterType === "offers" ? "Special Offers 🔥" :
                  categoryFilter ? `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}'s Collection` :
                    "All Premium Apparel"}
            </h1>
            <p style={{ margin: "6px 0 0", color: "#8E8E93", fontSize: 15, fontWeight: 400 }}>
              Discover curated luxury fashion items crafted for your premium taste.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : (
          <div>
            {filteredProducts.length === 0 ? (
              <div style={{
                ...glass.card, padding: "60px 20px", textAlign: "center",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 16
              }}>
                <span style={{ fontSize: 48 }}>🧥</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#1C1C1E" }}>No products found</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 14, color: "#8E8E93" }}>
                    We couldn't find any products matching this selection.
                  </p>
                </div>
                <Link href="/storefront/shop" style={{
                  background: "linear-gradient(135deg, #1C1C1E, #3C3C43)",
                  color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700,
                  padding: "10px 24px", borderRadius: 14, marginTop: 12,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)", transition: "transform 0.2s"
                }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                  Clear Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
