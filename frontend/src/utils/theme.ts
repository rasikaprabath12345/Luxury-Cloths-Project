// ─── GLASS STYLES ───────────────────────────────────────────────────────────
import React from "react";

export const glass = {
  card: {
    background: "rgba(255,255,255,0.72)",
    backdropFilter: "blur(28px) saturate(180%)",
    WebkitBackdropFilter: "blur(28px) saturate(180%)",
    border: "1px solid rgba(255,255,255,0.85)",
    borderRadius: "24px",
    boxShadow: "0 2px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
  } as React.CSSProperties,
  dark: {
    background: "rgba(28,28,30,0.78)",
    backdropFilter: "blur(32px) saturate(200%)",
    WebkitBackdropFilter: "blur(32px) saturate(200%)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "24px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
  } as React.CSSProperties,
  nav: {
    background: "rgba(242,242,247,0.82)",
    backdropFilter: "blur(40px) saturate(200%)",
    WebkitBackdropFilter: "blur(40px) saturate(200%)",
    borderBottom: "0.5px solid rgba(0,0,0,0.10)",
    boxShadow: "0 0.5px 0 rgba(0,0,0,0.08)",
  } as React.CSSProperties,
  pill: {
    background: "rgba(255,255,255,0.68)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "0.5px solid rgba(255,255,255,0.9)",
    borderRadius: "100px",
    boxShadow: "0 1px 12px rgba(0,0,0,0.08)",
  } as React.CSSProperties,
};
