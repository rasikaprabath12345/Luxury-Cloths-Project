"use client";

import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { glass } from "@/utils/theme";
import { uploadAPI, ordersAPI } from "@/lib/api";

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<string>("BankTransfer");
  const [loading, setLoading] = useState<boolean>(false);
  const [isOrdering, setIsOrdering] = useState<boolean>(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [isFirstOrder, setIsFirstOrder] = useState<boolean>(false);
  const router = useRouter();
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [country, setCountry] = useState<string>("Sri Lanka");
  const [state, setState] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [orderNote, setOrderNote] = useState<string>("");
  const [paymentSlipUrl, setPaymentSlipUrl] = useState<string>("");
  const [uploadingSlip, setUploadingSlip] = useState<boolean>(false);
  const [alertState, setAlertState] = useState<{
    show: boolean;
    message: string;
    isError?: boolean;
    onClose?: () => void;
  } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const triggerAlert = (message: string, isError: boolean = false, onClose?: () => void) => {
    setAlertState({ show: true, message, isError, onClose });
  };

  useEffect(() => {
    const savedUserStr = localStorage.getItem("luxury_user");
    const token = localStorage.getItem("luxury_token");
    if (savedUserStr && token) {
      try {
        const user = JSON.parse(savedUserStr);
        if (user.fullName) {
          const parts = user.fullName.trim().split(/\s+/);
          setFirstName(parts[0] || "");
          setLastName(parts.slice(1).join(" ") || "");
        }
        if (user.email) setEmail(user.email);
        if (user.phone) setPhone(user.phone);

        // Fetch user orders to verify first order promo
        ordersAPI.getUserOrders()
          .then(res => {
            if (res.data && res.data.length === 0) {
              setCouponApplied(true);
              setIsFirstOrder(true);
            }
          })
          .catch(err => {
            console.error("Failed to fetch user orders:", err);
          });
      } catch (error) {
        console.error("Failed to parse user:", error);
      }
    }
  }, []);

  const handleUpdateQuantity = (id: number, newQty: number, size?: string, color?: string) => {
    if (newQty < 1) return;
    updateQuantity(id, newQty, size, color);
  };

  const removeItem = (id: number, size?: string, color?: string) => {
    const itemKey = `${id}-${size || ''}-${color || ''}`;
    setRemovingId(itemKey);
    setTimeout(() => {
      removeFromCart(id, size, color);
      setRemovingId(null);
    }, 380);
  };

  const subTotal = cartItems.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  const discount = couponApplied ? Math.round(subTotal * 0.1) : 0;
  const shippingFee = 0; // FREE
  const totalAmount = subTotal - discount;
  const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const handleApplyCoupon = () => {
    if (coupon.trim().toUpperCase() === "LUXURY10") {
      setCouponApplied(true);
    } else {
      triggerAlert("Invalid coupon code. Try LUXURY10 for 10% off.", true);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSlip(true);
    try {
      const uploadRes = await uploadAPI.uploadImage(file);
      setPaymentSlipUrl(uploadRes.data.url);
      triggerAlert("🎉 Receipt uploaded successfully!");
    } catch (error: any) {
      console.error("Receipt upload failed:", error);
      triggerAlert(error.response?.data?.message || "Failed to upload receipt. Please try again.", true);
    } finally {
      setUploadingSlip(false);
      e.target.value = "";
    }
  };

  const handleRemoveSlip = () => {
    setPaymentSlipUrl("");
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;

    // Legacy cart safeguard
    const hasLegacy = cartItems.some(item => !item.variantId || item.variantId === item.id);
    if (hasLegacy) {
      triggerAlert("Your cart contains outdated items. The cart will be cleared. Please add the items to the cart again.", true, () => {
        clearCart();
        router.push("/storefront/shop");
      });
      return;
    }

    // Check local storage for user token/info, standard auth
    const savedUserStr = localStorage.getItem("luxury_user");
    const token = localStorage.getItem("luxury_token");
    if (!savedUserStr || !token) {
      triggerAlert("Please log in to place an order.", true, () => {
        router.push("/auth/login");
      });
      return;
    }

    if (!firstName.trim()) {
      triggerAlert("Please enter your first name.", true);
      return;
    }
    if (!lastName.trim()) {
      triggerAlert("Please enter your last name.", true);
      return;
    }
    if (!email.trim()) {
      triggerAlert("Please enter your email address.", true);
      return;
    }
    if (!phone.trim()) {
      triggerAlert("Please enter your phone number.", true);
      return;
    }
    if (!country.trim()) {
      triggerAlert("Please enter your country.", true);
      return;
    }
    if (!state.trim()) {
      triggerAlert("Please enter your state or province.", true);
      return;
    }
    if (!city.trim()) {
      triggerAlert("Please enter your city.", true);
      return;
    }
    if (!address.trim()) {
      triggerAlert("Please enter your street address.", true);
      return;
    }

    if (paymentMethod === "BankTransfer" && !paymentSlipUrl) {
      triggerAlert("Please upload your bank deposit receipt/slip.", true);
      return;
    }


    // ✅ Pre-flight: block items with quantity = 0
    const zeroQtyItems = cartItems.filter((item) => (item.quantity || 0) <= 0);
    if (zeroQtyItems.length > 0) {
      const names = zeroQtyItems.map((item) => `"${item.name}${item.size ? ` (${item.size})` : ""}"`).join(", ");
      triggerAlert(
        `The following items are out of stock (quantity 0): ${names}. Please remove them before placing the order.`,
        true
      );
      return;
    }

    const user = JSON.parse(savedUserStr);
    setIsOrdering(true);

    try {
      // ✅ Live stock validation — fetch fresh stock data from server for each product
      const uniqueProductIds = [...new Set(cartItems.map((item) => item.id))];
      const stockResults: Record<number, number> = {}; // variantId -> availableStock

      await Promise.all(
        uniqueProductIds.map(async (productId) => {
          try {
            const res = await axios.get(`http://localhost:5226/api/Stock/${productId}`);
            const variants = res.data?.variants || [];
            variants.forEach((v: { variantId: number; availableStock: number }) => {
              stockResults[v.variantId] = v.availableStock;
            });
          } catch {
            // If stock fetch fails for a product, skip — let the server decide
          }
        })
      );

      // Check each cart item against live stock
      const stockFailures: string[] = [];
      for (const item of cartItems) {
        const variantId = item.variantId;
        if (variantId !== undefined && stockResults[variantId] !== undefined) {
          const liveStock = stockResults[variantId];
          if ((item.quantity || 1) > liveStock) {
            stockFailures.push(
              `"${item.name}${item.size ? ` (${item.size})` : ""}" — requested: ${item.quantity}, available: ${liveStock}`
            );
          }
        }
      }

      if (stockFailures.length > 0) {
        triggerAlert(
          `The following items exceed available stock:\n${stockFailures.join("\n")}\n\nPlease reduce quantity or remove these items.`,
          true
        );
        setIsOrdering(false);
        return;
      }

      // Build payload — skip any items with quantity <= 0 as a final safety net
      const validItems = cartItems
        .filter((item) => (item.quantity || 0) > 0)
        .map((item) => ({
          productVariantId: item.variantId,
          quantity: item.quantity || 1,
        }));

      if (validItems.length === 0) {
        triggerAlert("Your cart has no valid items to order.", true);
        setIsOrdering(false);
        return;
      }

      const orderData = {
        userId: user.id,
        paymentMethod,
        firstName,
        lastName,
        email,
        phone,
        country,
        state,
        city,
        postalCode,
        address,
        orderNote,
        shippingAddress: `${address}, ${city}, ${state}, ${country}. Postal Code: ${postalCode}`,
        paymentSlipUrl,
        items: validItems,
      };

      const response = await axios.post("http://localhost:5226/api/Orders", orderData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200 || response.status === 201) {
        triggerAlert("🎉 " + (response.data.message || "Order placed successfully!"), false, () => {
          clearCart();
          router.push("/orders");
        });
      }
    } catch (error: any) {
      console.error("Order failed:", error);
      // Backend returns plain string or object with .message
      let errorMsg = "Order failed. Please try again.";
      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMsg = error.response.data;
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        } else if (error.response.data.title) {
          errorMsg = error.response.data.title;
        }
      }
      triggerAlert(errorMsg, true);
    } finally {
      setIsOrdering(false);
    }
  };


  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "linear-gradient(160deg, #F2F2F7 0%, #E8E8F0 40%, #EEF0F8 100%)"
      }}>
        <div className="cp-spinner" style={{
          width: 44, height: 44,
          border: "3px solid rgba(0,0,0,0.05)",
          borderTopColor: "#aa841c", borderRadius: "50%",
          animation: "spin 0.7s linear infinite"
        }} />
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif",
      background: "linear-gradient(160deg, #F2F2F7 0%, #E8E8F0 40%, #EEF0F8 100%)",
      minHeight: "100vh", color: "#1C1C1E",
      paddingTop: 30,
      paddingBottom: 100,
      position: "relative"
    }}>
      {/* Ambient background blur blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-10%", right: "-5%",
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

        {/* Back navigation & Header */}
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
            <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
              <div>
                <p style={{
                  margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
                  textTransform: "uppercase", color: "#aa841c"
                }}>Boutique Cart</p>
                <h1 style={{ margin: 0, fontSize: "clamp(28px, 4.5vw, 38px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#1C1C1E" }}>
                  Your Selection
                </h1>
              </div>

              {/* Inline Step Indicator */}
              <div className="checkout-steps" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: 440,
                padding: "10px 20px",
                ...glass.pill,
                background: "rgba(255, 255, 255, 0.45)",
                border: "1.5px solid rgba(255,255,255,0.9)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                margin: 0
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: "linear-gradient(135deg, #d4af37 0%, #aa841c 100%)",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, boxShadow: "0 2px 8px rgba(170,132,28,0.25)"
                  }}>1</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1C1C1E", letterSpacing: "0.01em" }}>Shopping Bag</span>
                </div>
                <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.06)", margin: "0 12px" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.6 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: "rgba(0,0,0,0.06)",
                    color: "#555", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700
                  }}>2</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#555" }}>Payment</span>
                </div>
                <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.06)", margin: "0 12px" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.6 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: "rgba(0,0,0,0.06)",
                    color: "#555", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700
                  }}>3</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#555" }}>Receipt</span>
                </div>
              </div>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                style={{
                  background: "transparent", border: "none", color: "#FF3B30",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 8, transition: "background 0.2s"
                }}
                className="clear-cart-btn"
              >
                Clear All Pieces
              </button>
            )}
          </div>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Bag State Card */
          <div style={{
            ...glass.card, padding: "80px 40px", textAlign: "center",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
            maxWidth: 580, margin: "60px auto", boxShadow: "0 8px 40px rgba(0,0,0,0.04)"
          }}>
            <div style={{
              width: 84, height: 84, borderRadius: "50%",
              background: "rgba(170,132,28,0.06)", border: "1px dashed rgba(170,132,28,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#aa841c", fontSize: 32, boxShadow: "inset 0 2px 10px rgba(170,132,28,0.03)"
            }}>
              👜
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1C1C1E", letterSpacing: "-0.01em" }}>Your Bag is Empty</h3>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "#8E8E93", lineHeight: 1.5 }}>
                Discover our premium luxury collections and select your tailor-made linen, silk, and cotton wear.
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
          <div className="cart-grid-container">

            {/* LEFT COLUMN: SELECTED ITEMS */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1C1C1E", margin: 0 }}>Selected Pieces</h2>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: "#aa841c",
                  background: "rgba(170,132,28,0.06)", border: "0.5px solid rgba(170,132,28,0.18)",
                  padding: "3px 10px", borderRadius: 100
                }}>
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {cartItems.map((item) => {
                  const img = item.imageUrl || item.image || PLACEHOLDER_IMG;
                  const itemKey = `${item.id}-${item.size || ''}-${item.color || ''}`;
                  const isRemoving = removingId === itemKey;
                  const isOverStock = item.availableStock !== undefined && item.availableStock > 0 && (item.quantity || 1) > item.availableStock;
                  return (
                    <div
                      key={itemKey}
                      className="cart-item-card"
                      style={{
                        ...glass.card,
                        display: "flex",
                        gap: 20,
                        padding: "20px 24px 20px 20px",
                        opacity: isRemoving ? 0 : 1,
                        transform: isRemoving ? "scale(0.96) translateY(-12px)" : "scale(1)",
                        transition: "all 0.38s cubic-bezier(0.16, 1, 0.3, 1)",
                        border: isOverStock ? "1.5px solid rgba(255,59,48,0.35)" : "1px solid rgba(255,255,255,0.9)",
                        background: isOverStock ? "rgba(255,59,48,0.02)" : "rgba(255,255,255,0.65)"
                      }}
                    >
                      {/* Image container with zoom hover */}

                      <div style={{
                        position: "relative",
                        flexShrink: 0,
                        borderRadius: 16,
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.06)",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
                      }} className="cart-img-box">
                        <img
                          src={img}
                          alt={item.name}
                          style={{
                            width: 100, height: 125, objectFit: "cover",
                            transition: "transform 0.4s ease-out"
                          }}
                          className="cart-item-image"
                        />
                        <span style={{
                          position: "absolute", top: -8, right: -8,
                          background: "#aa841c", color: "#fff",
                          fontSize: 10, fontWeight: 800, width: 22, height: 22,
                          borderRadius: "50%", display: "flex", alignItems: "center",
                          justifyContent: "center", boxShadow: "0 2px 8px rgba(170,132,28,0.2)",
                          border: "2px solid #fff"
                        }}>
                          {item.quantity}
                        </span>
                      </div>

                      {/* Info & Controls */}
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{
                              fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
                              textTransform: "uppercase", color: "#aa841c", margin: "0 0 4px"
                            }}>Luxury Apparel</p>
                            <h3 style={{
                              fontSize: 15, fontWeight: 700, color: "#1C1C1E",
                              margin: 0, lineHeight: 1.3, whiteSpace: "nowrap",
                              overflow: "hidden", textOverflow: "ellipsis"
                            }}>{item.name}</h3>

                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                              {item.size && (
                                <span style={{
                                  fontSize: 10, fontWeight: 600, color: "#555",
                                  background: "rgba(0,0,0,0.04)", border: "0.5px solid rgba(0,0,0,0.05)",
                                  padding: "2px 8px", borderRadius: 6
                                }}>Size: {item.size}</span>
                              )}
                              {item.color && (
                                <span style={{
                                  fontSize: 10, fontWeight: 600, color: "#555",
                                  background: "rgba(0,0,0,0.04)", border: "0.5px solid rgba(0,0,0,0.05)",
                                  padding: "2px 8px", borderRadius: 6
                                }}>Color: {item.color}</span>
                              )}
                              {item.availableStock !== undefined && item.availableStock <= 5 && item.availableStock > 0 && !isOverStock && (
                                <span style={{
                                  fontSize: 10, fontWeight: 600, color: "#FF9500",
                                  background: "rgba(255,149,0,0.1)", border: "0.5px solid rgba(255,149,0,0.2)",
                                  padding: "2px 8px", borderRadius: 6
                                }}>Only {item.availableStock} left</span>
                              )}
                              {isOverStock && (
                                <span style={{
                                  fontSize: 10, fontWeight: 600, color: "#FF3B30",
                                  background: "rgba(255,59,48,0.1)", border: "0.5px solid rgba(255,59,48,0.25)",
                                  padding: "2px 8px", borderRadius: 6
                                }}>⚠ Only {item.availableStock} available</span>
                              )}
                              {item.availableStock !== undefined && item.availableStock <= 0 && (
                                <span style={{
                                  fontSize: 10, fontWeight: 600, color: "#FF3B30",
                                  background: "rgba(255,59,48,0.1)", border: "0.5px solid rgba(255,59,48,0.2)",
                                  padding: "2px 8px", borderRadius: 6
                                }}>Out of stock</span>
                              )}

                            </div>
                          </div>

                          <button
                            onClick={() => removeItem(item.id, item.size, item.color)}
                            style={{
                              background: "rgba(0,0,0,0.02)", border: "none", color: "#8E8E93",
                              cursor: "pointer", width: 28, height: 28, borderRadius: "50%",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.2s ease"
                            }}
                            className="cart-delete-btn"
                            aria-label="Remove item"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>

                        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginTop: 14 }}>

                          {/* Premium quantity adjustment buttons */}
                          <div style={{
                            display: "flex", alignItems: "center",
                            background: "rgba(0,0,0,0.03)", border: "0.5px solid rgba(0,0,0,0.06)",
                            borderRadius: 12, padding: "2px"
                          }}>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                              disabled={item.quantity <= 1}
                              style={{
                                width: 28, height: 26, display: "flex", alignItems: "center",
                                justifyItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700,
                                color: item.quantity <= 1 ? "#C7C7CC" : "#555", background: "transparent", border: "none",
                                cursor: item.quantity <= 1 ? "default" : "pointer", transition: "background 0.15s",
                                borderRadius: 10
                              }}
                              className="qty-action-btn"
                            >−</button>
                            <span style={{
                              fontSize: 12, fontWeight: 700, color: "#aa841c",
                              minWidth: 26, textAlign: "center"
                            }}>{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                              disabled={item.availableStock !== undefined && item.quantity >= item.availableStock}
                              style={{
                                width: 28, height: 26, display: "flex", alignItems: "center",
                                justifyItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700,
                                color: (item.availableStock !== undefined && item.quantity >= item.availableStock) ? "#C7C7CC" : "#555",
                                background: "transparent", border: "none",
                                cursor: (item.availableStock !== undefined && item.quantity >= item.availableStock) ? "not-allowed" : "pointer",
                                transition: "background 0.15s",
                                borderRadius: 10
                              }}
                              className="qty-action-btn"
                            >+</button>
                          </div>

                          {/* Prices */}
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: 11, color: "#8E8E93", display: "block", marginBottom: 2 }}>
                              Rs. {item.price.toLocaleString()} each
                            </span>
                            <p style={{ fontSize: 15, fontWeight: 800, color: "#aa841c", margin: 0 }}>
                              Rs. {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Shipping Details Card */}
              <div style={{
                ...glass.card,
                padding: "28px 24px",
                border: "1px solid rgba(255,255,255,0.9)",
                background: "rgba(255,255,255,0.65)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                marginTop: 20,
                borderRadius: 16
              }}>
                <div style={{ borderBottom: "0.5px solid rgba(0,0,0,0.06)", paddingBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>📋</span>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1C1C1E", margin: 0, letterSpacing: "-0.01em", textTransform: "uppercase" }}>Details</h2>
                </div>

                {/* First Name & Last Name */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>First Name *</label>
                    <input
                      type="text"
                      placeholder="Enter First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      style={{
                        background: "rgba(255,255,255,0.5)",
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontSize: 13,
                        color: "#1C1C1E",
                        outline: "none",
                        fontFamily: "inherit",
                        transition: "all 0.2s"
                      }}
                      className="shipping-input"
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>Last Name *</label>
                    <input
                      type="text"
                      placeholder="Enter Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      style={{
                        background: "rgba(255,255,255,0.5)",
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontSize: 13,
                        color: "#1C1C1E",
                        outline: "none",
                        fontFamily: "inherit",
                        transition: "all 0.2s"
                      }}
                      className="shipping-input"
                    />
                  </div>
                </div>

                {/* Email & Phone Number */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>Email *</label>
                    <input
                      type="email"
                      placeholder="Enter Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        background: "rgba(255,255,255,0.5)",
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontSize: 13,
                        color: "#1C1C1E",
                        outline: "none",
                        fontFamily: "inherit",
                        transition: "all 0.2s"
                      }}
                      className="shipping-input"
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>Phone Number *</label>
                    <input
                      type="text"
                      placeholder="Enter Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        background: "rgba(255,255,255,0.5)",
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontSize: 13,
                        color: "#1C1C1E",
                        outline: "none",
                        fontFamily: "inherit",
                        transition: "all 0.2s"
                      }}
                      className="shipping-input"
                    />
                  </div>
                </div>

                {/* Country & State/Province */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>Country *</label>
                    <input
                      type="text"
                      placeholder="Sri Lanka"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      style={{
                        background: "rgba(255,255,255,0.5)",
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontSize: 13,
                        color: "#1C1C1E",
                        outline: "none",
                        fontFamily: "inherit",
                        transition: "all 0.2s"
                      }}
                      className="shipping-input"
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>State/Province *</label>
                    <input
                      type="text"
                      placeholder="Enter State or Province"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      style={{
                        background: "rgba(255,255,255,0.5)",
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontSize: 13,
                        color: "#1C1C1E",
                        outline: "none",
                        fontFamily: "inherit",
                        transition: "all 0.2s"
                      }}
                      className="shipping-input"
                    />
                  </div>
                </div>

                {/* City & Postal Code */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>City *</label>
                    <input
                      type="text"
                      placeholder="Enter City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{
                        background: "rgba(255,255,255,0.5)",
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontSize: 13,
                        color: "#1C1C1E",
                        outline: "none",
                        fontFamily: "inherit",
                        transition: "all 0.2s"
                      }}
                      className="shipping-input"
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>Postal Code</label>
                    <input
                      type="text"
                      placeholder="Enter Postal Code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      style={{
                        background: "rgba(255,255,255,0.5)",
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontSize: 13,
                        color: "#1C1C1E",
                        outline: "none",
                        fontFamily: "inherit",
                        transition: "all 0.2s"
                      }}
                      className="shipping-input"
                    />
                  </div>
                </div>

                {/* Address */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>Address *</label>
                  <input
                    type="text"
                    placeholder="Enter Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.5)",
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: 13,
                      color: "#1C1C1E",
                      outline: "none",
                      fontFamily: "inherit",
                      transition: "all 0.2s"
                    }}
                    className="shipping-input"
                  />
                </div>

                {/* Order Note */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>Order Note</label>
                  <textarea
                    placeholder="Notes about your order, e.g. special notes for delivery..."
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    rows={2}
                    style={{
                      background: "rgba(255,255,255,0.5)",
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: 13,
                      color: "#1C1C1E",
                      outline: "none",
                      fontFamily: "inherit",
                      resize: "none",
                      transition: "all 0.2s"
                    }}
                    className="shipping-input"
                  />
                </div>

                {/* Optional visual elements for match: Ship to another Address */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <input
                    type="checkbox"
                    id="shipAnother"
                    style={{ cursor: "pointer", width: 16, height: 16, accentColor: "#aa841c" }}
                  />
                  <label htmlFor="shipAnother" style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E", cursor: "pointer" }}>
                    Ship to another Address
                  </label>
                </div>
              </div>

              <Link href="/storefront/shop" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 13, fontWeight: 600, color: "#aa841c",
                textDecoration: "none", transition: "all 0.2s ease",
                alignSelf: "flex-start", marginTop: 24
              }} className="continue-link">
                ← Return to Collections
              </Link>
            </div>

            {/* RIGHT COLUMN: STICKY ORDER SUMMARY & CHECKOUT */}
            <div className="cart-summary-sticky">
              {isFirstOrder && (
                <div style={{
                  background: "linear-gradient(135deg, #15803D 0%, #166534 100%)",
                  color: "#fff",
                  borderRadius: 12,
                  padding: "12px 16px",
                  marginBottom: 16,
                  fontSize: 12.5,
                  fontWeight: 600,
                  boxShadow: "0 4px 14px rgba(22,101,52,0.15)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10
                }}>
                  <span style={{ fontSize: 18 }}>🎉</span>
                  <span>Welcome! <strong>10% First Order Discount</strong> has been automatically applied to your checkout.</span>
                </div>
              )}
              <div style={{
                ...glass.card,
                padding: "28px 24px",
                border: "1px solid rgba(255,255,255,0.95)",
                background: "rgba(255,255,255,0.72)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.05)"
              }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1C1C1E", margin: "0 0 20px", letterSpacing: "-0.01em" }}>Order Summary</h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#8E8E93" }}>Subtotal ({totalItems} items)</span>
                    <span style={{ color: "#1C1C1E", fontWeight: 600 }}>Rs. {subTotal.toLocaleString()}</span>
                  </div>

                  {couponApplied && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "#15803D", fontWeight: 500 }}>Discount ({isFirstOrder ? "First Order Offer" : "LUXURY10"})</span>
                      <span style={{ color: "#15803D", fontWeight: 700 }}>− Rs. {discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, alignItems: "center" }}>
                    <span style={{ color: "#8E8E93" }}>Delivery Fee</span>
                    <span style={{
                      color: "#15803D", fontWeight: 700, fontSize: 10,
                      background: "rgba(22,163,74,0.08)", padding: "3px 8px", borderRadius: 6
                    }}>FREE</span>
                  </div>
                </div>

                <div style={{ height: 0.5, background: "rgba(0,0,0,0.06)", marginBottom: 20 }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#1C1C1E" }}>Total Amount</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: "#aa841c", letterSpacing: "-0.5px" }}>
                    Rs. {totalAmount.toLocaleString()}
                  </span>
                </div>

                {/* Promo Coupon Entry */}
                <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                  <input
                    placeholder={isFirstOrder ? "First Order Offer Applied!" : "Coupon (e.g. LUXURY10)"}
                    value={couponApplied && isFirstOrder ? "WELCOME10" : coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    disabled={couponApplied}
                    style={{
                      flex: 1, background: "rgba(255,255,255,0.5)",
                      border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10,
                      padding: "10px 14px", fontSize: 12, color: "#1C1C1E",
                      outline: "none", fontFamily: "inherit", transition: "border-color 0.2s"
                    }}
                    className="coupon-input"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponApplied}
                    style={{
                      background: couponApplied ? "rgba(22,163,74,0.08)" : "rgba(0,0,0,0.03)",
                      border: couponApplied ? "0.5px solid rgba(22,163,74,0.2)" : "0.5px solid rgba(0,0,0,0.08)",
                      color: couponApplied ? "#15803D" : "#aa841c", fontSize: 12, fontWeight: 700,
                      padding: "10px 18px", borderRadius: 10, cursor: couponApplied ? "default" : "pointer",
                      transition: "all 0.2s ease"
                    }}
                    className="coupon-btn"
                  >
                    {couponApplied ? "✓ Active" : "Apply"}
                  </button>
                </div>

                {/* Payment Option Selection */}
                <div style={{ marginBottom: 28 }}>
                  <p style={{
                    fontSize: 10, fontWeight: 700, color: "#8E8E93",
                    letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12
                  }}>Payment Method</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { value: "BankTransfer", label: "Bank Transfer", sub: "Verify & place order, then upload slip" },
                      { value: "COD", label: "Cash on Delivery", sub: "Pay physically upon delivery" },
                    ].map((opt) => {
                      const isActive = paymentMethod === opt.value;
                      return (
                        <label
                          key={opt.value}
                          style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "12px 14px", borderRadius: 12,
                            border: isActive ? "1.5px solid rgba(170,132,28,0.4)" : "1px solid rgba(0,0,0,0.06)",
                            background: isActive ? "rgba(170,132,28,0.03)" : "#ffffff",
                            cursor: "pointer", transition: "all 0.2s ease",
                            boxShadow: isActive ? "0 2px 10px rgba(170,132,28,0.04)" : "none"
                          }}
                          className="payment-method-card"
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={opt.value}
                            checked={isActive}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            style={{ display: "none" }}
                          />
                          <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: isActive ? "rgba(170,132,28,0.08)" : "rgba(0,0,0,0.03)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: isActive ? "#aa841c" : "#555", flexShrink: 0
                          }}>
                            {opt.value === "BankTransfer" ? (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                <line x1="2" y1="10" x2="22" y2="10" />
                              </svg>
                            ) : (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "#1C1C1E", margin: "0 0 2px" }}>{opt.label}</p>
                            <p style={{ fontSize: 10, color: "#8E8E93", margin: 0 }}>{opt.sub}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Dynamic Bank details sub-card */}
                  {paymentMethod === "BankTransfer" && (
                    <div style={{
                      marginTop: 12,
                      padding: "16px",
                      borderRadius: 14,
                      background: "rgba(170,132,28,0.03)",
                      border: "0.5px solid rgba(170,132,28,0.2)",
                      fontSize: 11,
                      lineHeight: "1.5em",
                      color: "#4A3608",
                      animation: "fadeIn 0.3s ease-in-out"
                    }}>
                      <p style={{ margin: "0 0 8px", fontWeight: 700, color: "#aa841c", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 10 }}>Bank Credentials</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div><strong>Bank:</strong> Sampath Bank PLC</div>
                        <div><strong>Account Name:</strong> Luxury Clothing Store</div>
                        <div><strong>Account Number:</strong> 1009 5421 9882</div>
                        <div><strong>Branch:</strong> Colombo Corporate Branch</div>
                      </div>
                      <p style={{ margin: "8px 0 0", color: "#8E8E93", fontSize: 9, lineHeight: 1.4 }}>
                        * Please deposit the total amount to the bank account above and upload the deposit receipt/slip below before placing the order.
                      </p>

                      {/* Premium Slip Upload Section */}
                      <div style={{ marginTop: 16 }}>
                        <label style={{ fontSize: 10, fontWeight: 700, color: "#8E8E93", letterSpacing: "0.02em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                          Bank Receipt / Deposit Slip
                        </label>

                        <input
                          type="file"
                          id="slip-upload-input"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleFileChange}
                          disabled={uploadingSlip}
                        />

                        {!paymentSlipUrl ? (
                          <label
                            htmlFor="slip-upload-input"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "20px 16px",
                              borderRadius: 12,
                              border: "1.5px dashed rgba(170,132,28,0.3)",
                              background: "rgba(255, 255, 255, 0.6)",
                              cursor: uploadingSlip ? "not-allowed" : "pointer",
                              transition: "all 0.2s ease-in-out",
                              textAlign: "center",
                              gap: 8,
                            }}
                            className="slip-upload-zone"
                          >
                            {uploadingSlip ? (
                              <>
                                <span className="cp-upload-spinner" style={{
                                  width: 20, height: 20, border: "2px solid rgba(170,132,28,0.15)",
                                  borderTopColor: "#aa841c", borderRadius: "50%",
                                  animation: "spin 0.6s linear infinite"
                                }} />
                                <span style={{ fontSize: 11, fontWeight: 600, color: "#aa841c" }}>Uploading receipt...</span>
                              </>
                            ) : (
                              <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aa841c" strokeWidth={2} style={{ opacity: 0.8 }}>
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                                </svg>
                                <div>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: "#aa841c", display: "block" }}>Click to Upload Receipt</span>
                                  <span style={{ fontSize: 9, color: "#8E8E93", display: "block", marginTop: 2 }}>Supports PNG, JPG, JPEG (Max 5MB)</span>
                                </div>
                              </>
                            )}
                          </label>
                        ) : (
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 12px",
                            borderRadius: 12,
                            border: "1px solid rgba(22, 163, 74, 0.2)",
                            background: "rgba(22, 163, 74, 0.03)",
                            position: "relative"
                          }}>
                            <div style={{
                              width: 40,
                              height: 40,
                              borderRadius: 8,
                              overflow: "hidden",
                              border: "1px solid rgba(0,0,0,0.06)",
                              flexShrink: 0,
                              background: "#fff"
                            }}>
                              <img src={paymentSlipUrl} alt="Receipt preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#16A34A" }}>✓ Slip Uploaded</p>
                              <p style={{ margin: "1px 0 0", fontSize: 9, color: "#8E8E93", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                {paymentSlipUrl.substring(paymentSlipUrl.lastIndexOf('/') + 1)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveSlip}
                              style={{
                                background: "rgba(255, 59, 48, 0.08)",
                                border: "none",
                                color: "#FF3B30",
                                padding: "4px 10px",
                                borderRadius: 8,
                                fontSize: 10,
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Cash on Delivery info */}
                  {paymentMethod === "COD" && (
                    <div style={{
                      marginTop: 12,
                      padding: "16px",
                      borderRadius: 14,
                      background: "rgba(0,0,0,0.02)",
                      border: "0.5px solid rgba(0,0,0,0.06)",
                      fontSize: 11,
                      lineHeight: "1.5em",
                      color: "#444",
                      animation: "fadeIn 0.3s ease-in-out"
                    }}>
                      <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#1C1C1E" }}>Cash On Delivery instructions</p>
                      <p style={{ margin: 0, color: "#8E8E93", fontSize: 10 }}>
                        Place your order now. You will pay the full amount in cash to the courier agent when the shipment is delivered to your doorstep.
                      </p>
                    </div>
                  )}
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isOrdering || cartItems.length === 0}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 10, background: "linear-gradient(135deg, #d4af37 0%, #aa841c 100%)",
                    color: "#fff", fontSize: 13, fontWeight: 700,
                    padding: "16px 20px", borderRadius: 14, border: "none",
                    cursor: "pointer", letterSpacing: "0.5px", textTransform: "uppercase",
                    transition: "all 0.25s ease", boxShadow: "0 4px 15px rgba(170,132,28,0.2)",
                    marginBottom: 16
                  }}
                  className="cart-checkout-cta"
                >
                  {isOrdering ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="cp-order-spinner" style={{
                        width: 14, height: 14, border: "2px solid rgba(255,255,255,0.2)",
                        borderTopColor: "#fff", borderRadius: "50%",
                        animation: "spin 0.6s linear infinite"
                      }} />
                      Processing Order…
                    </span>
                  ) : (
                    <>
                      <span>Confirm & Place Order</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Trust Badges */}
                <div style={{
                  display: "flex", justifyContent: "center", gap: 16,
                  borderTop: "0.5px solid rgba(0,0,0,0.06)", paddingTop: 16, flexWrap: "wrap"
                }}>
                  {["🔒 SSL Secure", "✨ Premium Quality"].map((badge) => (
                    <span key={badge} style={{ fontSize: 10, color: "#8E8E93", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Custom Premium Alert Modal */}
        {alertState?.show && (
          <div className="custom-alert-overlay">
            <div className="custom-alert-modal">
              <div className="custom-alert-header">
                <div className="custom-alert-icon-container" style={{
                  background: alertState.isError ? "#FDF2F2" : "#FEF9E7",
                  color: alertState.isError ? "#FF4B4B" : "#aa841c"
                }}>
                  {alertState.isError ? "⚠️" : "✨"}
                </div>
                <h3 className="custom-alert-title">
                  {alertState.isError ? "Notification" : "Success"}
                </h3>
              </div>
              <p className="custom-alert-message">{alertState.message}</p>
              <button
                className="custom-alert-btn"
                onClick={() => {
                  setAlertState(null);
                  if (alertState.onClose) alertState.onClose();
                }}
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Clear Cart Confirmation Modal */}
        {showClearConfirm && (
          <div className="custom-alert-overlay" onClick={() => setShowClearConfirm(false)}>
            <div
              className="custom-alert-modal"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 360, padding: "36px 28px 28px" }}
            >
              <div className="custom-alert-header">
                <div className="custom-alert-icon-container" style={{ background: "#FDF2F2", color: "#FF4B4B", width: 60, height: 60, fontSize: 26 }}>
                  🗑️
                </div>
                <h3 className="custom-alert-title" style={{ marginTop: 14 }}>Clear Cart?</h3>
              </div>
              <p className="custom-alert-message" style={{ color: "#666", lineHeight: 1.65, fontSize: 14 }}>
                Are you sure you want to remove all items from your cart? This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  style={{
                    flex: 1, padding: "13px 16px", borderRadius: 12, whiteSpace: "nowrap",
                    border: "1.5px solid #E5E5EA", background: "#fff",
                    fontSize: 14, fontWeight: 700, color: "#444", cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    clearCart();
                    setShowClearConfirm(false);
                  }}
                  style={{
                    flex: 1, padding: "13px 16px", borderRadius: 12, whiteSpace: "nowrap",
                    border: "none", background: "#FF4B4B",
                    fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(255,75,75,0.3)",
                    transition: "all 0.2s"
                  }}
                >
                  Yes, Clear All
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Styled classes and keyframe animations */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

        .custom-alert-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease-out;
        }

        .custom-alert-modal {
          background: #FFFFFF;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          border-radius: 32px;
          padding: 32px 24px;
          width: 90%;
          max-width: 350px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: modalScale 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .custom-alert-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 16px;
        }

        .custom-alert-icon-container {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin-bottom: 16px;
        }

        .custom-alert-title {
          font-size: 22px;
          font-weight: 700;
          color: #111827;
          margin: 0;
          font-family: var(--font-body), -apple-system, BlinkMacSystemFont, sans-serif;
          letter-spacing: -0.2px;
        }

        .custom-alert-message {
          font-size: 14px;
          line-height: 1.5;
          color: #6B7280;
          margin: 0 0 24px;
          max-width: 300px;
          font-family: var(--font-body), -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .custom-alert-btn {
          width: 100%;
          height: 48px;
          background: #A83232;
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .custom-alert-btn:hover {
          background: #902B2B;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(168, 50, 50, 0.2);
        }

        .custom-alert-btn:active {
          transform: translateY(0);
        }

        .slip-upload-zone:hover {
          border-color: rgba(170,132,28,0.6) !important;
          background: rgba(170,132,28,0.06) !important;
        }

        .cart-grid-container {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 40px;
          align-items: start;
        }

        .cart-summary-sticky {
          position: sticky;
          top: 110px;
        }

        .back-link:hover {
          color: #aa841c !important;
          transform: translateX(-4px);
        }

        .continue-link:hover {
          color: #d4af37 !important;
          transform: translateX(-4px);
        }

        .clear-cart-btn:hover {
          background: rgba(255, 59, 48, 0.05) !important;
        }

        .cart-item-card {
          transition: all 0.3s ease !important;
        }
        .cart-item-card:hover {
          border-color: rgba(170,132,28,0.25) !important;
          box-shadow: 0 12px 30px rgba(170,132,28,0.05) !important;
        }

        .cart-img-box:hover .cart-item-image {
          transform: scale(1.06);
        }

        .cart-delete-btn:hover {
          color: #FF3B30 !important;
          background: rgba(255,59,48,0.06) !important;
        }

        .qty-action-btn:hover:not(:disabled) {
          background: rgba(0,0,0,0.06) !important;
          color: #000 !important;
        }

        .coupon-input:focus {
          border-color: rgba(170,132,28,0.3) !important;
          background: rgba(255,255,255,0.7) !important;
        }

        .shipping-input:focus {
          border-color: rgba(170,132,28,0.3) !important;
          background: rgba(255,255,255,1) !important;
          box-shadow: 0 0 0 3px rgba(170,132,28,0.05) !important;
        }

        .coupon-btn:hover:not(:disabled) {
          background: rgba(170,132,28,0.06) !important;
        }

        .payment-method-card:hover {
          border-color: rgba(170,132,28,0.2) !important;
        }

        .cart-checkout-cta:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(170,132,28,0.3) !important;
        }

        .explore-btn:hover {
          transform: scale(1.03);
          box-shadow: 0 8px 24px rgba(170,132,28,0.3) !important;
        }

        @media (max-width: 990px) {
          .cart-grid-container {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .cart-summary-sticky {
            position: static;
          }
        }

        @media (max-width: 600px) {
          .checkout-steps {
            display: none !important;
          }
          .cart-item-card {
            padding: 16px !important;
            gap: 16px !important;
          }
          .cart-img-box img {
            width: 80px !important;
            height: 100px !important;
          }
        }
      `}</style>
    </div>
  );
}