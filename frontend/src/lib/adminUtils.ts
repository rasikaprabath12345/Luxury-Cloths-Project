// Professional toast notification & confirm dialog utilities for Admin

type ToastType = "success" | "error" | "warning" | "info";

const TOAST_ICONS: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

export function showToast(message: string, type: ToastType = "info", duration = 3500) {
  if (typeof window === "undefined") return;

  const container = document.getElementById("admin-toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `admin-toast toast-${type}`;
  toast.innerHTML = `
    <span class="admin-toast-icon">${TOAST_ICONS[type]}</span>
    <span>${message}</span>
    <button class="admin-toast-close" onclick="this.parentElement.classList.add('removing'); setTimeout(() => this.parentElement.remove(), 300)">✕</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("removing");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

export function showConfirm(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = "Delete",
  confirmStyle: "danger" | "primary" = "danger"
) {
  if (typeof window === "undefined") return;

  const overlay = document.createElement("div");
  overlay.className = "admin-confirm-overlay";

  const close = () => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 200);
  };

  overlay.innerHTML = `
    <div class="admin-confirm-card">
      <h3 class="admin-confirm-title">${title}</h3>
      <p class="admin-confirm-msg">${message}</p>
      <div class="admin-confirm-actions">
        <button class="admin-confirm-btn admin-confirm-cancel" id="confirm-cancel">Cancel</button>
        <button class="admin-confirm-btn admin-confirm-${confirmStyle}" id="confirm-ok">${confirmLabel}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector("#confirm-cancel")?.addEventListener("click", close);
  overlay.querySelector("#confirm-ok")?.addEventListener("click", () => {
    close();
    onConfirm();
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
}
