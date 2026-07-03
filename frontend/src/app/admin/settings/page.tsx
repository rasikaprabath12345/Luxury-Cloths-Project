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
        <p>Loading settings...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            color: #64748b;
          }
          .main-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e2e8f0;
            border-top-color: #2563eb;
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
            <p className="input-help">Enter standard country code + number without spaces or "+" (e.g., 94771234567)</p>
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
          <h2 className="panel-title">Live Cover Preview</h2>
          <p className="panel-desc">Mock view of how the homepage cover photo displays on the storefront.</p>

          <div className="mock-homepage-hero">
            <div
              className="hero-background"
              style={{ backgroundImage: `url(${heroImage || "/qw.jpg"})` }}
            />
            <div className="hero-gradient-overlay" />
            
            {/* Mock Content */}
            <div className="mock-hero-content">
              <div className="mock-pill">SUMMER COLLECTION — 2026</div>
              <h3 className="mock-hero-title">
                Define Your<br />
                <span className="mock-stroke">Luxury.</span>
              </h3>
              <p className="mock-hero-desc">Sri Lanka's finest premium fashion.</p>
              <div className="mock-btn">Shop Collection</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-page-wrapper {
          max-width: 1100px;
          margin: 0 auto;
          animation: fadeIn 0.4s ease-out;
        }

        .settings-header {
          margin-bottom: 32px;
        }

        .settings-title {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px;
          letter-spacing: -0.02em;
        }

        .settings-subtitle {
          font-size: 14px;
          color: #64748b;
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
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
        }

        .panel-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .panel-desc {
          font-size: 13px;
          color: #64748b;
          margin: 0 0 24px;
          line-height: 1.4;
        }

        .form-group {
          margin-bottom: 24px;
          flex: 1;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 10px;
        }

        .btn-upload {
          cursor: pointer;
          padding: 14px;
          border-radius: 12px;
          border: 2px dashed #cbd5e1;
          background: #f8fafc;
          font-size: 14px;
          font-weight: 600;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          width: 100%;
        }

        .btn-upload:hover {
          background: #f1f5f9;
          border-color: #3b82f6;
          color: #1e293b;
        }

        .divider-text {
          font-size: 10px;
          font-weight: 700;
          color: #94a3b8;
          text-align: center;
          margin: 20px 0;
          letter-spacing: 0.1em;
        }

        .section-divider {
          border: 0;
          border-top: 1px dashed #e2e8f0;
          margin: 28px 0 16px;
          width: 100%;
        }

        .input-help {
          font-size: 11px;
          color: #64748b;
          margin-top: 6px;
        }

        .url-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #0f172a;
          font-size: 14px;
          transition: all 0.2s;
        }

        .url-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .panel-actions {
          border-top: 1px solid #f1f5f9;
          padding-top: 20px;
          margin-top: auto;
        }

        .btn-save {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border: none;
          color: #ffffff;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-save:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.25);
        }

        .btn-save:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* Mock Homepage Hero CSS */
        .mock-homepage-hero {
          position: relative;
          width: 100%;
          height: 280px;
          border-radius: 14px;
          overflow: hidden;
          background-color: #1e293b;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 100px rgba(0,0,0,0.8);
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
          background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%);
        }

        .mock-hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 0 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: #ffffff;
        }

        .mock-pill {
          background: rgba(59, 130, 246, 0.2);
          border: 0.5px solid rgba(59, 130, 246, 0.4);
          padding: 3px 10px;
          border-radius: 9999px;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #60a5fa;
        }

        .mock-hero-title {
          font-size: 20px;
          font-weight: 800;
          line-height: 1.1;
          margin: 0;
          letter-spacing: -0.03em;
        }

        .mock-stroke {
          color: transparent;
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.8);
        }

        .mock-hero-desc {
          font-size: 9px;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        .mock-btn {
          margin-top: 4px;
          background: #ffffff;
          color: #1e293b;
          font-size: 9px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 6px;
        }

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
