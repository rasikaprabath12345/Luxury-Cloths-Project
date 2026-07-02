"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { productsAPI } from "@/lib/api";
import { useCart } from "@/context/CartContext";

interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  reviews: number;
  sizes?: string[];
  colors?: string[];
  material?: string;
  care?: string[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productsAPI.getProductBySlug(slug);
        const data = res.data;

        // Map backend product to ProductDetail UI interface
        const sizesArr = data.sizes ? data.sizes.split(",").map((s: string) => s.trim()) : [];
        const colorsArr = data.variants && data.variants.length > 0
          ? Array.from(new Set(data.variants.map((v: any) => v.color).filter(Boolean))) as string[]
          : [];
        const imagesArr = data.images && data.images.length > 0
          ? data.images.map((img: any) => img.imageUrl)
          : [data.imageUrl || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600"];
        const totalStock = data.variants && data.variants.length > 0
          ? data.variants.reduce((sum: number, v: any) => sum + (v.stockQuantity || 0), 0)
          : 10;

        setProduct({
          id: data.id.toString(),
          slug: data.slug,
          name: data.name,
          description: data.description || "Ceylon luxury fabrics and modern fit.",
          price: data.price,
          originalPrice: data.discount > 0 ? data.price / (1 - data.discount / 100) : undefined,
          images: imagesArr,
          category: data.category?.name || "Premium Collection",
          stock: totalStock,
          rating: 4.8,
          reviews: 12,
          sizes: sizesArr,
          colors: colorsArr,
          material: "Ceylon Luxury Cotton & Silk Mix",
          care: ["Gentle Machine Wash", "Dry in Shade", "Iron Medium Heat"]
        });

        if (sizesArr.length > 0) setSelectedSize(sizesArr[0]);
        if (colorsArr.length > 0) setSelectedColor(colorsArr[0]);

        // Fetch related products from same category
        try {
          const allRes = await productsAPI.getAllProducts();
          const all = allRes.data;
          const related = all
            .filter((p: any) => p.slug !== slug && p.categoryId === data.categoryId)
            .slice(0, 4);
          // If not enough from same category, pad with other products
          if (related.length < 4) {
            const others = all
              .filter((p: any) => p.slug !== slug && p.categoryId !== data.categoryId)
              .slice(0, 4 - related.length);
            setRelatedProducts([...related, ...others]);
          } else {
            setRelatedProducts(related);
          }
        } catch {
          // silently ignore related products fetch failure
        }

      } catch (error) {
        console.error("Failed to fetch product by slug:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
        <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        <Link
          href="/storefront/product"
          className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <main style={{ minHeight: "100vh", background: "#F9F8F6", paddingTop: 8, paddingBottom: 40 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>

        {/* Breadcrumb */}
        <nav style={{
          fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
          fontSize: 11,
          color: "#8E8E93",
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 16,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          flexWrap: "wrap",
        }}>
          <Link href="/" style={{ textDecoration: "none", color: "#8E8E93", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#aa841c")}
            onMouseLeave={e => (e.currentTarget.style.color = "#8E8E93")}>Home</Link>
          <span style={{ color: "#C7C7CC" }}>â€º</span>
          <Link href="/storefront/shop" style={{ textDecoration: "none", color: "#8E8E93", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#aa841c")}
            onMouseLeave={e => (e.currentTarget.style.color = "#8E8E93")}>{product.category}</Link>
          <span style={{ color: "#C7C7CC" }}>â€º</span>
          <span style={{ color: "#1C1C1E", fontWeight: 600 }}>{product.name}</span>
        </nav>

        {/* Main Product Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "0.36fr 1fr",
          gap: 20,
          alignItems: "start",
        }} className="product-detail-grid">

          {/* ── LEFT: Image Gallery ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="product-images-gallery">

            {/* Main Image */}
            <div style={{
              position: "relative",
              aspectRatio: "3/4",
              borderRadius: 20,
              overflow: "hidden",
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(28px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.85)",
              boxShadow: "0 8px 48px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}>
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              />
              {discount > 0 && (
                <span style={{
                  position: "absolute", top: 16, left: 16,
                  background: "linear-gradient(135deg, #FF3B30, #FF2D55)",
                  color: "#fff",
                  fontSize: 11, fontWeight: 800,
                  padding: "5px 12px",
                  borderRadius: 100,
                  fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
                  letterSpacing: "0.05em",
                  boxShadow: "0 4px 12px rgba(255,59,48,0.35)",
                }}>-{discount}% OFF</span>
              )}
            </div>

            {/* Thumbnails (below main image, horizontal row) */}
            {product.images.length > 1 && (
              <div style={{ display: "flex", flexDirection: "row", gap: 10, justifyContent: "center", marginTop: 4, flexWrap: "wrap" }} className="thumbnails-column">
                {product.images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    style={{
                      width: 64,
                      aspectRatio: "3/4",
                      padding: 0,
                      border: currentImageIndex === idx ? "2.5px solid #aa841c" : "1.5px solid rgba(0,0,0,0.08)",
                      borderRadius: 10,
                      overflow: "hidden",
                      cursor: "pointer",
                      background: "rgba(255,255,255,0.72)",
                      backdropFilter: "blur(12px)",
                      transition: "border 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
                      boxShadow: currentImageIndex === idx ? "0 0 0 3px rgba(170,132,28,0.15)" : "0 2px 8px rgba(0,0,0,0.06)",
                      transform: currentImageIndex === idx ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    <img src={image} alt={`View ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
          }}>
            {/* Category pill */}
            <span style={{
              display: "inline-block",
              background: "rgba(170,132,28,0.10)",
              color: "#aa841c",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "4px 12px",
              borderRadius: 100,
              marginBottom: 10,
              width: "fit-content",
            }}>{product.category}</span>

            {/* Title */}
            <h1 style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
              fontSize: 18,
              fontWeight: 800,
              color: "#1C1C1E",
              margin: "0 0 4px",
              lineHeight: 1.25,
            }}>{product.name}</h1>

            {/* Stock badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: product.stock > 0 ? "#30D158" : "#FF3B30",
                display: "inline-block",
                boxShadow: product.stock > 0 ? "0 0 0 2px rgba(48,209,88,0.2)" : "0 0 0 2px rgba(255,59,48,0.2)",
              }} />
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: product.stock > 0 ? "#30D158" : "#FF3B30",
                letterSpacing: "0.04em",
              }}>
                {product.stock > 0 ? `In Stock · ${product.stock} left` : "Out of Stock"}
              </span>
            </div>

            {/* Price block */}
            <div style={{
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.85)",
              borderRadius: 16,
              padding: "10px 14px",
              marginBottom: 12,
              boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#FF2D55", fontFamily: "var(--font-montserrat)" }}>
                  Rs. {product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {product.originalPrice && (
                  <span style={{ fontSize: 15, color: "#C7C7CC", textDecoration: "line-through" }}>
                    Rs. {product.originalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
              </div>

              {/* Installments */}
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#636366" }}>
                  <span>or pay in</span>
                  <span style={{ fontWeight: 700, color: "#1C1C1E" }}>3 Ã— Rs. {(product.price / 3).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span>with</span>
                  <span style={{ background: "linear-gradient(135deg, #00F0FF, #7000FF)", color: "#fff", fontSize: 8, fontWeight: 900, padding: "2px 7px", borderRadius: 4, letterSpacing: "0.08em" }}>KOKO</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#636366" }}>
                  <span>or pay in</span>
                  <span style={{ fontWeight: 700, color: "#1C1C1E" }}>3 Ã— Rs. {(product.price / 3).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span>with</span>
                  <span style={{ background: "#1C1C1E", color: "#fff", fontSize: 8, fontWeight: 900, padding: "2px 7px", borderRadius: 4, letterSpacing: "0.08em" }}>MINTPAY</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: "0.5px", background: "rgba(0,0,0,0.07)", marginBottom: 20 }} />

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1C1C1E", letterSpacing: "0.08em", textTransform: "uppercase" }}>Size</span>
                  <button style={{ background: "none", border: "none", fontSize: 11, color: "#aa841c", cursor: "pointer", fontWeight: 600, letterSpacing: "0.04em", padding: 0, fontFamily: "var(--font-montserrat)" }}>
                    Size Guide â€º
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        minWidth: 46,
                        height: 40,
                        paddingInline: 10,
                        border: selectedSize === size ? "2px solid #aa841c" : "1.5px solid rgba(0,0,0,0.12)",
                        background: selectedSize === size ? "rgba(170,132,28,0.08)" : "rgba(255,255,255,0.72)",
                        color: selectedSize === size ? "#aa841c" : "#1C1C1E",
                        fontSize: 12, fontWeight: 700,
                        borderRadius: 10,
                        cursor: "pointer",
                        backdropFilter: "blur(12px)",
                        transition: "all 0.18s ease",
                        boxShadow: selectedSize === size ? "0 0 0 3px rgba(170,132,28,0.15)" : "0 1px 4px rgba(0,0,0,0.06)",
                        fontFamily: "var(--font-montserrat)",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QTY + Stock */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1C1C1E" }}>Qty</span>

              <div style={{
                display: "flex",
                alignItems: "center",
                border: "1.5px solid rgba(0,0,0,0.12)",
                borderRadius: 10,
                overflow: "hidden",
                background: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(12px)",
                height: 40,
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  style={{ width: 36, height: "100%", border: "none", background: "none", cursor: "pointer", fontSize: 16, color: quantity <= 1 ? "#C7C7CC" : "#1C1C1E", fontWeight: 300 }}
                >âˆ’</button>
                <span style={{ minWidth: 32, textAlign: "center", fontSize: 14, fontWeight: 700, color: "#1C1C1E", fontFamily: "var(--font-montserrat)" }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ width: 36, height: "100%", border: "none", background: "none", cursor: "pointer", fontSize: 16, color: "#1C1C1E", fontWeight: 300 }}
                >+</button>
              </div>

              <span style={{ fontSize: 12, color: "#30D158", fontWeight: 600 }}>{product.stock} in stock</span>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              {/* Add to Cart */}
              <button
                disabled={product.stock === 0}
                onClick={() => {
                  addToCart({
                    id: parseInt(product.id),
                    name: product.name,
                    price: product.price,
                    imageUrl: product.images?.[0] || "",
                    description: product.description,
                  }, quantity, selectedSize, selectedColor);
                  alert(`${quantity} Ã— ${product.name} added to cart! ðŸ›’`);
                }}
                style={{
                  flex: 1, height: 50,
                  background: product.stock === 0 ? "#E5E5EA" : "linear-gradient(135deg, #1C1C1E 0%, #3C3C43 100%)",
                  color: product.stock === 0 ? "#8E8E93" : "#fff",
                  border: "none",
                  borderRadius: 14,
                  fontSize: 13, fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: product.stock === 0 ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.2s ease",
                  fontFamily: "var(--font-montserrat)",
                  boxShadow: product.stock === 0 ? "none" : "0 4px 20px rgba(28,28,30,0.3)",
                }}
                onMouseEnter={e => { if (product.stock > 0) { e.currentTarget.style.background = "linear-gradient(135deg, #007AFF, #5856D6)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,122,255,0.35)"; } }}
                onMouseLeave={e => { if (product.stock > 0) { e.currentTarget.style.background = "linear-gradient(135deg, #1C1C1E, #3C3C43)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(28,28,30,0.3)"; } }}
              >
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>

              {/* Wishlist */}
              <button
                style={{
                  width: 50, height: 50,
                  background: "rgba(255,255,255,0.80)",
                  backdropFilter: "blur(20px)",
                  border: "1.5px solid rgba(255,45,85,0.25)",
                  borderRadius: 14,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 12px rgba(255,45,85,0.12)",
                  flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,45,85,0.08)"; e.currentTarget.style.borderColor = "#FF2D55"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.80)"; e.currentTarget.style.borderColor = "rgba(255,45,85,0.25)"; }}
              >
                <svg width={18} height={18} viewBox="0 0 24 24" fill="#FF2D55" stroke="#FF2D55" strokeWidth={1.5}>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            {/* Description */}
            <div style={{
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.85)",
              borderRadius: 16,
              padding: "18px 20px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
            }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "#8E8E93", margin: "0 0 10px", fontFamily: "var(--font-montserrat)" }}>Description</h3>
              <p style={{ fontSize: 14, color: "#3C3C43", lineHeight: 1.65, margin: 0, fontFamily: "var(--font-montserrat)" }}>{product.description}</p>

              {product.material && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "0.5px solid rgba(0,0,0,0.06)" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "#8E8E93" }}>Material Â· </span>
                  <span style={{ fontSize: 13, color: "#1C1C1E", fontWeight: 500 }}>{product.material}</span>
                </div>
              )}

              {product.care && product.care.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "0.5px solid rgba(0,0,0,0.06)" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "#8E8E93", display: "block", marginBottom: 8 }}>Care</span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {product.care.map((c, i) => (
                      <span key={i} style={{ fontSize: 11, background: "rgba(0,0,0,0.04)", padding: "3px 10px", borderRadius: 100, color: "#636366", fontWeight: 500 }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Responsive styles */}
        <style>{`
          @media (max-width: 768px) {
            .product-detail-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
            .product-images-gallery { flex-direction: column !important; }
            .thumbnails-column { flex-direction: row !important; width: 100% !important; overflow-x: auto; justify-content: center !important; }
            .thumbnails-column button { width: 60px !important; height: 80px !important; }
          }
        `}</style>

        {/* â”€â”€ YOU MAY ALSO LIKE â”€â”€ */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: 72, paddingTop: 48, borderTop: "0.5px solid rgba(0,0,0,0.08)" }}>
            <h2 style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
              fontSize: 20, fontWeight: 800, color: "#1C1C1E",
              marginBottom: 6,
            }}>You May Also Like</h2>
            <p style={{ fontSize: 12, color: "#8E8E93", marginBottom: 28, fontFamily: "var(--font-montserrat)", letterSpacing: "0.04em" }}>Curated picks from our collection</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }} className="related-grid">
              {relatedProducts.map((rp: any) => {
                const rpImage = rp.images?.[0]?.imageUrl || rp.imageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600";
                const rpPrice = rp.price;
                const rpDiscounted = rp.discount > 0 ? rpPrice - (rpPrice * rp.discount / 100) : rpPrice;
                return (
                  <Link key={rp.id} href={`/storefront/product/${rp.slug}`} style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        background: "rgba(255,255,255,0.72)",
                        backdropFilter: "blur(28px) saturate(180%)",
                        border: "1px solid rgba(255,255,255,0.85)",
                        borderRadius: 20,
                        overflow: "hidden",
                        boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 40px rgba(0,0,0,0.12)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 20px rgba(0,0,0,0.06)"; }}
                    >
                      <div style={{ width: "100%", aspectRatio: "3/4", overflow: "hidden", background: "#F2F2F7" }}>
                        <img
                          src={rpImage}
                          alt={rp.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
                          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                          onError={e => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600"; }}
                        />
                      </div>
                      <div style={{ padding: "14px 16px" }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#1C1C1E", margin: "0 0 6px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", fontFamily: "var(--font-montserrat)" }}>{rp.name}</p>
                        {rp.category?.name && <p style={{ fontSize: 10, color: "#8E8E93", margin: "0 0 8px", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "var(--font-montserrat)" }}>{rp.category.name}</p>}
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: "#FF2D55", fontFamily: "var(--font-montserrat)" }}>
                            Rs. {rpDiscounted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          {rp.discount > 0 && (
                            <span style={{ fontSize: 11, color: "#C7C7CC", textDecoration: "line-through" }}>
                              Rs. {rpPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <style>{`
              @media (max-width: 768px) { .related-grid { grid-template-columns: repeat(2, 1fr) !important; } }
              @media (max-width: 480px) { .related-grid { grid-template-columns: 1fr !important; } }
            `}</style>
          </div>
        )}
      </div>
    </main>
  );
}
