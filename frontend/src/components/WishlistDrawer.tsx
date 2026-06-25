"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

const glass = {
  drawer: {
    background: "rgba(250,250,252,0.92)",
    backdropFilter: "blur(40px) saturate(200%)",
    WebkitBackdropFilter: "blur(40px) saturate(200%)",
    borderLeft: "0.5px solid rgba(255,255,255,0.85)",
    boxShadow: "-12px 0 40px rgba(0,0,0,0.15)",
  } as React.CSSProperties,
};

export default function WishlistDrawer({ onClose }: { onClose: () => void }) {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Wait for animation
  };

  const handleMoveToCart = (item: any) => {
    addToCart(item, 1);
    removeFromWishlist(item.id);
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(4px)",
          opacity: mounted && !isClosing ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          ...glass.drawer,
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: "100%", maxWidth: 440, zIndex: 101,
          display: "flex", flexDirection: "column",
          transform: mounted && !isClosing ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "24px 28px", borderBottom: "0.5px solid rgba(0,0,0,0.08)",
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", color: "#1C1C1E" }}>
              Your Wishlist
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#8E8E93" }}>
              {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: "rgba(120,120,128,0.1)", border: "none",
              borderRadius: "50%", width: 36, height: 36, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(120,120,128,0.18)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(120,120,128,0.1)"}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#1C1C1E" strokeWidth={2.5}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {wishlistItems.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", gap: 16, textAlign: "center"
            }}>
              <span style={{ fontSize: 48 }}>❤️</span>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1C1C1E" }}>Your wishlist is empty</h3>
                <p style={{ margin: "4px 0 0", fontSize: 14, color: "#8E8E93" }}>Save your favorite items here.</p>
              </div>
              <button
                onClick={handleClose}
                style={{
                  marginTop: 8, padding: "12px 24px", borderRadius: 14,
                  background: "#1C1C1E", color: "#fff", fontSize: 14, fontWeight: 600,
                  border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {wishlistItems.map((item) => {
                const imgUrl = item.imageUrl || item.image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop";
                const hasDiscount = item.discount && item.discount > 0;
                const finalPrice = hasDiscount ? item.price - (item.price * (item.discount || 0)) / 100 : item.price;

                return (
                  <div key={item.id} style={{
                    display: "flex", gap: 16, background: "rgba(255,255,255,0.6)",
                    padding: 12, borderRadius: 20, border: "0.5px solid rgba(255,255,255,0.8)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
                  }}>
                    <Link href={`/storefront/product/${item.id}`} onClick={handleClose}>
                      <img
                        src={imgUrl}
                        alt={item.name}
                        style={{ width: 80, height: 100, objectFit: "cover", borderRadius: 12, background: "#F2F2F7" }}
                      />
                    </Link>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1C1C1E" }}>{item.name}</h4>
                          <button
                            onClick={() => removeFromWishlist(item.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                          >
                            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth={2}>
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 700, color: "#1C1C1E" }}>
                          Rs. {finalPrice.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleMoveToCart(item)}
                        style={{
                          background: "rgba(0,122,255,0.1)", color: "#007AFF",
                          border: "none", borderRadius: 8, padding: "8px 12px",
                          fontSize: 12, fontWeight: 700, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          marginTop: 12
                        }}
                      >
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                        </svg>
                        Move to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {wishlistItems.length > 0 && (
          <div style={{
            padding: "20px 28px 32px", borderTop: "0.5px solid rgba(0,0,0,0.08)",
            background: "rgba(250,250,252,0.8)", backdropFilter: "blur(20px)"
          }}>
            <button
              onClick={clearWishlist}
              style={{
                width: "100%", padding: "14px", borderRadius: 16,
                background: "rgba(255,59,48,0.1)", color: "#FF3B30",
                fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer",
                transition: "background 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,59,48,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,59,48,0.1)"}
            >
              Clear Wishlist
            </button>
          </div>
        )}
      </div>
    </>
  );
}
