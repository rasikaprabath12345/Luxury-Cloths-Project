import React, { useMemo } from "react";
import Link from "next/link";
import { glass } from "@/utils/theme";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { showStorefrontToast } from "@/utils/toast";

export interface Product {
  id: number;
  name: string;
  slug: string;
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
  variants?: {
    id: number;
    size: string;
    color: string;
    stockQuantity: number;
    reservedQuantity?: number;
    variantId?: number;
  }[];
  isChoice?: boolean;
  isSale?: boolean;
  rating?: number;
  soldCount?: number;
  promoText?: string;
  shopperSavingText?: string;
}

export function ProductSkeleton() {
  return (
    <div style={{ ...glass.card, padding: 0, overflow: "hidden", height: 465 }}
      className="animate-pulse flex flex-col">
      <div style={{ height: 260, background: "rgba(120,120,128,0.08)" }} />
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
  const { isAuthenticated } = useAuth();

  // useMemo පාවිච්චි කරලා calculations cache කරලා තියෙනවා.
  // මේකෙන් අනවශ්‍ය විදිහට හැම පාරම calculate වෙන එක නවතිනවා (RAM එක ඉතුරු වෙනවා)
  const productData = useMemo(() => {
    const hasDiscount = product.discount && product.discount > 0;
    const originalPrice = product.price;
    const discountAmount = hasDiscount ? (originalPrice * (product.discount || 0)) / 100 : 0;
    const finalPrice = originalPrice - discountAmount;

    const isOutOfStock = product.variants && product.variants.length > 0
      ? product.variants.every(v => v.stockQuantity <= 0)
      : false;

    const isChoice = product.isChoice ?? false;
    const isSale = product.isSale ?? false;

    const ratingVal = (product.rating !== undefined && product.rating !== null && product.rating > 0)
      ? product.rating
      : (4.0 + (product.id * 7) % 10 / 10);
    const rating = ratingVal.toFixed(1);
    const ratingNum = parseFloat(rating);

    const soldCount = (product.soldCount !== undefined && product.soldCount !== null && product.soldCount > 0)
      ? product.soldCount
      : ((product.id * 17) % 90 + 10) * 10;
    const totalSoldText = soldCount >= 1000 ? `${(soldCount / 1000).toFixed(1)}k+` : `${soldCount}+`;

    const promoOff = Math.round(finalPrice * 0.1);
    const promoMin = Math.round(originalPrice * 1.5);
    const shopperSave = Math.round(finalPrice * 0.05);

    const promoText = product.promoText || `LKR${promoOff.toLocaleString(undefined, { minimumFractionDigits: 2 })} off on LKR${promoMin.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    const shopperSavingText = product.shopperSavingText || `New shoppers save LKR${shopperSave.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    return {
      hasDiscount,
      originalPrice,
      finalPrice,
      isOutOfStock,
      isChoice,
      isSale,
      rating,
      ratingNum,
      totalSoldText,
      promoText,
      shopperSavingText
    };
  }, [product]); // product object එක වෙනස් වුණොත් විතරක් ආයෙ calculate වෙනවා.

  const inWishlist = isInWishlist(product.id);
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      showStorefrontToast("Please login or signup to add items to your wishlist.", "info");
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 1500);
      return;
    }
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Link href={`/storefront/product/${product.slug}`} style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        ...glass.card, padding: 0, overflow: "hidden",
        display: "flex", flexDirection: "column", height: 465,
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
          {productData.hasDiscount && !productData.isOutOfStock && (
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

          {/* Out of Stock Badge */}
          {productData.isOutOfStock && (
            <div style={{
              position: "absolute", top: 12, left: 12,
              background: "#FF3B30", backdropFilter: "blur(8px)",
              borderRadius: 8, padding: "4px 10px",
              boxShadow: "0 2px 8px rgba(255,59,48,0.4)",
              zIndex: 5,
            }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", textTransform: "uppercase" }}>
                Out of Stock
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
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>

            {/* Badges + Title */}
            <h3 style={{
              margin: 0, fontSize: 13.5, fontWeight: 700, color: "#1C1C1E",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: "6px"
            }}>
              {productData.isChoice && (
                <span style={{
                  background: "#FFD60A", color: "#000", fontSize: 9, fontWeight: 800,
                  padding: "2px 6px", borderRadius: 4, textTransform: "uppercase", flexShrink: 0
                }}>Choice</span>
              )}
              {productData.isSale && (
                <span style={{
                  background: "#FF2D55", color: "#fff", fontSize: 9, fontWeight: 800,
                  padding: "2px 6px", borderRadius: 4, textTransform: "uppercase", flexShrink: 0
                }}>Sale</span>
              )}
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {product.name}
              </span>
            </h3>

            {/* Price display row */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", flexWrap: "wrap", marginTop: "1px" }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#FF2D55" }}>
                LKR {productData.finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {productData.hasDiscount && (
                <span style={{ fontSize: 11, textDecoration: "line-through", color: "#8E8E93" }}>
                  LKR {productData.originalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>

            {/* Rating & Sold Row */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#1C1C1E", fontSize: 10, display: "flex", gap: "1px" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>{i < Math.round(productData.ratingNum) ? "★" : "☆"}</span>
                ))}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#1C1C1E" }}>
                {productData.rating}
              </span>
              <span style={{ fontSize: 11, color: "#E5E5EA" }}>|</span>
              <span style={{ fontSize: 11, color: "#8E8E93" }}>
                {productData.totalSoldText} sold
              </span>
            </div>

            {/* Promo & Shopper Discount Tags */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "2px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{
                  background: "rgba(255, 45, 85, 0.1)", color: "#FF2D55", fontSize: 9,
                  fontWeight: 800, padding: "1px 5px", borderRadius: 3, display: "inline-flex",
                  alignItems: "center", height: 14
                }}>
                  %
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#FF2D55" }}>
                  {productData.promoText}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: 10, display: "inline-flex", alignItems: "center", height: 14 }}>⚡</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#D19600" }}>
                  {productData.shopperSavingText}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Button Row */}
          <div style={{
            paddingTop: 10, borderTop: "0.5px solid rgba(0,0,0,0.06)", marginTop: "6px"
          }}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (productData.isOutOfStock) return;
                if (!isAuthenticated) {
                  showStorefrontToast("Please login or signup to add items to your cart.", "info");
                  setTimeout(() => {
                    window.location.href = "/auth/login";
                  }, 1500);
                  return;
                }

                const firstAvailableVariant = product.variants?.find((v: any) => v.stockQuantity > 0) || product.variants?.[0];
                const size = firstAvailableVariant?.size;
                const color = firstAvailableVariant?.color;
                const variantId = firstAvailableVariant?.variantId || firstAvailableVariant?.id;
                const availStock = firstAvailableVariant ? (firstAvailableVariant.stockQuantity - (firstAvailableVariant.reservedQuantity || 0)) : undefined;

                addToCart({
                  id: product.id,
                  name: product.name,
                  price: productData.finalPrice,
                  imageUrl: product.imageUrl || product.image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop",
                  description: product.description,
                  variants: product.variants,
                } as any, 1, size, color, variantId, availStock);

                showStorefrontToast(`${product.name} added to cart! 🛒`, "success");
              }}
              disabled={productData.isOutOfStock}
              style={{
                width: "100%",
                background: productData.isOutOfStock ? "#e2e8f0" : "linear-gradient(135deg, #1C1C1E, #3C3C43)",
                border: "none", borderRadius: 10, padding: "8px 14px",
                fontSize: 11, fontWeight: 600,
                color: productData.isOutOfStock ? "#94a3b8" : "#fff",
                cursor: productData.isOutOfStock ? "not-allowed" : "pointer",
                transition: "background 0.2s, transform 0.1s",
                boxShadow: productData.isOutOfStock ? "none" : "0 2px 8px rgba(0,0,0,0.12)",
              }}
              onMouseEnter={e => { if (!productData.isOutOfStock) { (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #007AFF, #5856D6)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,122,255,0.3)"; } }}
              onMouseLeave={e => { if (!productData.isOutOfStock) { (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #1C1C1E, #3C3C43)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)"; } }}>
              {productData.isOutOfStock ? "Sold Out" : "Add to Bag"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}