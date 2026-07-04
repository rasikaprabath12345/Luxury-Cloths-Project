"use client";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { showStorefrontToast } from "@/utils/toast";
import axios from "axios";

export default function CartDrawer({ onClose }: { onClose: () => void }) {
    const { cartItems, updateQuantity, removeFromCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const router = useRouter();
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [liveStockMap, setLiveStockMap] = useState<Record<number, number>>({});

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    // Fetch live stock for all cart items on mount/cart change
    useEffect(() => {
        if (cartItems.length === 0) return;
        const uniqueProductIds = [...new Set(cartItems.map((item) => item.id))];
        
        uniqueProductIds.forEach((productId) => {
            axios.get(`http://localhost:5226/api/Stock/${productId}`)
                .then((res) => {
                    const variants = res.data?.variants || [];
                    const stockUpdates: Record<number, number> = {};
                    variants.forEach((v: { variantId: number; availableStock: number }) => {
                        stockUpdates[v.variantId] = v.availableStock;
                    });
                    setLiveStockMap(prev => ({ ...prev, ...stockUpdates }));
                })
                .catch((err) => {
                    console.error("Failed to load live stock in CartDrawer:", err);
                });
        });
    }, [cartItems]);

    const totalPrice = cartItems.reduce(
        (acc, item: any) => acc + item.price * (item.quantity || 1),
        0
    );
    const totalItems = cartItems.reduce(
        (acc, item: any) => acc + (item.quantity || 1),
        0
    );

    const handleRemove = (id: number, size?: string, color?: string) => {
        const itemKey = `${id}-${size || ''}-${color || ''}`;
        setRemovingId(itemKey);
        setTimeout(() => {
            removeFromCart(id, size, color);
            setRemovingId(null);
        }, 350);
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) return;
        onClose();
        router.push("/storefront/checkout");
    };

    const getItemKey = (item: any) => `${item.id}-${item.size || ''}-${item.color || ''}`;

    // Selection state for checkboxes
    const [selectedItems, setSelectedItems] = useState<string[]>(cartItems.map(getItemKey));

    useEffect(() => {
        // Automatically sync selected items when cart items change
        setSelectedItems(prev => {
            const currentKeys = cartItems.map(getItemKey);
            return prev.filter(k => currentKeys.includes(k));
        });
    }, [cartItems]);

    const toggleSelection = (key: string) => {
        setSelectedItems(prev => prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key]);
    };

    const toggleAll = () => {
        if (selectedItems.length === cartItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map(getItemKey));
        }
    };

    const handleDeleteSelected = () => {
        if (selectedItems.length === 0) {
            showStorefrontToast("No items selected to delete", "error");
            return;
        }
        cartItems.forEach(item => {
            const itemKey = getItemKey(item);
            if (selectedItems.includes(itemKey)) {
                removeFromCart(item.id, item.size, item.color);
            }
        });
        setSelectedItems([]);
        showStorefrontToast("Selected items removed from cart", "success");
    };

    const selectedCartItems = cartItems.filter((i: any) => selectedItems.includes(getItemKey(i)));

    const itemsTotal = selectedCartItems.reduce((acc, item: any) => acc + (item.price * 1.5) * (item.quantity || 1), 0); // Fake original price
    const subtotal = selectedCartItems.reduce((acc, item: any) => acc + item.price * (item.quantity || 1), 0);
    const itemsDiscount = itemsTotal - subtotal;

    return (
        <div
            className="cart-overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="cart-drawer-full ali-style-cart"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <div
                    className="ali-cart-body"
                    onClick={(e) => e.target === e.currentTarget && onClose()}
                >
                    {cartItems.length === 0 ? (
                        <div className="cart-empty-full">
                            <div className="cart-empty-icon">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <path d="M16 10a4 4 0 01-8 0" />
                                </svg>
                            </div>
                            <h3 className="cart-empty-title">Your cart is empty</h3>
                            <button onClick={onClose} className="cart-continue-btn">
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="ali-cart-grid">

                            {/* LEFT COLUMN */}
                            <div className="ali-cart-left">
                                {/* Top Cart Header Card */}
                                <div className="ali-card ali-cart-header-card">
                                    <h2 className="ali-cart-title">Cart ({cartItems.length})</h2>
                                    <div className="ali-select-all-row">
                                        <label className="ali-checkbox-label">
                                            <input
                                                type="checkbox"
                                                className="ali-checkbox"
                                                checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                                                onChange={toggleAll}
                                            />
                                            <span className="ali-checkbox-text">Select all items</span>
                                        </label>
                                        <button className="ali-delete-selected-btn" onClick={handleDeleteSelected}>Delete selected items</button>
                                    </div>
                                    <div className="ali-brand-day-banner">
                                        <span className="ali-banner-logo">Brand<em>Day</em></span>
                                        <span className="ali-banner-text">Ends: Jun 27, 12:29 (GMT+5.5)</span>
                                        <span className="ali-banner-arrow">&gt;</span>
                                    </div>
                                </div>

                                {/* Seller Group Card */}
                                <div className="ali-card ali-seller-card">
                                    <div className="ali-seller-header">
                                        <label className="ali-checkbox-label">
                                            <input type="checkbox" className="ali-checkbox" readOnly checked={selectedItems.length > 0} />
                                            <span className="ali-checkbox-text bold-text">Shipped by global sellers</span>
                                        </label>
                                        <svg className="ali-info-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="16" x2="12" y2="12" />
                                            <line x1="12" y1="8" x2="12.01" y2="8" />
                                        </svg>
                                    </div>

                                    <div className="ali-items-list">
                                        {cartItems.map((item: any) => {
                                            const itemImg = item.imageUrl || item.image || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop";
                                            const itemQuantity = item.quantity || 1;
                                            const originalPrice = item.price * 1.5; // fake original price
                                            const itemKey = getItemKey(item);
                                            const isSelected = selectedItems.includes(itemKey);

                                            // Derive live stock levels
                                            const liveStock = item.variantId !== undefined && liveStockMap[item.variantId] !== undefined
                                                ? liveStockMap[item.variantId]
                                                : item.availableStock;

                                            const isOutOfStock = liveStock !== undefined && liveStock <= 0;

                                            return (
                                                <div key={itemKey} className="ali-item-row" style={{ opacity: removingId === itemKey ? 0.3 : 1, transition: "opacity 0.3s" }}>
                                                    <input
                                                        type="checkbox"
                                                        className="ali-checkbox item-checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelection(itemKey)}
                                                    />

                                                    <div className="ali-item-img-container">
                                                        <img src={itemImg} alt={item.name} className="ali-item-img" />
                                                        {liveStock !== undefined && liveStock <= 5 && liveStock > 0 && (
                                                            <div className="ali-item-img-overlay">Only {liveStock} left</div>
                                                        )}
                                                        {isOutOfStock && (
                                                            <div className="ali-item-img-overlay" style={{ background: "rgba(255, 59, 48, 0.85)" }}>Sold Out</div>
                                                        )}
                                                    </div>

                                                    <div className="ali-item-details">
                                                        <div className="ali-item-title-row">
                                                            <h4 className="ali-item-title">{item.name}</h4>
                                                            <div className="ali-item-actions">
                                                                <button
                                                                    className="ali-action-btn"
                                                                    onClick={() => {
                                                                        if (isInWishlist(item.id)) {
                                                                            removeFromWishlist(item.id);
                                                                        } else {
                                                                            addToWishlist(item);
                                                                        }
                                                                    }}
                                                                    title={isInWishlist(item.id) ? "Remove from wishlist" : "Add to wishlist"}
                                                                >
                                                                    <svg
                                                                        width="18"
                                                                        height="18"
                                                                        viewBox="0 0 24 24"
                                                                        fill={isInWishlist(item.id) ? "#e5103a" : "none"}
                                                                        stroke={isInWishlist(item.id) ? "#e5103a" : "currentColor"}
                                                                        strokeWidth="2"
                                                                    >
                                                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                                                    </svg>
                                                                </button>
                                                                <button className="ali-action-btn" onClick={() => handleRemove(item.id, item.size, item.color)}>
                                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="ali-item-variant">
                                                            {item.size ? `Size: ${item.size}` : 'Standard / Luxury'} {item.color && `· Color: ${item.color}`} <span className="ali-chevron">&gt;</span>
                                                        </div>

                                                        <div className="ali-item-price-row">
                                                            <div className="ali-price-block">
                                                                <span className="ali-current-price">LKR {(item.price).toLocaleString()}</span>
                                                                <span className="ali-original-price">LKR {originalPrice.toLocaleString()}</span>
                                                                <span className="ali-discount-tag">Save LKR {(originalPrice - item.price).toLocaleString()}</span>
                                                            </div>
                                                            <div className="ali-qty-controls">
                                                                <button className="ali-qty-btn" disabled={itemQuantity <= 1 || isOutOfStock} onClick={() => updateQuantity(item.id, itemQuantity - 1, item.size, item.color)}>−</button>
                                                                <span className="ali-qty-val">{itemQuantity}</span>
                                                                <button className="ali-qty-btn" disabled={isOutOfStock || (liveStock !== undefined && itemQuantity >= liveStock)} onClick={() => updateQuantity(item.id, itemQuantity + 1, item.size, item.color)}>+</button>
                                                            </div>
                                                        </div>

                                                        <div className="ali-item-shipping">Free shipping</div>
                                                        <div className="ali-item-store">Luxury Flagship Store</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN */}
                            <div className="ali-cart-right">
                                <div className="ali-summary-card">
                                    <h2 className="ali-summary-title">Summary</h2>

                                    {selectedCartItems.length > 0 && (
                                        <div className="ali-summary-thumbnails">
                                            {selectedCartItems.slice(0, 4).map((item: any) => (
                                                <img key={item.id} src={item.imageUrl || item.image} alt="thumb" className="ali-thumb" />
                                            ))}
                                            {selectedCartItems.length > 4 && <span className="ali-thumb-more">+{selectedCartItems.length - 4}</span>}
                                        </div>
                                    )}

                                    <div className="ali-summary-rows">
                                        <div className="ali-summary-row">
                                            <span>Items total</span>
                                            <span>LKR {itemsTotal.toLocaleString()}</span>
                                        </div>
                                        <div className="ali-summary-row">
                                            <span>Items discount</span>
                                            <span className="ali-red-text">- LKR {itemsDiscount.toLocaleString()}</span>
                                        </div>
                                        <div className="ali-summary-row ali-subtotal-row">
                                            <span>Subtotal</span>
                                            <span>LKR {subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="ali-summary-row ali-shipping-row">
                                            <span>Shipping</span>
                                            <span>Free</span>
                                        </div>
                                        <div className="ali-summary-row ali-total-row">
                                            <span>Estimated total</span>
                                            <span className="ali-huge-total">LKR {subtotal.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <button className="ali-checkout-btn" onClick={handleCheckout}>
                                        Checkout ({selectedItems.length})
                                    </button>
                                </div>

                                <div className="ali-payment-card">
                                    <h3 className="ali-payment-title">Pay with</h3>
                                    <div className="ali-payment-icons">
                                        {/* Mock payment icons */}
                                        <div className="ali-pay-icon" style={{ color: '#1a1f71', fontWeight: 800 }}>VISA</div>
                                        <div className="ali-pay-icon" style={{ background: 'linear-gradient(to right, #eb001b, #f79e1b)', WebkitBackgroundClip: 'text', color: 'transparent', fontWeight: 800 }}>MC</div>
                                        <div className="ali-pay-icon" style={{ color: '#00457c', fontWeight: 800 }}>AMEX</div>
                                    </div>
                                </div>

                                <div className="ali-protection-card">
                                    <h3 className="ali-payment-title">Buyer protection</h3>
                                    <div className="ali-protection-content">
                                        <svg className="ali-check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span>Get a full refund if the item is not as described or not delivered</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                /* ===== FULL SCREEN OVERLAY ===== */
                .cart-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 40; /* Below Navbar z-index (50) */
                    background: #f5f5f5; /* Grey background matching image */
                    overflow: hidden;
                    padding-top: 130px; /* Offset for the fixed Navbar */
                    animation: overlayIn 0.2s ease forwards;
                }

                .cart-drawer-full.ali-style-cart {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    overflow: hidden;
                }
                /* ===== BODY LAYOUT ===== */
                .ali-cart-body {
                    flex: 1;
                    width: 100%;
                    padding: 16px 20px;
                    overflow-y: auto;
                    scrollbar-width: thin; /* Firefox */
                    scrollbar-color: rgba(0, 0, 0, 0.15) transparent; /* Firefox */
                }
                .ali-cart-body::-webkit-scrollbar {
                    width: 6px;
                }
                .ali-cart-body::-webkit-scrollbar-track {
                    background: transparent;
                }
                .ali-cart-body::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.15);
                    border-radius: 3px;
                }
                .ali-cart-body::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.3);
                }

                .ali-cart-grid {
                    display: flex;
                    gap: 16px;
                    align-items: flex-start;
                    max-width: 1200px;
                    margin: 0 auto;
                    width: 100%;
                }

                /* LEFT COLUMN */
                .ali-cart-left {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                /* CARDS */
                .ali-card {
                    background: #fff;
                    border-radius: 8px;
                    padding: 16px;
                }

                /* HEADER CARD */
                .ali-cart-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #222;
                    margin: 0 0 12px 0;
                }
                .ali-select-all-row {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 12px;
                }
                .ali-checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                }
                .ali-checkbox {
                    width: 18px;
                    height: 18px;
                    accent-color: #e5103a;
                    cursor: pointer;
                }
                .ali-checkbox-text {
                    font-size: 14px;
                    color: #222;
                }
                .bold-text {
                    font-weight: 700;
                }
                .ali-delete-selected-btn {
                    background: none;
                    border: none;
                    color: #0b5ed7;
                    font-size: 14px;
                    cursor: pointer;
                }
                .ali-delete-selected-btn:hover {
                    text-decoration: underline;
                }

                .ali-brand-day-banner {
                    background: #0066ff;
                    border-radius: 6px;
                    padding: 8px 12px;
                    display: flex;
                    align-items: center;
                    color: #fff;
                    font-size: 13px;
                    cursor: pointer;
                }
                .ali-banner-logo {
                    font-weight: 800;
                    margin-right: 12px;
                    font-size: 14px;
                }
                .ali-banner-logo em {
                    font-style: italic;
                    color: #ffd700;
                }
                .ali-banner-text {
                    font-weight: 600;
                    flex: 1;
                }
                .ali-banner-arrow {
                    font-weight: bold;
                }

                /* SELLER CARD */
                .ali-seller-card {
                    padding: 0;
                }
                .ali-seller-header {
                    padding: 12px 16px;
                    border-bottom: 1px solid #f0f0f0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .ali-info-icon {
                    color: #999;
                    cursor: pointer;
                }
                .ali-items-list {
                    display: flex;
                    flex-direction: column;
                }
                .ali-item-row {
                    display: flex;
                    padding: 16px;
                    gap: 12px;
                    border-bottom: 1px solid #f0f0f0;
                }
                .ali-item-row:last-child {
                    border-bottom: none;
                }
                .item-checkbox {
                    margin-top: 30px;
                }

                /* ITEM IMAGE */
                .ali-item-img-container {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    border-radius: 6px;
                    overflow: hidden;
                    background: #f9f9f9;
                    flex-shrink: 0;
                }
                .ali-item-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .ali-item-img-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0,0,0,0.6);
                    color: #fff;
                    font-size: 10px;
                    text-align: center;
                    padding: 1px 0;
                }

                /* ITEM DETAILS */
                .ali-item-details {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .ali-item-title-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 12px;
                }
                .ali-item-title {
                    font-size: 13px;
                    color: #222;
                    margin: 0;
                    line-height: 1.4;
                    font-weight: 500;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .ali-item-actions {
                    display: flex;
                    gap: 10px;
                }
                .ali-action-btn {
                    background: none;
                    border: none;
                    color: #999;
                    cursor: pointer;
                    padding: 0;
                }
                .ali-action-btn:hover {
                    color: #222;
                }

                .ali-item-variant {
                    font-size: 11px;
                    color: #999;
                    margin-top: 4px;
                    background: #f7f7f7;
                    display: inline-block;
                    padding: 1px 4px;
                    border-radius: 4px;
                    align-self: flex-start;
                }
                .ali-chevron {
                    margin-left: 4px;
                    font-size: 9px;
                }

                .ali-item-price-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-top: 8px;
                }
                .ali-price-block {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 6px;
                }
                .ali-current-price {
                    font-size: 15px;
                    font-weight: 700;
                    color: #222;
                }
                .ali-original-price {
                    font-size: 11px;
                    color: #999;
                    text-decoration: line-through;
                }
                .ali-discount-tag {
                    font-size: 10px;
                    color: #e5103a;
                    background: #ffebee;
                    padding: 1px 4px;
                    border-radius: 10px;
                    font-weight: 600;
                }

                /* QTY CONTROLS */
                .ali-qty-controls {
                    display: flex;
                    align-items: center;
                    border: 1px solid #ddd;
                    border-radius: 14px;
                    overflow: hidden;
                    height: 24px;
                }
                .ali-qty-btn {
                    background: #fff;
                    border: none;
                    width: 24px;
                    height: 100%;
                    font-size: 14px;
                    cursor: pointer;
                    color: #666;
                }
                .ali-qty-btn:hover {
                    background: #f0f0f0;
                }
                .ali-qty-val {
                    font-size: 12px;
                    width: 24px;
                    text-align: center;
                    font-weight: 600;
                    border-left: 1px solid #ddd;
                    border-right: 1px solid #ddd;
                    line-height: 24px;
                    color: #222;
                    background: #fff;
                }

                .ali-item-shipping {
                    font-size: 11px;
                    color: #999;
                    margin-top: 4px;
                }
                .ali-item-store {
                    font-size: 11px;
                    color: #999;
                    margin-top: 1px;
                }

                /* RIGHT COLUMN */
                .ali-cart-right {
                    width: 320px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    position: sticky;
                    top: 0;
                }
                
                .ali-summary-card, .ali-payment-card, .ali-protection-card {
                    background: #fff;
                    border-radius: 8px;
                    padding: 16px;
                }

                .ali-summary-title {
                    font-size: 16px;
                    font-weight: 700;
                    margin: 0 0 12px 0;
                    color: #222;
                }
                
                .ali-summary-thumbnails {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 12px;
                }
                .ali-thumb {
                    width: 36px;
                    height: 36px;
                    border-radius: 4px;
                    object-fit: cover;
                    border: 1px solid #eee;
                }
                .ali-thumb-more {
                    width: 36px;
                    height: 36px;
                    border-radius: 4px;
                    background: #f0f0f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    color: #666;
                }

                .ali-summary-rows {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                .ali-summary-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: #666;
                }
                .ali-red-text {
                    color: #e5103a;
                }
                .ali-subtotal-row {
                    color: #222;
                    font-weight: 700;
                }
                .ali-shipping-row {
                    color: #222;
                    font-weight: 700;
                }
                .ali-total-row {
                    margin-top: 6px;
                    align-items: center;
                }
                .ali-total-row span:first-child {
                    color: #222;
                    font-weight: 700;
                    font-size: 13px;
                }
                .ali-huge-total {
                    font-size: 18px;
                    font-weight: 800;
                    color: #222;
                }

                .ali-checkout-btn {
                    width: 100%;
                    background: #e5103a;
                    color: #fff;
                    border: none;
                    border-radius: 20px;
                    padding: 10px;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .ali-checkout-btn:hover {
                    background: #c90e33;
                }

                .ali-payment-title {
                    font-size: 13px;
                    font-weight: 700;
                    margin: 0 0 10px 0;
                    color: #222;
                }
                .ali-payment-icons {
                    display: flex;
                    gap: 10px;
                }
                .ali-pay-icon {
                    background: #f9f9f9;
                    padding: 3px 6px;
                    border-radius: 4px;
                    border: 1px solid #eee;
                    font-size: 11px;
                }

                .ali-protection-content {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    font-size: 12px;
                    color: #222;
                    line-height: 1.4;
                }
                .ali-check-icon {
                    margin-top: 2px;
                    flex-shrink: 0;
                }

                /* EMPTY STATE */
                .cart-empty-full {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    background: #fff;
                    border-radius: 8px;
                    max-width: 1200px;
                    margin: 0 auto;
                    width: 100%;
                }
                .cart-empty-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: #f5f5f5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #ccc;
                    margin-bottom: 16px;
                }
                .cart-empty-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #222;
                    margin: 0 0 16px 0;
                }
                .cart-continue-btn {
                    padding: 10px 28px;
                    background: #e5103a;
                    color: #fff;
                    border: none;
                    border-radius: 18px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                }

                @keyframes overlayIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @media (max-width: 900px) {
                    .ali-cart-grid {
                        flex-direction: column;
                    }
                    .ali-cart-right {
                        width: 100%;
                        position: static;
                    }
                }
            `}</style>
        </div>
    );
}