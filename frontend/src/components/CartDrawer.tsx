"use client";

import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartDrawer({ onClose }: { onClose: () => void }) {
    const { cartItems, updateQuantity, removeFromCart } = useCart();
    const router = useRouter();
    const [removingId, setRemovingId] = useState<number | null>(null);

    const totalPrice = cartItems.reduce(
        (acc, item: any) => acc + item.price * (item.quantity || 1),
        0
    );
    const totalItems = cartItems.reduce(
        (acc, item: any) => acc + (item.quantity || 1),
        0
    );

    const handleRemove = (id: number) => {
        setRemovingId(id);
        setTimeout(() => {
            removeFromCart(id);
            setRemovingId(null);
        }, 350);
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) return;
        onClose();
        router.push("/storefront/checkout");
    };

    return (
        <div
            className="cart-overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="cart-drawer-full">
                {/* Header */}
                <div className="cart-header">
                    <div className="cart-header-left">
                        <div className="cart-icon-wrap">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 01-8 0" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="cart-title">Your Cart</h2>
                            <p className="cart-subtitle">{totalItems} {totalItems === 1 ? "item" : "items"} selected</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="cart-close-btn" aria-label="Close cart">
                        <span className="close-text">Back to Shop</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="cart-body-layout">
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
                            <p className="cart-empty-sub">Add luxury items to get started</p>
                            <button onClick={onClose} className="cart-continue-btn">
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="cart-grid">
                            {/* Left Side: Items List */}
                            <div className="cart-items-column">
                                <div className="cart-items-list-full">
                                    {cartItems.map((item: any) => {
                                        const itemImg =
                                            item.imageUrl ||
                                            item.image ||
                                            "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop";
                                        const itemQuantity = item.quantity || 1;
                                        const isRemoving = removingId === item.id;

                                        return (
                                            <div
                                                key={item.id}
                                                className={`cart-item-full ${isRemoving ? "cart-item-removing" : ""}`}
                                            >
                                                {/* Image */}
                                                <div className="cart-item-img-wrap-full">
                                                    <img
                                                        src={itemImg}
                                                        className="cart-item-img-full"
                                                        alt={item.name}
                                                    />
                                                    <span className="cart-item-badge-full">{itemQuantity}</span>
                                                </div>

                                                {/* Details */}
                                                <div className="cart-item-details-full">
                                                    <div className="cart-item-meta-row">
                                                        <h4 className="cart-item-name-full">{item.name}</h4>
                                                        {/* Remove Button */}
                                                        <button
                                                            className="cart-remove-btn-full"
                                                            onClick={() => handleRemove(item.id)}
                                                            aria-label="Remove item"
                                                        >
                                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <polyline points="3 6 5 6 21 6" />
                                                                <path d="M19 6l-1 14H6L5 6" />
                                                                <path d="M10 11v6M14 11v6" />
                                                                <path d="M9 6V4h6v2" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    
                                                    {item.size && (
                                                        <span className="cart-item-size-full">Size: {item.size}</span>
                                                    )}
                                                    
                                                    <div className="cart-item-footer-row">
                                                        {/* Quantity Controls */}
                                                        <div className="cart-qty-controls-full">
                                                            <button
                                                                className="cart-qty-btn-full"
                                                                onClick={() => updateQuantity(item.id, itemQuantity - 1)}
                                                                aria-label="Decrease"
                                                            >
                                                                −
                                                            </button>
                                                            <span className="cart-qty-value-full">{itemQuantity}</span>
                                                            <button
                                                                className="cart-qty-btn-full"
                                                                onClick={() => updateQuantity(item.id, itemQuantity + 1)}
                                                                aria-label="Increase"
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        <div className="cart-price-block">
                                                            <span className="cart-item-unit-price-full">
                                                                Rs. {item.price.toLocaleString()} each
                                                            </span>
                                                            <p className="cart-item-subtotal-full">
                                                                Rs. {(item.price * itemQuantity).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right Side: Order Summary & Checkout */}
                            <div className="cart-summary-column">
                                <div className="cart-summary-card-full">
                                    <h3 className="summary-card-title">Order Summary</h3>
                                    
                                    <div className="summary-card-details">
                                        <div className="summary-row-full">
                                            <span className="label">Subtotal</span>
                                            <span className="value">Rs. {totalPrice.toLocaleString()}</span>
                                        </div>
                                        <div className="summary-row-full">
                                            <span className="label">Estimated Shipping</span>
                                            <span className="value free-shipping">FREE</span>
                                        </div>
                                        <div className="summary-divider-full" />
                                        <div className="summary-row-full total-row">
                                            <span className="label">Total Amount</span>
                                            <span className="value grand-total">Rs. {totalPrice.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        className="cart-checkout-btn-full"
                                    >
                                        <span>Proceed to Checkout</span>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </button>

                                    <button onClick={onClose} className="cart-back-shop-btn">
                                        ← Continue Shopping
                                    </button>

                                    <div className="trust-badges-row">
                                        <span className="badge-item">🛡️ Secure checkout</span>
                                        <span className="badge-item">✨ Premium quality</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                /* ===== PREMIUM LIGHT FULL SCREEN OVERLAY ===== */
                .cart-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(12px);
                    animation: overlayIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                /* ===== PREMIUM LIGHT CONTAINER ===== */
                .cart-drawer-full {
                    width: 100vw;
                    height: 100vh;
                    background: linear-gradient(135deg, #fbfbfd 0%, #f5f5f7 100%);
                    display: flex;
                    flex-direction: column;
                    animation: drawerSlideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                    color: #1d1d1f;
                }

                /* ===== HEADER ===== */
                .cart-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 24px 40px;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
                    background: rgba(255, 255, 255, 0.6);
                    flex-shrink: 0;
                }
                .cart-header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .cart-icon-wrap {
                    width: 46px;
                    height: 46px;
                    background: linear-gradient(135deg, #d4af37, #aa841c);
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    box-shadow: 0 4px 15px rgba(212, 175, 55, 0.25);
                    flex-shrink: 0;
                }
                .cart-title {
                    font-size: 22px;
                    font-weight: 800;
                    color: #1d1d1f;
                    letter-spacing: -0.5px;
                    margin: 0;
                }
                .cart-subtitle {
                    font-size: 13px;
                    color: #aa841c;
                    margin: 2px 0 0;
                    font-weight: 600;
                }
                .cart-close-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 20px;
                    border-radius: 12px;
                    background: rgba(0, 0, 0, 0.03);
                    border: 1px solid rgba(0, 0, 0, 0.06);
                    color: #444;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 13px;
                    transition: all 0.25s ease;
                }
                .cart-close-btn:hover {
                    background: #1d1d1f;
                    color: #fff;
                    border-color: #1d1d1f;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }
                .cart-close-btn:hover .close-text {
                    color: #fff;
                }
                .close-text {
                    color: #555;
                    transition: color 0.25s ease;
                }

                /* ===== BODY LAYOUT ===== */
                .cart-body-layout {
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                /* ===== TWO COLUMN GRID ===== */
                .cart-grid {
                    display: grid;
                    grid-template-columns: 1.4fr 1fr;
                    height: 100%;
                    max-width: 1300px;
                    width: 100%;
                    margin: 0 auto;
                    padding: 40px;
                    gap: 40px;
                    overflow: hidden;
                }

                /* ===== LEFT COLUMN: ITEMS ===== */
                .cart-items-column {
                    overflow-y: auto;
                    padding-right: 15px;
                    height: 100%;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
                }
                .cart-items-column::-webkit-scrollbar {
                    width: 5px;
                }
                .cart-items-column::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 10px;
                }
                .cart-items-list-full {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                /* ===== PREMIUM LIGHT ITEM ROW ===== */
                .cart-item-full {
                    display: flex;
                    gap: 20px;
                    background: #ffffff;
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    border-radius: 20px;
                    padding: 20px;
                    transition: all 0.3s ease;
                    animation: itemFadeInUp 0.35s ease forwards;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.015);
                }
                .cart-item-full:hover {
                    background: #fafafa;
                    border-color: rgba(212, 175, 55, 0.3);
                    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.03);
                }
                .cart-item-removing {
                    opacity: 0;
                    transform: scale(0.95) translateY(-10px);
                }

                /* Image Box */
                .cart-item-img-wrap-full {
                    position: relative;
                    flex-shrink: 0;
                }
                .cart-item-img-full {
                    width: 90px;
                    height: 110px;
                    object-fit: cover;
                    border-radius: 14px;
                    border: 1px solid rgba(0, 0, 0, 0.06);
                }
                .cart-item-badge-full {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: #1d1d1f;
                    color: #fff;
                    font-size: 11px;
                    font-weight: 800;
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
                }

                /* Info box */
                .cart-item-details-full {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-width: 0;
                }
                .cart-item-meta-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 12px;
                }
                .cart-item-name-full {
                    font-size: 16px;
                    font-weight: 700;
                    color: #1d1d1f;
                    margin: 0;
                    line-height: 1.3;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .cart-item-size-full {
                    font-size: 12px;
                    color: #666;
                    background: rgba(0, 0, 0, 0.04);
                    border: 1px solid rgba(0, 0, 0, 0.06);
                    padding: 3px 10px;
                    border-radius: 6px;
                    align-self: flex-start;
                    margin-top: 6px;
                    font-weight: 600;
                }
                .cart-item-footer-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 14px;
                }

                /* Quantity */
                .cart-qty-controls-full {
                    display: flex;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.03);
                    border: 1px solid rgba(0, 0, 0, 0.06);
                    border-radius: 10px;
                    overflow: hidden;
                }
                .cart-qty-btn-full {
                    width: 32px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    color: #555;
                    cursor: pointer;
                    background: transparent;
                    border: none;
                    transition: all 0.15s ease;
                    font-weight: 700;
                }
                .cart-qty-btn-full:hover {
                    background: rgba(0, 0, 0, 0.05);
                    color: #000;
                }
                .cart-qty-value-full {
                    font-size: 13px;
                    font-weight: 700;
                    color: #1d1d1f;
                    min-width: 26px;
                    text-align: center;
                }
                .cart-price-block {
                    text-align: right;
                }
                .cart-item-unit-price-full {
                    font-size: 11px;
                    color: #888;
                    display: block;
                    margin-bottom: 2px;
                }
                .cart-item-subtotal-full {
                    font-size: 16px;
                    font-weight: 800;
                    color: #aa841c;
                    margin: 0;
                }
                .cart-remove-btn-full {
                    background: transparent;
                    border: none;
                    color: #999;
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                .cart-remove-btn-full:hover {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.05);
                }

                /* ===== RIGHT COLUMN: SUMMARY CARD ===== */
                .cart-summary-column {
                    display: flex;
                    flex-direction: column;
                }
                .cart-summary-card-full {
                    background: #ffffff;
                    border: 1px solid rgba(0, 0, 0, 0.06);
                    border-radius: 28px;
                    padding: 36px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
                }
                .summary-card-title {
                    font-size: 18px;
                    font-weight: 800;
                    color: #1d1d1f;
                    margin: 0 0 24px;
                    letter-spacing: -0.2px;
                }
                .summary-card-details {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-bottom: 28px;
                }
                .summary-row-full {
                    display: flex;
                    justify-content: space-between;
                    font-size: 14px;
                }
                .summary-row-full .label {
                    color: #666;
                }
                .summary-row-full .value {
                    color: #1d1d1f;
                    font-weight: 600;
                }
                .summary-row-full .free-shipping {
                    color: #15803d;
                    font-weight: 700;
                    background: rgba(22, 163, 74, 0.08);
                    padding: 2px 8px;
                    border-radius: 6px;
                }
                .summary-divider-full {
                    height: 1px;
                    background: rgba(0, 0, 0, 0.06);
                }
                .total-row {
                    align-items: center;
                }
                .total-row .label {
                    font-size: 16px;
                    font-weight: 800;
                    color: #1d1d1f;
                }
                .grand-total {
                    font-size: 24px;
                    font-weight: 800;
                    color: #aa841c;
                }

                .cart-checkout-btn-full {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    background: linear-gradient(135deg, #1d1d1f 0%, #000000 100%);
                    color: #fff;
                    font-size: 14px;
                    font-weight: 700;
                    padding: 18px 24px;
                    border-radius: 16px;
                    border: none;
                    cursor: pointer;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    transition: all 0.25s ease;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                }
                .cart-checkout-btn-full:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
                }
                .cart-checkout-btn-full:active {
                    transform: translateY(0);
                }

                .cart-back-shop-btn {
                    width: 100%;
                    background: transparent;
                    border: none;
                    color: #888;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 16px;
                    transition: color 0.2s ease;
                }
                .cart-back-shop-btn:hover {
                    color: #aa841c;
                }

                .trust-badges-row {
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                    margin-top: 24px;
                    border-top: 1px solid rgba(0, 0, 0, 0.05);
                    padding-top: 20px;
                }
                .badge-item {
                    font-size: 11px;
                    color: #888;
                    font-weight: 600;
                }

                /* ===== EMPTY STATE FULL ===== */
                .cart-empty-full {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    flex: 1;
                    padding: 80px 20px;
                    text-align: center;
                }
                .cart-empty-full .cart-empty-icon {
                    width: 96px;
                    height: 96px;
                    border-radius: 50%;
                    background: rgba(0, 0, 0, 0.02);
                    border: 1px dashed rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #999;
                    margin-bottom: 24px;
                }
                .cart-empty-full .cart-empty-title {
                    font-size: 22px;
                    font-weight: 800;
                    color: #1d1d1f;
                    margin: 0 0 10px;
                }
                .cart-empty-full .cart-empty-sub {
                    font-size: 14px;
                    color: #777;
                    margin: 0 0 32px;
                }
                .cart-empty-full .cart-continue-btn {
                    background: linear-gradient(135deg, #d4af37, #aa841c);
                    color: #fff;
                    padding: 14px 32px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 800;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(212, 175, 55, 0.25);
                    transition: all 0.25s ease;
                }
                .cart-empty-full .cart-continue-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(212, 175, 55, 0.4);
                }

                /* ===== KEYFRAME ANIMATIONS ===== */
                @keyframes overlayIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes drawerSlideInUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes itemFadeInUp {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 900px) {
                    .cart-grid {
                        grid-template-columns: 1fr;
                        overflow-y: auto;
                        padding: 24px 20px;
                        gap: 24px;
                    }
                    .cart-items-column {
                        height: auto;
                        overflow: visible;
                        padding-right: 0;
                    }
                    .cart-close-btn .close-text {
                        display: none;
                    }
                    .cart-header {
                        padding: 16px 20px;
                    }
                }
                
                @media (max-width: 600px) {
                    .cart-grid {
                        padding: 16px 12px;
                        gap: 16px;
                    }
                    .cart-item-full {
                        padding: 12px;
                        gap: 12px;
                        border-radius: 16px;
                    }
                    .cart-item-img-full {
                        width: 70px;
                        height: 90px;
                        border-radius: 10px;
                    }
                    .cart-item-name-full {
                        font-size: 14px;
                    }
                    .cart-item-footer-row {
                        margin-top: 10px;
                    }
                    .cart-qty-btn-full {
                        width: 28px;
                        height: 26px;
                    }
                    .cart-qty-value-full {
                        min-width: 20px;
                        font-size: 12px;
                    }
                    .cart-item-subtotal-full {
                        font-size: 14px;
                    }
                    .cart-summary-card-full {
                        padding: 24px;
                        border-radius: 20px;
                    }
                    .grand-total {
                        font-size: 20px;
                    }
                    .cart-checkout-btn-full {
                        padding: 16px 20px;
                    }
                }
            `}</style>
        </div>
    );
}