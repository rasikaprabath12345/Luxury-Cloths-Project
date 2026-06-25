import React from "react";
import { glass } from "@/utils/theme";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

// Note: Ensure that we define the Product interface compatible with what's used
export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  image?: string;
  description?: string;
  sizes?: string;
  discount?: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  categoryId?: number;
}

export function ProductSkeleton() {
  return (
    <div style={{ ...glass.card, padding: 0, overflow: "hidden", height: 420 }}
      className="animate-pulse flex flex-col">
      <div style={{ height: 270, background: "rgba(120,120,128,0.08)" }} />
      <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: 14, background: "rgba(120,120,128,0.12)", borderRadius: 8, width: "60%" }} />
        <div style={{ height: 11, background: "rgba(120,120,128,0.08)", borderRadius: 8 }} />
        <div style={{ marginTop: "auto", height: 36, background: "rgba(120,120,128,0.08)", borderRadius: 12 }} />
      </div>
    </div>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  const hasDiscount = product.discount && product.discount > 0;
  const originalPrice = product.price;
  const discountAmount = hasDiscount ? (originalPrice * (product.discount || 0)) / 100 : 0;
  const finalPrice = originalPrice - discountAmount;

  const inWishlist = isInWishlist(product.id);
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  // Split sizes by comma
  const sizesList = product.sizes ? product.sizes.split(",").map(s => s.trim()) : [];

  return (
    <div style={{
      ...glass.card, padding: 0, overflow: "hidden",
      display: "flex", flexDirection: "column", height: 445,
      transition: "transform 0.3s ease, box-shadow 0.3s ease", cursor: "pointer",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = glass.card.boxShadow as string;
      }}>
      <div style={{ position: "relative", height: 260, overflow: "hidden", flexShrink: 0 }}>
        <img
          src={product.imageUrl || product.image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop"}
          alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
          onMouseEnter={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)")}
          onMouseLeave={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")}
        />
        {/* Discount Tag */}
        {hasDiscount && (
          <div style={{
            position: "absolute", top: 12, left: 12,
            background: "#FF3B30", backdropFilter: "blur(8px)",
            borderRadius: 8, padding: "4px 10px",
            boxShadow: "0 2px 8px rgba(255,59,48,0.4)",
            zIndex: 5,
          }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>
              {product.discount}% OFF
            </span>
          </div>
        )}
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          style={{
            position: "absolute", top: 12, right: 12,
            background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
            border: "none", borderRadius: "50%", width: 32, height: 32,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            zIndex: 5, transition: "transform 0.2s, background 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill={inWishlist ? "#FF3B30" : "none"} stroke={inWishlist ? "#FF3B30" : "#1C1C1E"} strokeWidth={2.5}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#007AFF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {product.category?.name || "Premium Collection"}
          </span>
          <h3 style={{
            margin: "4px 0 0", fontSize: 13.5, fontWeight: 700, color: "#1C1C1E",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
          }}>
            {product.name}
          </h3>
          <p style={{
            margin: "2px 0 0", fontSize: 11, color: "#8E8E93",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
          }}>
            {product.description || "Ceylon luxury fabrics and modern fit."}
          </p>

          {/* Sizes */}
          {sizesList.length > 0 && (
            <div style={{ display: "flex", gap: "4px", marginTop: "8px", flexWrap: "wrap" }}>
              {sizesList.map((size, idx) => (
                <span key={idx} style={{
                  fontSize: 9, fontWeight: 700, background: "rgba(120,120,128,0.08)",
                  color: "#48484A", padding: "2px 6px", borderRadius: 4
                }}>
                  {size}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 10, borderTop: "0.5px solid rgba(0,0,0,0.06)", marginTop: "6px"
        }}>
          <div>
            {hasDiscount ? (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 11, textDecoration: "line-through", color: "#8E8E93", lineHeight: 1 }}>
                  Rs. {originalPrice.toLocaleString()}
                </span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#FF3B30", marginTop: 2 }}>
                  Rs. {finalPrice.toLocaleString()}
                </span>
              </div>
            ) : (
              <span style={{ fontSize: 15, fontWeight: 800, color: "#1C1C1E" }}>
                Rs. {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart({
                id: product.id,
                name: product.name,
                price: finalPrice,
                imageUrl: product.imageUrl || product.image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop",
                description: product.description,
              });
              alert(`${product.name} added to cart! 🛒`);
            }}
            style={{
            background: "linear-gradient(135deg, #1C1C1E, #3C3C43)",
            border: "none", borderRadius: 12, padding: "8px 14px",
            fontSize: 11, fontWeight: 600, color: "#fff", cursor: "pointer",
            transition: "background 0.2s, transform 0.1s",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #007AFF, #5856D6)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,122,255,0.3)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #1C1C1E, #3C3C43)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)"; }}>
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
}
