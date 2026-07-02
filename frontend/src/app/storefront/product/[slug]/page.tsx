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
    <main className="min-h-screen bg-white pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize: 12,
          color: "#8E8E93",
          display: "flex",
          gap: 6,
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
        }}>
          <Link href="/" style={{ textDecoration: "none", color: "#8E8E93" }}>Home</Link>
          <span>/</span>
          <Link href="/storefront/shop" style={{ textDecoration: "none", color: "#8E8E93" }}>Women's Wear</Link>
          <span>/</span>
          <span style={{ color: "#8E8E93" }}>{product.category}</span>
          <span>/</span>
          <span style={{ color: "#1C1C1E", fontWeight: 500 }}>{product.name}</span>
        </nav>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: 40,
          alignItems: "start",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }} className="product-detail-grid">
          
          {/* Left Column: Image Gallery */}
          <div style={{ display: "flex", gap: 16 }} className="product-images-gallery">
            {/* Main Image Box */}
            <div style={{
              flex: 1,
              position: "relative",
              aspectRatio: "3/4",
              background: "#F2F2F7",
              borderRadius: 4,
              overflow: "hidden",
            }}>
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {discount > 0 && (
                <span style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  background: "#FF3B30",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 4,
                }}>-{discount}% OFF</span>
              )}
            </div>

            {/* Thumbnails Stack (stacked vertically on the right of the main image) */}
            {product.images.length > 1 && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                width: 80,
                flexShrink: 0,
              }} className="thumbnails-column">
                {product.images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    style={{
                      width: 80,
                      height: 106,
                      padding: 0,
                      border: currentImageIndex === idx ? "2px solid #aa841c" : "1px solid #E2E8F0",
                      background: "none",
                      borderRadius: 4,
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "border 0.2s ease",
                    }}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${idx + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, textAlign: "left" }}>
            {/* Stock Status */}
            <span style={{
              fontSize: 14,
              fontWeight: 600,
              color: product.stock > 0 ? "#4CD964" : "#FF3B30",
            }}>
              {product.stock > 0 ? "In Stock" : "Out of Stock"}
            </span>

            {/* Title */}
            <h1 style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#1C1C1E",
              margin: 0,
              lineHeight: 1.2,
            }}>{product.name}</h1>

            {/* Product Reference */}
            <span style={{
              fontSize: 12,
              color: "#8E8E93",
              marginTop: -8,
            }}>
              Product Ref. 0114173001{String(product.id).padStart(3, "0")} -{String(product.id).padStart(2, "0")}
            </span>

            {/* Price */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "6px 0" }}>
              <span style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#E53E3E", // Red price color matching the screenshot
              }}>
                Rs. {product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              
              {/* Installments calculations */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#3C3C43" }}>
                  <span>or pay in</span>
                  <span style={{ fontWeight: 700 }}>3 X Rs. {(product.price / 3).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span>with</span>
                  <span style={{
                    background: "linear-gradient(135deg, #00F0FF, #7000FF)",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 800,
                    padding: "2px 6px",
                    borderRadius: 3,
                    letterSpacing: "0.05em",
                    lineHeight: 1,
                  }}>KOKO</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#3C3C43" }}>
                  <span>or pay in</span>
                  <span style={{ fontWeight: 700 }}>3 X Rs. {(product.price / 3).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span>with</span>
                  <span style={{
                    background: "#1C1C1E",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 800,
                    padding: "2px 6px",
                    borderRadius: 3,
                    letterSpacing: "0.05em",
                    lineHeight: 1,
                  }}>MINTPAY</span>
                </div>
              </div>
            </div>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ borderTop: "0.5px solid rgba(0,0,0,0.08)", paddingTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#1C1C1E" }}>Size</span>
                  <button style={{
                    background: "none",
                    border: "none",
                    fontSize: 12,
                    color: "#aa841c",
                    textDecoration: "underline",
                    cursor: "pointer",
                    padding: 0,
                  }}>Size Guide &gt;</button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        width: 44,
                        height: 38,
                        border: selectedSize === size ? "2px solid #1C1C1E" : "1px solid #E2E8F0",
                        background: "#fff",
                        color: "#1C1C1E",
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 4,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QTY selector & stock count */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, borderTop: "0.5px solid rgba(0,0,0,0.08)", paddingTop: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1C1C1E" }}>QTY</span>
              
              {/* Customized QTY Input Box with stacked buttons on right */}
              <div style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #1C1C1E",
                borderRadius: 4,
                height: 38,
                overflow: "hidden",
              }}>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: 44,
                    height: "100%",
                    border: "none",
                    outline: "none",
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1C1C1E",
                  }}
                />
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  width: 20,
                  height: "100%",
                  borderLeft: "1px solid #1C1C1E",
                }}>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    style={{
                      flex: 1,
                      border: "none",
                      background: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      borderBottom: "0.5px solid #1C1C1E",
                      padding: 0,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F2F2F7"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                  >
                    +
                  </button>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    style={{
                      flex: 1,
                      border: "none",
                      background: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: 0,
                      opacity: quantity <= 1 ? 0.4 : 1,
                    }}
                    onMouseEnter={e => { if (quantity > 1) e.currentTarget.style.background = "#F2F2F7"; }}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                  >
                    -
                  </button>
                </div>
              </div>

              {/* Stock Count */}
              <span style={{ fontSize: 13, fontWeight: 600, color: "#4CD964" }}>
                {product.stock} Stock
              </span>
            </div>

            {/* Action Buttons Row */}
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
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
                  alert(`${quantity} × ${product.name} (${selectedSize}) added to cart! 🛒`);
                }}
                style={{
                  flex: 1,
                  height: 48,
                  background: "#FF3B30", // Red background matching cart button
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "background 0.2s ease",
                  opacity: product.stock === 0 ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (product.stock > 0) e.currentTarget.style.background = "#E03126"; }}
                onMouseLeave={e => { if (product.stock > 0) e.currentTarget.style.background = "#FF3B30"; }}
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                ADD TO CART
              </button>

              <button
                style={{
                  flex: 1,
                  height: 48,
                  background: "#fff",
                  color: "#1C1C1E",
                  border: "1px solid #D1D1D6",
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#F2F2F7";
                  e.currentTarget.style.borderColor = "#8E8E93";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.borderColor = "#D1D1D6";
                }}
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="#FF3B30" stroke="#FF3B30" strokeWidth={2.5}>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                WISHLIST
              </button>
            </div>

            {/* Description / Additional Info */}
            <div style={{ borderTop: "0.5px solid rgba(0,0,0,0.08)", paddingTop: 20, marginTop: 10 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1C1C1E", margin: "0 0 8px 0" }}>Description</h3>
              <p style={{ fontSize: 14, color: "#3C3C43", lineHeight: 1.5, margin: 0 }}>{product.description}</p>
            </div>
          </div>
        </div>

        {/* CSS styles to make grid responsive */}
        <style>{`
          @media (max-width: 768px) {
            .product-detail-grid {
              grid-template-columns: 1fr !important;
              gap: 24px !important;
            }
            .product-images-gallery {
              flex-direction: column-reverse !important;
            }
            .thumbnails-column {
              flex-direction: row !important;
              width: 100% !important;
              overflow-x: auto;
            }
            .thumbnails-column button {
              width: 60px !important;
              height: 80px !important;
            }
          }
        `}</style>

        {/* Related Products Section */}
        <div className="mt-16 border-t pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="group cursor-pointer"
              >
                <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1595777707802-52b966efb60f?w=400"
                    alt="Related product"
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  />
                </div>
                <h3 className="font-semibold text-gray-900">Related Product {i}</h3>
                <p className="text-blue-600 font-bold">$199.99</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
