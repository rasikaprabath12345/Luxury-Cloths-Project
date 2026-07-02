"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
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

      {/* Login Card */}
      <div style={{
        background: "rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(30px) saturate(180%)",
        WebkitBackdropFilter: "blur(30px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.85)",
        borderRadius: "24px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
        marginTop: "-40px",
        width: "100%",
        maxWidth: "840px",
        zIndex: 1,
        display: "grid",
        gridTemplateColumns: "1fr 1.2fr",
        overflow: "hidden",
        animation: "scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }} className="auth-card">
        
        {/* Left Side: Visual Editorial Panel */}
        <div style={{
          position: "relative",
          background: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop') center/cover no-repeat",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "36px",
          color: "#fff",
        }} className="auth-image-panel">
          {/* Overlays */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(28,28,30,0.2) 0%, rgba(28,28,30,0.85) 100%)",
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
            }}>Premium Editorial Fashion</p>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div style={{
          padding: "36px 44px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }} className="auth-form-panel">
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: "20px", fontWeight: 700, color: "#1C1C1E",
              margin: 0, letterSpacing: "1.5px"
            }}>Welcome Back</h3>
            <p style={{ fontSize: "11.5px", color: "#8E8E93", marginTop: "4px", letterSpacing: "0.2px" }}>
              Sign in to experience luxury fashion.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {error && (
              <div style={{
                background: "rgba(255, 59, 48, 0.06)",
                border: "1px solid rgba(255, 59, 48, 0.15)",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "11.5px",
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

            {/* Email field */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label htmlFor="email" style={{ fontSize: "9px", fontWeight: 700, color: "#8E8E93", letterSpacing: "1px", textTransform: "uppercase" }}>Email Address</label>
              <input
                id="email"
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  border: "none",
                  borderBottom: "1px solid rgba(0,0,0,0.12)",
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  border: "none",
                  borderBottom: "1px solid rgba(0,0,0,0.12)",
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

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11.5px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "#48484A", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  style={{
                    width: "13px",
                    height: "13px",
                    accentColor: "#1C1C1E",
                    cursor: "pointer"
                  }}
                />
                <span style={{ fontWeight: 500 }}>Remember me</span>
              </label>
              <Link href="/auth/forgot-password" style={{ color: "#1C1C1E", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: "3px" }}>
                Forgot password?
              </Link>
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
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            <div style={{ textAlign: "center", marginTop: "12px", fontSize: "12px", color: "#8E8E93" }}>
              Don't have an account?{" "}
              <Link href="/auth/register" style={{ color: "#1C1C1E", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "3px" }}>
                Sign Up
              </Link>
            </div>

            {/* OR Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "4px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.1)" }} />
              <span style={{ fontSize: "10px", fontWeight: 600, color: "#AEAEB2", letterSpacing: "1px", textTransform: "uppercase" }}>or</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.1)" }} />
            </div>

            {/* Google Sign-In Button */}
            <button
              id="google-signin-btn"
              type="button"
              disabled={isGoogleLoading}
              onClick={async () => {
                setIsGoogleLoading(true);
                try {
                  await googleLogin();
                } catch (err: any) {
                  setError(err.message || "Google login failed");
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
              <span>{isGoogleLoading ? "Signing in..." : "Continue with Google"}</span>
            </button>
          </form>
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
        .spinner-dark {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0,0,0,0.15);
          border-top-color: #3c4043;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
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