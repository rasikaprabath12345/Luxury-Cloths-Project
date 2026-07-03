"use client";

import { useState, useEffect } from "react";
import { settingsAPI, uploadAPI } from "@/lib/api";
import { showToast } from "@/lib/adminUtils";

export default function AdminSettingsPage() {
  const [heroImage, setHeroImage] = useState("/qw.jpg");
  const [whatsApp, setWhatsApp] = useState("");
  const [messenger, setMessenger] = useState("");
  const [facebook, setFacebook] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsAPI.getSettings();
        if (response.data) {
          if (response.data.heroImage) setHeroImage(response.data.heroImage);
          if (response.data.whatsApp) setWhatsApp(response.data.whatsApp);
          if (response.data.messenger) setMessenger(response.data.messenger);
          if (response.data.facebook) setFacebook(response.data.facebook);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        showToast("Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file.", "warning");
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      const uploadedUrl = response.data.url;
      setHeroImage(uploadedUrl);
      showToast("Image uploaded successfully!", "success");
    } catch (error) {
      console.error("Error uploading image:", error);
      showToast("Failed to upload image.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!heroImage.trim()) {
      showToast("Please specify or upload a cover image.", "warning");
      return;
    }

    // Auto-format WhatsApp number to standard international format if user entered one
    let formattedWhatsApp = whatsApp.trim();
    if (formattedWhatsApp && !formattedWhatsApp.includes("X")) {
      let cleaned = formattedWhatsApp.replace(/\D/g, ''); // Remove non-digits
      if (cleaned.startsWith('00')) {
        cleaned = cleaned.slice(2);
      }
      if (cleaned.startsWith('0') && cleaned.length === 10) {
        cleaned = '94' + cleaned.slice(1);
      } else if (cleaned.length === 9 && /^[7][01245678]/.test(cleaned)) {
        cleaned = '94' + cleaned;
      }
      formattedWhatsApp = cleaned;
      setWhatsApp(cleaned); // Update the input field display
    }

    setIsSaving(true);
    try {
      await settingsAPI.updateSettings({
        heroImage,
        whatsApp: formattedWhatsApp,
        messenger,
        facebook,
      });
      showToast("Store settings saved successfully!", "success");
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast("Failed to save settings.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <span className="main-spinner" />
        <p>Loading storefront settings...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            color: var(--admin-text-muted);
          }
          .main-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(197, 168, 128, 0.1);
            border-top-color: var(--admin-accent-gold-dark);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 12px;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="settings-page-wrapper">
      <header className="settings-header">
        <div>
          <h1 className="settings-title">Storefront Settings</h1>
          <p className="settings-subtitle">Manage appearance and customize general options of your store.</p>
        </div>
      </header>

      <div className="settings-grid">
        {/* Form panel */}
        <div className="settings-card form-panel">
          <h2 className="panel-title">Homepage Hero Banner</h2>
          <p className="panel-desc">Set the cover photo that customers see at the top of the homepage.</p>

          <div className="form-group">
            <label className="form-label">Cover Image Source</label>
            <div className="upload-section">
              <label className="btn-upload">
                {isUploading ? (
                  <>
                    <span className="spinner-dark" /> Uploading...
                  </>
                ) : (
                  <>📷 Select & Upload New Image</>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            <div className="url-section">
              <div className="divider-text">OR ENTER IMAGE URL DIRECTLY</div>
              <input
                type="text"
                className="url-input"
                placeholder="e.g. /qw.jpg or https://images.unsplash.com/..."
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
              />
            </div>
          </div>

          <hr className="section-divider" />

          <h2 className="panel-title" style={{ marginTop: "24px" }}>Social & Support Channels</h2>
          <p className="panel-desc">Configure customer support chat icons and links.</p>

          <div className="form-group">
            <label className="form-label">WhatsApp Number</label>
            <input
              type="text"
              className="url-input"
              placeholder="e.g. 94771234567"
              value={whatsApp}
              onChange={(e) => setWhatsApp(e.target.value)}
            />
            <p className="input-help">Enter standard country code + number without spaces or &quot;+&quot; (e.g., 94771234567)</p>
          </div>

          <div className="form-group">
            <label className="form-label">Messenger Username</label>
            <input
              type="text"
              className="url-input"
              placeholder="e.g. your_page_name"
              value={messenger}
              onChange={(e) => setMessenger(e.target.value)}
            />
            <p className="input-help">Your page name or username used to open Messenger chat (m.me/your_page_name)</p>
          </div>

          <div className="form-group" style={{ marginBottom: "28px" }}>
            <label className="form-label">Facebook URL</label>
            <input
              type="text"
              className="url-input"
              placeholder="e.g. https://facebook.com/your_page_name"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
            />
            <p className="input-help">Full link to your Facebook page for the site footer</p>
          </div>

          <div className="panel-actions">
            <button
              onClick={handleSave}
              disabled={isSaving || isUploading}
              className="btn-save"
            >
              {isSaving ? (
                <>
                  <span className="spinner" /> Saving Changes...
                </>
              ) : (
                <>💾 Save Storefront Settings</>
              )}
            </button>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="settings-card preview-panel">
          <h2 className="panel-title">Storefront Live Mockup</h2>
          <p className="panel-desc">Real-time simulation of cover banners and chat overlays on the client storefront.</p>

          {/* Interactive Phone mockup */}
          <div className="mock-store-screen">
            {/* Nav Header */}
            <div className="mock-store-navbar">
              <span className="mock-store-logo">LUXURY.LK</span>
              <div className="mock-store-menu">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>

            {/* Banner Section */}
            <div className="mock-homepage-hero">
              <div
                className="hero-background"
                style={{ backgroundImage: `url(${heroImage || "/qw.jpg"})` }}
              />
              <div className="hero-gradient-overlay" />
              
              {/* Mock Content */}
              <div className="mock-hero-content">
                <div className="mock-pill">SUMMER EXCLUSIVE</div>
                <h3 className="mock-hero-title">
                  Define Your<br />
                  <span className="mock-stroke">Luxury.</span>
                </h3>
                <p className="mock-hero-desc">Sri Lanka&apos;s finest premium fashion.</p>
                <div className="mock-btn">Shop Catalog</div>
              </div>
            </div>

            {/* Body placeholder */}
            <div className="mock-store-body">
              <div className="mock-body-heading">Best Sellers</div>
              <div className="mock-grid-products">
                <div className="mock-product-card"><div className="p-img" /></div>
                <div className="mock-product-card"><div className="p-img" /></div>
              </div>
            </div>

            {/* Chat Overlays Floating bar preview */}
            <div className="mock-chat-overlay">
              {whatsApp && (
                <div className="mock-chat-btn wa" title={`WhatsApp: ${whatsApp}`}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.233-1.371a9.994 9.994 0 0 0 4.779 1.22c5.507 0 9.99-4.478 9.99-9.985C22.002 6.478 17.518 2 12.012 2zm5.727 14.156c-.25.703-1.453 1.282-1.992 1.375-.484.084-.972.164-3.136-.695-2.766-1.1-4.527-3.926-4.664-4.113-.137-.188-1.11-1.482-1.11-2.83 0-1.348.703-2.01.953-2.28.25-.27.547-.337.727-.337.18 0 .36.004.515.012.164.008.387-.06.602.46.222.536.758 1.856.824 1.992.066.137.11.297.016.484-.094.188-.14.305-.28.472-.14.168-.297.375-.426.5-.145.14-.297.293-.129.582.168.29.746 1.234 1.6 2 .734.656 1.355.856 1.668.992.313.137.496.117.68-.094.184-.21.785-.91.996-1.22.21-.31.422-.258.71-.15.29.11 1.836.864 2.15 1.02.312.156.52.23.597.363.078.133.078.77-.172 1.472z"/></svg>
                </div>
              )}
              {messenger && (
                <div className="mock-chat-btn msg" title={`Messenger: ${messenger}`}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.36 2 2 6.13 2 11.23c0 2.9 1.4 5.5 3.67 7.2L5 22l3.43-1.88c1.1.3 2.27.48 3.57.48 5.64 0 10-4.13 10-9.23C22 6.13 17.64 2 12 2zm1.25 11.65l-2.3-2.45-4.5 2.45 4.95-5.25 2.35 2.5 4.45-2.5-4.95 5.25z"/></svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-page-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          animation: fadeIn 0.4s ease-out;
        }

        .settings-header {
          margin-bottom: 32px;
        }

        .settings-title {
          font-size: 32px;
          font-weight: 900;
          color: var(--admin-text-main);
          margin: 0 0 6px;
        }

        .settings-subtitle {
          font-size: 13.5px;
          color: var(--admin-text-muted);
          margin: 0;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
        }

        @media (max-width: 900px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }

        .settings-card {
          background: #ffffff;
          border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-lg);
          padding: 28px;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
        }

        .panel-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--admin-text-main);
          margin: 0 0 4px;
        }

        .panel-desc {
          font-size: 13px;
          color: var(--admin-text-muted);
          margin: 0 0 24px;
          line-height: 1.4;
          font-weight: 500;
        }

        .form-group {
          margin-bottom: 24px;
          flex: 1;
        }

        .form-label {
          display: block;
          font-size: 12.5px;
          font-weight: 700;
          color: var(--admin-text-main);
          margin-bottom: 10px;
        }

        .btn-upload {
          cursor: pointer;
          padding: 14px;
          border-radius: var(--admin-radius-md);
          border: 2px dashed var(--admin-border);
          background: #f8fafc;
          font-size: 13.5px;
          font-weight: 700;
          color: var(--admin-text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          width: 100%;
        }

        .btn-upload:hover {
          background: #f1f5f9;
          border-color: var(--admin-accent-gold-dark);
          color: var(--admin-text-main);
        }

        .divider-text {
          font-size: 10px;
          font-weight: 800;
          color: var(--admin-text-muted);
          text-align: center;
          margin: 20px 0;
          letter-spacing: 0.15em;
        }

        .section-divider {
          border: 0;
          border-top: 1.5px dashed var(--admin-border);
          margin: 28px 0 16px;
          width: 100%;
        }

        .input-help {
          font-size: 11.5px;
          color: var(--admin-text-muted);
          margin-top: 6px;
          font-weight: 500;
        }

        .url-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: var(--admin-radius-md);
          border: 1.5px solid var(--admin-border);
          background: #ffffff;
          color: var(--admin-text-main);
          font-size: 14px;
          font-family: var(--font-body);
          outline: none;
          transition: all 0.2s;
        }

        .url-input:focus {
          border-color: var(--admin-accent-gold-dark);
          box-shadow: 0 0 0 3px rgba(197, 168, 128, 0.1);
        }

        .panel-actions {
          border-top: 1.5px solid var(--admin-border);
          padding-top: 20px;
          margin-top: auto;
        }

        .btn-save {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, var(--admin-primary) 0%, var(--admin-primary-light) 100%);
          border: none;
          color: #ffffff;
          border-radius: var(--admin-radius-md);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s;
          font-size: 13.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.1);
        }

        .btn-save:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.2);
        }

        .btn-save:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* Mock Store Screen UI */
        .mock-store-screen {
          position: relative;
          width: 100%;
          background-color: #ffffff;
          border: 6px solid #1e293b;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
          display: flex;
          flex-direction: column;
          min-height: 480px;
        }
        
        .mock-store-navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 18px;
          background: #ffffff;
          border-bottom: 1px solid #f1f5f9;
        }
        
        .mock-store-logo {
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.8px;
          color: #000;
        }
        
        .mock-store-menu {
          display: flex;
          gap: 3px;
        }
        .mock-store-menu .dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #94a3b8;
        }

        /* Mock Homepage Hero CSS */
        .mock-homepage-hero {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
          background-color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-background {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: background-image 0.5s ease;
        }

        .hero-gradient-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.6) 100%);
        }

        .mock-hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 0 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: #ffffff;
        }

        .mock-pill {
          background: rgba(197, 168, 128, 0.2);
          border: 0.5px solid rgba(197, 168, 128, 0.4);
          padding: 3px 8px;
          border-radius: 9999px;
          font-size: 7.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--admin-accent-gold);
        }

        .mock-hero-title {
          font-size: 17px;
          font-weight: 800;
          line-height: 1.1;
          margin: 0;
          letter-spacing: -0.02em;
          font-family: var(--font-display);
        }

        .mock-stroke {
          color: transparent;
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.85);
        }

        .mock-hero-desc {
          font-size: 8px;
          color: rgba(255, 255, 255, 0.75);
          margin: 0;
        }

        .mock-btn {
          margin-top: 4px;
          background: #ffffff;
          color: #1e293b;
          font-size: 8px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .mock-store-body {
          padding: 16px;
          flex: 1;
          background: #f8fafc;
        }
        
        .mock-body-heading {
          font-size: 11px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .mock-grid-products {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        
        .mock-product-card {
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          padding: 6px;
          height: 90px;
        }
        .mock-product-card .p-img {
          width: 100%;
          height: 100%;
          background: #f1f5f9;
          border-radius: 6px;
        }

        /* Mock Chat overlay */
        .mock-chat-overlay {
          position: absolute;
          bottom: 16px;
          right: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 10;
        }
        
        .mock-chat-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          cursor: pointer;
          transition: transform 0.2s;
        }
        .mock-chat-btn:hover {
          transform: scale(1.1);
        }
        
        .mock-chat-btn.wa { background: #25d366; }
        .mock-chat-btn.msg { background: #0084ff; }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }

        .spinner-dark {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-top-color: #475569;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
