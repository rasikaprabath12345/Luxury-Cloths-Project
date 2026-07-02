"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // OTP Verification States
  const [showOtp, setShowOtp] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // Field errors
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { register, googleLogin, verifyEmail, resendVerification } = useAuth();
  const router = useRouter();

  // Input refs for auto focus movement in OTP boxes
  const otpRefs = useRef<HTMLInputElement[]>([]);

  // OTP resend timer countdown
  useEffect(() => {
    let interval: any;
    if (showOtp && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [showOtp, timer]);

  // Helper validation functions
  const validateFullName = (val: string) => {
    if (!val.trim()) {
      setFullNameError("Full name is required.");
      return false;
    }
    if (val.trim().length < 3) {
      setFullNameError("Name must be at least 3 characters.");
      return false;
    }
    setFullNameError("");
    return true;
  };

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
      setPasswordError("Password is required.");
      return false;
    }
    if (val.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return false;
    }
    if (!/[A-Z]/.test(val)) {
      setPasswordError("Must contain at least one uppercase letter (A-Z).");
      return false;
    }
    if (!/[0-9]/.test(val)) {
      setPasswordError("Must contain at least one number (0-9).");
      return false;
    }
    setPasswordError("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Perform all validations
    const isNameValid = validateFullName(fullName);
    const isEmailValid = validateEmail(email);
    const isPassValid = validatePassword(password);
    const isConfirmValid = validateConfirmPassword(confirmPassword, password);

    if (!isNameValid || !isEmailValid || !isPassValid || !isConfirmValid) {
      setError("Please fix all errors in the form before submitting.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await register(fullName, email, password);
      if (res && res.status === "VerificationRequired") {
        setOtpEmail(email);
        setShowOtp(true);
        setTimer(60);
        setCanResend(false);
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP handlers
  const handleOtpChange = (index: number, val: string) => {
    // Only accept numeric inputs
    if (val && isNaN(Number(val))) return;

    const newCode = [...otpCode];
    newCode[index] = val.substring(val.length - 1); // Only take last character
    setOtpCode(newCode);

    // Auto-focus next input
    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Auto-focus previous input on Backspace
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    setOtpSuccess("");

    const fullCode = otpCode.join("");
    if (fullCode.length < 6) {
      setOtpError("Please enter all 6 digits of the OTP code.");
      return;
    }

    setIsLoading(true);
    try {
      await verifyEmail(otpEmail, fullCode);
      setOtpSuccess("Email verified successfully!");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      setOtpError(err.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setOtpError("");
    setOtpSuccess("");
    setIsLoading(true);

    try {
      await resendVerification(otpEmail);
      setOtpSuccess("A new OTP code has been sent to your email.");
      setTimer(60);
      setCanResend(false);
      setOtpCode(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      setOtpError(err.message || "Resend failed");
    } finally {
      setIsLoading(false);
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

      {/* Register Card */}
      <div style={{
        background: "rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(30px) saturate(180%)",
        WebkitBackdropFilter: "blur(30px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.85)",
        borderRadius: "24px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
        marginTop: "20px",
        width: "100%",
        maxWidth: "760px",
        zIndex: 1,
        display: "grid",
        gridTemplateColumns: "1fr 1.3fr",
        overflow: "hidden",
        animation: "scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }} className="auth-card">
        
        {/* Left Side: Visual Editorial Panel */}
        <div style={{
          position: "relative",
          background: "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop') center/cover no-repeat",
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
            }}>Join the Premium Circle</p>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div style={{
          padding: "24px 30px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }} className="auth-form-panel">
          {showOtp ? (
            /* OTP Verification Screen */
            <form onSubmit={handleOtpVerify} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <h3 style={{
                  fontFamily: "var(--font-playfair), serif",
                  fontSize: "19px", fontWeight: 700, color: "#1C1C1E",
                  margin: 0, letterSpacing: "1.5px"
                }}>Verify Your Email</h3>
                <p style={{ fontSize: "11px", color: "#8E8E93", marginTop: "4px", lineHeight: "1.4" }}>
                  We have sent a 6-digit OTP code to <strong style={{ color: "#1C1C1E" }}>{otpEmail}</strong>. Please enter it below.
                </p>
              </div>

              {otpError && (
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
                  <span>{otpError}</span>
                </div>
              )}

              {otpSuccess && (
                <div style={{
                  background: "rgba(52, 199, 89, 0.06)",
                  border: "1px solid rgba(52, 199, 89, 0.15)",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#34C759",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <span>✓</span>
                  <span>{otpSuccess}</span>
                </div>
              )}

              {/* OTP Digits Grid */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "space-between", margin: "8px 0" }}>
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
                      width: "42px",
                      height: "48px",
                      textAlign: "center",
                      fontSize: "22px",
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
                {isLoading ? (
                  <>
                    <span className="spinner-white" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify OTP</span>
                )}
              </button>

              <div style={{ textAlign: "center", marginTop: "10px", fontSize: "12px", color: "#8E8E93" }}>
                Didn't receive code?{" "}
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#1C1C1E",
                      fontWeight: 700,
                      textDecoration: "underline",
                      cursor: "pointer",
                      padding: 0,
                      fontFamily: "inherit"
                    }}
                  >
                    Resend Code
                  </button>
                ) : (
                  <span>Resend in <strong style={{ color: "#1C1C1E" }}>{timer}s</strong></span>
                )}
              </div>
            </form>
          ) : (
            <>
              <div style={{ marginBottom: "12px" }}>
                <h3 style={{
                  fontFamily: "var(--font-playfair), serif",
                  fontSize: "19px", fontWeight: 700, color: "#1C1C1E",
                  margin: 0, letterSpacing: "1.5px"
                }}>Create Account</h3>
                <p style={{ fontSize: "11px", color: "#8E8E93", marginTop: "2px", letterSpacing: "0.2px" }}>
                  Experience personalized luxury recommendations.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
                  {/* Full Name field */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label htmlFor="fullName" style={{ fontSize: "9px", fontWeight: 700, color: "#8E8E93", letterSpacing: "1px", textTransform: "uppercase" }}>Full Name</label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      placeholder="Ashan Silva"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        validateFullName(e.target.value);
                      }}
                      onBlur={(e) => validateFullName(e.target.value)}
                      style={{
                        border: "none",
                        borderBottom: fullNameError ? "1.5px solid #FF3B30" : "1px solid rgba(0,0,0,0.12)",
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

                  {/* Password field */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label htmlFor="password" style={{ fontSize: "9px", fontWeight: 700, color: "#8E8E93", letterSpacing: "1px", textTransform: "uppercase" }}>Password</label>
                    <input
                      id="password"
                      type="password"
                      required
                      placeholder="•••••• (min 6)"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        validatePassword(e.target.value);
                        if (confirmPassword) validateConfirmPassword(confirmPassword, e.target.value);
                      }}
                      onBlur={(e) => validatePassword(e.target.value)}
                      style={{
                        border: "none",
                        borderBottom: passwordError ? "1.5px solid #FF3B30" : "1px solid rgba(0,0,0,0.12)",
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

                  {/* Confirm Password field */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label htmlFor="confirmPassword" style={{ fontSize: "9px", fontWeight: 700, color: "#8E8E93", letterSpacing: "1px", textTransform: "uppercase" }}>Confirm Password</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      placeholder="••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        validateConfirmPassword(e.target.value, password);
                      }}
                      onBlur={(e) => validateConfirmPassword(e.target.value, password)}
                      style={{
                        border: "none",
                        borderBottom: confirmPasswordError ? "1.5px solid #FF3B30" : "1px solid rgba(0,0,0,0.12)",
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
                </div>

                <div style={{ display: "flex", alignItems: "start", fontSize: "11.5px", marginTop: "4px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "#48484A", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      required
                      style={{
                        width: "13px",
                        height: "13px",
                        accentColor: "#1C1C1E",
                        cursor: "pointer"
                      }}
                    />
                    <span style={{ fontWeight: 500 }}>I agree to the <a href="#" style={{ color: "#1C1C1E", textDecoration: "underline", fontWeight: 600 }}>Terms & Conditions</a></span>
                  </label>
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
                  {isLoading ? (
                    <>
                      <span className="spinner-white" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>

                <div style={{ textAlign: "center", marginTop: "10px", fontSize: "12px", color: "#8E8E93" }}>
                  Already have an account?{" "}
                  <Link href="/auth/login" style={{ color: "#1C1C1E", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "3px" }}>
                    Sign In
                  </Link>
                </div>

                {/* OR Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "4px 0" }}>
                  <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.1)" }} />
                  <span style={{ fontSize: "10px", fontWeight: 600, color: "#AEAEB2", letterSpacing: "1px", textTransform: "uppercase" }}>or</span>
                  <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.1)" }} />
                </div>

                {/* Google Sign-Up Button */}
                <button
                  id="google-signup-btn"
                  type="button"
                  disabled={isGoogleLoading}
                  onClick={async () => {
                    setIsGoogleLoading(true);
                    try {
                      await googleLogin();
                    } catch (err: any) {
                      setError(err.message || "Google sign up failed");
                      setIsGoogleLoading(false);
                    }
                  }}
                  style={{
                    background: "#fff",
                    border: "1.5px solid rgba(0,0,0,0.12)",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    color: "#3c4043",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    cursor: isGoogleLoading ? "not-allowed" : "pointer",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    width: "100%",
                    opacity: isGoogleLoading ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isGoogleLoading) {
                      e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.12)";
                      e.currentTarget.style.borderColor = "rgba(0,0,0,0.2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
                    e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)";
                  }}
                >
                  {isGoogleLoading ? (
                    <span className="spinner-dark" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.4-.2-2.7-.5-4z" fill="#FFC107"/>
                      <path d="M6.3 14.7l7 5.1C15.2 16.3 19.3 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.6 0-14.2 4.2-17.7 10.7z" fill="#FF3D00"/>
                      <path d="M24 45c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.8 35.9 27 37 24 37c-6 0-10.6-3-11.8-8.3l-7 5.4C8.1 40.6 15.4 45 24 45z" fill="#4CAF50"/>
                      <path d="M44.5 20H24v8.5h11.8c-.6 2.9-2.3 5.4-4.7 7.1l6.6 5.6C41.7 37.9 45 31.6 45 24c0-1.4-.2-2.7-.5-4z" fill="#1976D2"/>
                    </svg>
                  )}
                  <span>{isGoogleLoading ? "Signing up..." : "Continue with Google"}</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        .luxury-input-line:focus {
          border-color: #1C1C1E !important;
        }
        .spinner-white {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner-dark {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0,0,0,0.15);
          border-top-color: #3c4043;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
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
