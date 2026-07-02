"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  
  // Single-page OTP Reset states
  const [showOtpFields, setShowOtpFields] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { forgotPassword, resetPassword } = useAuth();
  const router = useRouter();

  // Input refs for OTP fields focus movement
  const otpRefs = useRef<HTMLInputElement[]>([]);

  const validateEmail = (val: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!val.trim()) {
      setEmailError("Email address is required.");
      return false;
    }
    if (!emailRegex.test(val.trim())) {
      setEmailError("Please enter a realistic and valid email address.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (val: string) => {
    if (!val) {
      setNewPasswordError("Password is required.");
      return false;
    }
    if (val.length < 6) {
      setNewPasswordError("Password must be at least 6 characters.");
      return false;
    }
    if (!/[A-Z]/.test(val)) {
      setNewPasswordError("Must contain at least one uppercase letter (A-Z).");
      return false;
    }
    if (!/[0-9]/.test(val)) {
      setNewPasswordError("Must contain at least one number (0-9).");
      return false;
    }
    setNewPasswordError("");
    return true;
  };

  const validateConfirmPassword = (confirmVal: string, passVal: string) => {
    if (!confirmVal) {
      setConfirmPasswordError("Please confirm your password.");
      return false;
    }
    if (confirmVal !== passVal) {
      setConfirmPasswordError("Passwords do not match.");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const isEmailValid = validateEmail(email);
    if (!isEmailValid) {
      setError("Please fix the email validation error.");
      return;
    }

    setIsLoading(true);

    try {
      await forgotPassword(email);
      setSuccess("A 6-digit OTP code has been sent to your email.");
      setShowOtpFields(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset Password using OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const fullCode = otpCode.join("");
    if (fullCode.length < 6) {
      setError("Please enter all 6 digits of the OTP code.");
      return;
    }

    const isPassValid = validatePassword(newPassword);
    const isConfirmValid = validateConfirmPassword(confirmPassword, newPassword);

    if (!isPassValid || !isConfirmValid) {
      setError("Please fix all validation errors before submitting.");
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email, fullCode, newPassword, confirmPassword);
      setSuccess("Your password has been successfully reset! Redirecting...");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP box change handler
  const handleOtpChange = (index: number, val: string) => {
    if (val && isNaN(Number(val))) return;

    const newCode = [...otpCode];
    newCode[index] = val.substring(val.length - 1);
    setOtpCode(newCode);

    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div style={{
      fontFamily: "var(--font-montserrat), sans-serif",
      background: "linear-gradient(160deg, #F8F9FA 0%, #E9ECEF 50%, #DEE2E6 100%)",
      minHeight: "calc(100vh - 100px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      padding: "24px 16px 64px 16px",
    }}>
      {/* Ambient background blobs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-10%", right: "-5%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,122,255,0.05) 0%, transparent 70%)",
          filter: "blur(50px)",
        }} />
        <div style={{
          position: "absolute", bottom: "-10%", left: "-5%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(88,86,214,0.05) 0%, transparent 70%)",
          filter: "blur(50px)",
        }} />
      </div>

      {/* Reset Card */}
      <div style={{
        background: "rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(30px) saturate(180%)",
        WebkitBackdropFilter: "blur(30px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.85)",
        borderRadius: "24px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
        marginTop: "20px",
        width: "100%",
        maxWidth: "720px",
        zIndex: 1,
        display: "grid",
        gridTemplateColumns: "1fr 1.2fr",
        overflow: "hidden",
        animation: "scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }} className="auth-card">
        
        {/* Left Side: Visual Editorial Panel */}
        <div style={{
          position: "relative",
          background: "url('https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop') center/cover no-repeat",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "36px",
          color: "#fff",
        }} className="auth-image-panel">
          {/* Overlays */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(28,28,30,0.25) 0%, rgba(28,28,30,0.85) 100%)",
            zIndex: 1,
          }} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <span style={{ fontSize: "28px", display: "block", marginBottom: "8px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}>💎</span>
            <h2 style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: "22px", fontWeight: 800,
              letterSpacing: "6px", margin: 0, textTransform: "uppercase",
              color: "#fff",
              textShadow: "0 2px 8px rgba(0,0,0,0.3)"
            }}>LUXURY.lk</h2>
            <p style={{ 
              fontSize: "11px", 
              color: "rgba(255,255,255,0.7)", 
              marginTop: "6px", 
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              fontWeight: 500
            }}>Secure & Verified Reset</p>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div style={{
          padding: "24px 30px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }} className="auth-form-panel">
          <div style={{ marginBottom: "14px" }}>
            <h3 style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: "19px", fontWeight: 700, color: "#1C1C1E",
              margin: 0, letterSpacing: "1.5px"
            }}>Reset Password</h3>
            <p style={{ fontSize: "11px", color: "#8E8E93", marginTop: "2px", letterSpacing: "0.2px" }}>
              {showOtpFields 
                ? "Enter the 6-digit OTP code sent to your email and your new password."
                : "Enter email to receive security reset instructions."}
            </p>
          </div>

          {showOtpFields ? (
            <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {error && (
                <div style={{
                  background: "rgba(255, 59, 48, 0.06)",
                  border: "1px solid rgba(255, 59, 48, 0.15)",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#FF3B30",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div style={{
                  background: "rgba(52, 199, 89, 0.06)",
                  border: "1px solid rgba(52, 199, 89, 0.15)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "11.5px",
                  fontWeight: 500,
                  color: "#34C759",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <span>✓</span>
                  <span>{success}</span>
                </div>
              )}

              {/* Email (Read Only) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={{ fontSize: "8.5px", fontWeight: 700, color: "#8E8E93", letterSpacing: "1px", textTransform: "uppercase" }}>Email Address</label>
                <input
                  type="text"
                  disabled
                  value={email}
                  style={{
                    border: "none",
                    borderBottom: "1px solid rgba(0,0,0,0.08)",
                    background: "transparent",
                    padding: "6px 0px",
                    fontSize: "13px",
                    color: "#8E8E93",
                    cursor: "not-allowed"
                  }}
                />
              </div>

              {/* OTP Digits Grid */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                <label style={{ fontSize: "8.5px", fontWeight: 700, color: "#8E8E93", letterSpacing: "1px", textTransform: "uppercase" }}>Enter 6-Digit OTP</label>
                <div style={{ display: "flex", gap: "8px", justifyContent: "space-between", margin: "4px 0" }}>
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { if (el) otpRefs.current[index] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      style={{
                        width: "32px",
                        height: "38px",
                        textAlign: "center",
                        fontSize: "18px",
                        fontWeight: "bold",
                        border: "none",
                        borderBottom: "2px solid rgba(0,0,0,0.12)",
                        background: "transparent",
                        outline: "none",
                        color: "#1C1C1E",
                        transition: "all 0.2s ease"
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderBottomColor = "#1C1C1E";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderBottomColor = "rgba(0,0,0,0.12)";
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* New Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
                <label htmlFor="newPassword" style={{ fontSize: "8.5px", fontWeight: 700, color: "#8E8E93", letterSpacing: "1px", textTransform: "uppercase" }}>New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  placeholder="••••••"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                  onBlur={(e) => validatePassword(e.target.value)}
                  style={{
                    border: "none",
                    borderBottom: newPasswordError ? "1.5px solid #FF3B30" : "1px solid rgba(0,0,0,0.12)",
                    borderRadius: "0px",
                    background: "transparent",
                    padding: "6px 0px",
                    outline: "none",
                    fontSize: "13px",
                    color: "#1C1C1E",
                    transition: "border-color 0.2s",
                  }}
                  className="luxury-input-line"
                />
              </div>

              {/* Confirm Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label htmlFor="confirmPassword" style={{ fontSize: "8.5px", fontWeight: 700, color: "#8E8E93", letterSpacing: "1px", textTransform: "uppercase" }}>Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    validateConfirmPassword(e.target.value, newPassword);
                  }}
                  onBlur={(e) => validateConfirmPassword(e.target.value, newPassword)}
                  style={{
                    border: "none",
                    borderBottom: confirmPasswordError ? "1.5px solid #FF3B30" : "1px solid rgba(0,0,0,0.12)",
                    borderRadius: "0px",
                    background: "transparent",
                    padding: "6px 0px",
                    outline: "none",
                    fontSize: "13px",
                    color: "#1C1C1E",
                    transition: "border-color 0.2s",
                  }}
                  className="luxury-input-line"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  background: "#1C1C1E",
                  border: "none",
                  borderRadius: "6px",
                  padding: "12px",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "8px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#000";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.25)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#1C1C1E";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>

              <div style={{ textAlign: "center", marginTop: "10px", fontSize: "11.5px" }}>
                <span 
                  onClick={() => {
                    setShowOtpFields(false);
                    setOtpCode(["", "", "", "", "", ""]);
                    setNewPassword("");
                    setConfirmPassword("");
                    setError("");
                    setSuccess("");
                  }}
                  style={{ color: "#1C1C1E", fontWeight: 700, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}
                >
                  Change Email / Request Code Again
                </span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRequestOtp} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {error && (
                <div style={{
                  background: "rgba(255, 59, 48, 0.06)",
                  border: "1px solid rgba(255, 59, 48, 0.15)",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#FF3B30",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div style={{
                  background: "rgba(52, 199, 89, 0.06)",
                  border: "1px solid rgba(52, 199, 89, 0.15)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "11.5px",
                  fontWeight: 500,
                  color: "#34C759",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <span>✓</span>
                  <span>{success}</span>
                </div>
              )}

              {/* Email field */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label htmlFor="email" style={{ fontSize: "9px", fontWeight: 700, color: "#8E8E93", letterSpacing: "1px", textTransform: "uppercase" }}>Email Address</label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validateEmail(e.target.value);
                  }}
                  onBlur={(e) => validateEmail(e.target.value)}
                  style={{
                    border: "none",
                    borderBottom: emailError ? "1.5px solid #FF3B30" : "1px solid rgba(0,0,0,0.12)",
                    borderRadius: "0px",
                    background: "transparent",
                    padding: "8px 0px",
                    outline: "none",
                    fontSize: "13.5px",
                    color: "#1C1C1E",
                    transition: "border-color 0.2s",
                  }}
                  className="luxury-input-line"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  background: "#1C1C1E",
                  border: "none",
                  borderRadius: "6px",
                  padding: "12px",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "6px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#000";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.25)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#1C1C1E";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </button>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "center", marginTop: "12px", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "#8E8E93" }}>
                    Remember your password?{" "}
                    <Link href="/auth/login" style={{ color: "#1C1C1E", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "3px" }}>
                      Sign In
                    </Link>
                  </span>
                </div>
                <div>
                  <span style={{ color: "#8E8E93" }}>
                    Don't have an account?{" "}
                    <Link href="/auth/register" style={{ color: "#1C1C1E", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "3px" }}>
                      Sign Up
                    </Link>
                  </span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      <style jsx global>{`
        .luxury-input-line:focus {
          border-color: #1C1C1E !important;
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 768px) {
          .auth-card {
            grid-template-columns: 1fr !important;
            max-width: 440px !important;
          }
          .auth-image-panel {
            display: none !important;
          }
          .auth-form-panel {
            padding: 32px 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
