"use client";

import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { glass } from "@/utils/theme";
import { useState } from "react";

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [copied, setCopied] = useState(false);

  const handleMoveToCart = (item: any) => {
    const firstAvailableVariant = item.variants?.find((v: any) => v.stockQuantity > 0) || item.variants?.[0];
    const size = firstAvailableVariant?.size;
    const color = firstAvailableVariant?.color;
    const variantId = firstAvailableVariant?.variantId || firstAvailableVariant?.id;
    const availStock = firstAvailableVariant ? (firstAvailableVariant.stockQuantity - (firstAvailableVariant.reservedQuantity || 0)) : undefined;

    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl || item.image || PLACEHOLDER_IMG,
      description: item.description,
      variants: item.variants,
    } as any, 1, size, color, variantId, availStock);

    removeFromWishlist(item.id);
  };

  const handleAddAllToCart = () => {
    let addedCount = 0;
    wishlistItems.forEach((item) => {
      const firstAvailableVariant = item.variants?.find((v: any) => v.stockQuantity > 0) || item.variants?.[0];
      const size = firstAvailableVariant?.size;
      const color = firstAvailableVariant?.color;
      const variantId = firstAvailableVariant?.variantId || firstAvailableVariant?.id;
      const availStock = firstAvailableVariant ? (firstAvailableVariant.stockQuantity - (firstAvailableVariant.reservedQuantity || 0)) : undefined;

      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl || item.image || PLACEHOLDER_IMG,
        description: item.description,
        variants: item.variants,
      } as any, 1, size, color, variantId, availStock);
      addedCount++;
    });

    if (addedCount > 0) {
      clearWishlist();
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const totalPrice = wishlistItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div style={{
      position: "relative", minHeight: "100vh", background: "#F4F4F6",
      paddingTop: 24, paddingBottom: 80, fontFamily: "var(--font-body)"
    }}>
      {/* Dynamic blurred gold background blobs */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 0, overflow: "hidden", pointerEvents: "none"
      }}>
        <div style={{
          position: "absolute", top: "-15%", right: "-10%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)",
          filter: "blur(50px)",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", left: "-8%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(170,132,28,0.04) 0%, transparent 70%)",
          filter: "blur(50px)",
        }} />
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

        {/* Navigation & Header */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 8, marginBottom: 20,
          borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: 24
        }}>
          <Link href="/storefront/shop" style={{
            display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
            color: "#8E8E93", fontSize: 13, fontWeight: 600,
            transition: "all 0.2s ease"
          }} className="back-link">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Continue Boutique Shopping
          </Link>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20, marginTop: 12 }}>
            <div>
              <p style={{
                margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
                textTransform: "uppercase", color: "#aa841c"
              }}>Boutique Wishlist</p>
              <h1 style={{ margin: 0, fontSize: "clamp(28px, 4.5vw, 38px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#1C1C1E" }}>
                Saved Pieces
              </h1>
            </div>
            {wishlistItems.length > 0 && (
              <button
                onClick={clearWishlist}
                style={{
                  background: "transparent", border: "none", color: "#FF3B30",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 8, transition: "background 0.2s"
                }}
                className="clear-wishlist-btn"
              >
                Clear All Pieces
              </button>
            )}
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          /* Empty Wishlist State Card */
          <div style={{
            ...glass.card, padding: "80px 40px", textAlign: "center",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
            maxWidth: 580, margin: "60px auto", boxShadow: "0 8px 40px rgba(0,0,0,0.04)"
          }}>
            <div style={{
              width: 84, height: 84, borderRadius: "50%",
              background: "rgba(170,132,28,0.06)", border: "1px dashed rgba(170,132,28,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#aa841c", fontSize: 32,
              boxShadow: "inset 0 2px 10px rgba(170,132,28,0.03)"
            }}>
              ♡
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1C1C1E", letterSpacing: "-0.01em" }}>Your Wishlist is Empty</h3>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "#8E8E93", lineHeight: 1.5 }}>
                Save your favorite items here to track their stock status or purchase them later with ease.
              </p>
            </div>
            <Link href="/storefront/shop" style={{
              background: "linear-gradient(135deg, #d4af37 0%, #aa841c 100%)",
              color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700,
              padding: "14px 36px", borderRadius: 14,
              boxShadow: "0 4px 16px rgba(170,132,28,0.2)", transition: "all 0.25s ease",
              letterSpacing: "0.5px", textTransform: "uppercase"
            }} className="explore-btn">
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid-container">

            {/* LEFT COLUMN: WISHLIST ITEMS */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1C1C1E", margin: 0 }}>My Selection</h2>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "#aa841c",
                  background: "rgba(170,132,28,0.06)", border: "0.5px solid rgba(170,132,28,0.18)",
                  padding: "2px 8px", borderRadius: 100
                }}>
                  {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {wishlistItems.map((item) => {
                  const img = item.imageUrl || item.image || PLACEHOLDER_IMG;
                  const isOutOfStock = item.variants && item.variants.length > 0 && item.variants.every((v: any) => v.stockQuantity === 0);

                  return (
                    <div
                      key={item.id}
                      style={{
                        ...glass.card,
                        display: "flex",
                        gap: 16,
                        padding: "12px 18px",
                        border: "1px solid rgba(255,255,255,0.9)",
                        background: "rgba(255,255,255,0.65)"
                      }}
                      className="wishlist-item-card"
                    >
                      {/* Image with hover transition (Compact Size) */}
                      <div style={{
                        position: "relative",
                        flexShrink: 0,
                        borderRadius: 12,
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.06)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                      }} className="wishlist-img-box">
                        <img
                          src={img}
                          alt={item.name}
                          style={{
                            width: 80, height: 100, objectFit: "cover",
                            transition: "transform 0.4s ease-out"
                          }}
                          className="wishlist-item-image"
                        />
                      </div>

                      {/* Info & Action Controls */}
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: "#1C1C1E", lineHeight: 1.3 }}>
                              {item.name}
                            </h3>
                            <p style={{
                              margin: "3px 0 0", fontSize: 11, fontWeight: 700,
                              color: isOutOfStock ? "#FF3B30" : "#34C759"
                            }}>
                              {isOutOfStock ? "Out of Stock" : "In Stock"}
                            </p>
                          </div>

                          <button
                            onClick={() => removeFromWishlist(item.id)}
                            style={{
                              background: "rgba(255,59,48,0.06)", border: "none",
                              width: 28, height: 28, borderRadius: "50%",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              cursor: "pointer", transition: "all 0.2s"
                            }}
                            className="remove-item-btn"
                          >
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth={2.5}>
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: "#1C1C1E", fontFamily: "var(--font-display)" }}>
                            Rs. {item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>

                          <button
                            onClick={() => handleMoveToCart(item)}
                            disabled={isOutOfStock}
                            style={{
                              background: "linear-gradient(135deg, #d4af37 0%, #aa841c 100%)",
                              color: "#fff", border: "none", borderRadius: 8,
                              padding: "6px 14px", fontSize: 11, fontWeight: 700,
                              cursor: "pointer", boxShadow: "0 2px 6px rgba(170,132,28,0.15)",
                              transition: "all 0.2s", opacity: isOutOfStock ? 0.5 : 1
                            }}
                            className="move-cart-btn"
                          >
                            Add to Cart 🛒
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: SUMMARY */}
            <div>
              <div className="wishlist-summary-sticky" style={{
                ...glass.card,
                padding: "20px 24px",
                border: "1px solid rgba(255,255,255,0.9)",
                background: "rgba(255,255,255,0.65)"
              }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1C1C1E", margin: "0 0 16px" }}>Summary</h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: 16, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#8E8E93", fontWeight: 500 }}>Saved Pieces</span>
                    <span style={{ color: "#1C1C1E", fontWeight: 700 }}>{wishlistItems.length}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#8E8E93", fontWeight: 500 }}>Estimated Value</span>
                    <span style={{ color: "#1C1C1E", fontWeight: 700 }}>Rs. {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button
                    onClick={handleAddAllToCart}
                    style={{
                      background: "linear-gradient(135deg, #d4af37 0%, #aa841c 100%)",
                      color: "#fff", border: "none", borderRadius: 12,
                      padding: "12px 20px", fontSize: 12.5, fontWeight: 700,
                      cursor: "pointer", transition: "all 0.25s ease",
                      boxShadow: "0 4px 12px rgba(170,132,28,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      width: "100%", letterSpacing: "0.2px", textTransform: "uppercase"
                    }}
                    className="add-all-cart-btn"
                  >
                    Add All to Cart 👜
                  </button>

                  <Link href="/storefront/shop" style={{
                    background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.04)",
                    borderRadius: 12, padding: "12px 20px", fontSize: 12.5, fontWeight: 700,
                    color: "#555", cursor: "pointer", transition: "all 0.25s ease",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    textDecoration: "none", width: "100%"
                  }} className="continue-shopping-btn">
                    Continue Shopping
                  </Link>
                </div>

                {/* Social sharing links */}
                <div style={{ marginTop: 20, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 16 }}>
                  <p style={{ margin: "0 0 10px", fontSize: 10.5, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Share Your Selection
                  </p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={handleCopyLink}
                      style={{
                        flex: 1, padding: "8px", background: copied ? "rgba(52,199,89,0.08)" : "rgba(142,142,147,0.06)",
                        border: copied ? "1px solid rgba(52,199,89,0.2)" : "1px solid rgba(0,0,0,0.04)",
                        borderRadius: 8, color: copied ? "#34C759" : "#1C1C1E", fontSize: 11, fontWeight: 700,
                        cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      {copied ? "✓ Copied" : "Copy Link 🔗"}
                    </button>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1, padding: "8px", background: "rgba(0,122,255,0.06)",
                        border: "1px solid rgba(0,122,255,0.04)", borderRadius: 8,
                        color: "#007AFF", fontSize: 11, fontWeight: 700, textDecoration: "none",
                        textAlign: "center", transition: "all 0.2s"
                      }}
                    >
                      Facebook
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      <style jsx>{`
        .wishlist-grid-container {
          display: grid;
          grid-template-columns: 5fr 3fr;
          gap: 28px;
          margin-top: 16px;
        }

        .back-link:hover {
          color: #aa841c !important;
          transform: translateX(-2px);
        }

        .clear-wishlist-btn:hover {
          background: rgba(255,59,48,0.06) !important;
        }

        .wishlist-item-card {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s;
        }
        .wishlist-item-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.04);
          border-color: rgba(212,175,55,0.2) !important;
        }

        .wishlist-img-box:hover .wishlist-item-image {
          transform: scale(1.04);
        }

        .remove-item-btn:hover {
          background: rgba(255,59,48,0.12) !important;
          transform: scale(1.05);
        }

        .move-cart-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(170,132,28,0.25) !important;
        }

        .add-all-cart-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(170,132,28,0.25) !important;
        }

        .continue-shopping-btn:hover {
          background: rgba(0,0,0,0.04) !important;
          color: #1C1C1E !important;
        }

        .wishlist-summary-sticky {
          position: sticky;
          top: 120px;
        }

        @media (max-width: 960px) {
          .wishlist-grid-container {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .wishlist-summary-sticky {
            position: static;
          }
        }
      `}</style>
    </div>
  );
}
