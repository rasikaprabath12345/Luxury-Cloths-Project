// Self-contained storefront toast notification utility

export function showStorefrontToast(message: string, type: "success" | "error" | "info" = "info", duration = 3500) {
  if (typeof window === "undefined") return;

  let container = document.getElementById("storefront-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "storefront-toast-container";
    container.style.position = "fixed";
    container.style.top = "24px";
    container.style.right = "24px";
    container.style.zIndex = "99999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "10px";
    container.style.pointerEvents = "none";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.style.pointerEvents = "auto";
  toast.style.padding = "14px 20px";
  toast.style.borderRadius = "12px";
  toast.style.fontSize = "13px";
  toast.style.fontWeight = "600";
  toast.style.display = "flex";
  toast.style.alignItems = "center";
  toast.style.gap = "10px";
  toast.style.boxShadow = "0 8px 32px rgba(15,23,42,0.08)";
  toast.style.backdropFilter = "blur(12px)";
  toast.style.minWidth = "280px";
  toast.style.maxWidth = "420px";
  toast.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  toast.style.transform = "translateX(40px) scale(0.95)";
  toast.style.opacity = "0";
  toast.style.fontFamily = "var(--font-montserrat), sans-serif";

  // Colors based on type
  if (type === "success") {
    toast.style.background = "#f0fdf4";
    toast.style.color = "#16a34a";
    toast.style.border = "1px solid #bbf7d0";
  } else if (type === "error") {
    toast.style.background = "#fef2f2";
    toast.style.color = "#dc2626";
    toast.style.border = "1px solid #fecaca";
  } else {
    // info / warning
    toast.style.background = "#fffbeb";
    toast.style.color = "#d97706";
    toast.style.border = "1px solid #fef3c7";
  }

  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "⚠";

  toast.innerHTML = `
    <span style="font-size: 16px; font-weight: bold; flex-shrink: 0;">${icon}</span>
    <span style="flex: 1;">${message}</span>
    <button style="background: none; border: none; color: inherit; opacity: 0.5; cursor: pointer; font-size: 14px; font-weight: bold; margin-left: auto; padding: 2px 6px;">✕</button>
  `;

  // Close button action
  const closeBtn = toast.querySelector("button");
  const removeToast = () => {
    toast.style.transform = "translateX(40px) scale(0.95)";
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.remove();
    }, 300);
  };

  closeBtn?.addEventListener("click", removeToast);

  container.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.style.transform = "translateX(0) scale(1)";
    toast.style.opacity = "1";
  });

  setTimeout(() => {
    removeToast();
  }, duration);
}
