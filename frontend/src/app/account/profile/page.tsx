"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import axios from "axios";

export default function ProfilePage() {
  const { user, updateProfile, isLoading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal state for confirming profile picture change
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    avatar: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Maximum size is 5MB.");
      return;
    }

    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowConfirmModal(true);
  };

  const executeUpload = async () => {
    if (!pendingFile) return;

    setIsUploading(true);
    setError("");
    setShowConfirmModal(false);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", pendingFile);

      const response = await axios.post(
        "http://localhost:5226/api/Uploads/image",
        formDataUpload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const imageUrl = response.data.url;
      setFormData((prev) => ({ ...prev, avatar: imageUrl }));

      // Auto-save the avatar
      await updateProfile({
        fullName: formData.fullName || user?.fullName,
        phone: formData.phone || user?.phone,
        avatar: imageUrl,
      });

      setSuccess("Profile photo updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      setPendingFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }
    }
  };

  const cancelUpload = () => {
    setPendingFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    setShowConfirmModal(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await updateProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        avatar: formData.avatar,
      });
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#aa841c] border-t-transparent rounded-full animate-spin"></div>
          <span className="font-montserrat text-sm text-gray-400 font-medium">Loading profile...</span>
        </div>
      </div>
    );
  }

  const initials = user?.fullName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.04)] overflow-hidden">

        {/* ─── Cover Banner + Avatar ─── */}
        <div className="relative">
          {/* Banner */}
          <div className="h-44 bg-gradient-to-br from-[#1C1C1E] via-[#2C2C2E] to-[#1C1C1E] relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23aa841c' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
            <div className="absolute right-0 top-0 w-80 h-80 bg-[#aa841c]/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute left-10 bottom-0 w-48 h-48 bg-[#d4af37]/8 rounded-full blur-[60px] pointer-events-none" />
            
            {/* Header Text */}
            <div className="relative z-10 px-8 pt-6">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#d4af37] uppercase block mb-1 font-montserrat">
                Member Area
              </span>
              <h1 className="text-2xl font-bold font-playfair tracking-tight text-white">
                Your Profile
              </h1>
              <p className="text-gray-500 mt-1 text-[11px] font-montserrat font-light">
                Manage your personal details and profile photo
              </p>
            </div>
          </div>

          {/* Avatar - overlapping the banner */}
          <div className="absolute -bottom-14 left-8">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className={`w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg transition-all duration-300 ${dragActive ? 'ring-4 ring-[#aa841c]/40 scale-105' : ''}`}>
                {(formData.avatar || user?.avatar) ? (
                  <img
                    src={formData.avatar || user?.avatar || ""}
                    alt={user?.fullName || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#aa841c] to-[#d4af37] flex items-center justify-center">
                    <span className="text-white text-3xl font-bold font-playfair">{initials}</span>
                  </div>
                )}
              </div>

              {/* Camera overlay */}
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-1">
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span className="text-white text-[9px] font-bold tracking-wider uppercase">Change</span>
                </div>
              </div>

              {/* Upload spinner */}
              {isUploading && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Edit button - top right */}
          <div className="absolute top-4 right-6 z-10">
            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setError("");
                setSuccess("");
              }}
              className="px-4 py-2 rounded-xl text-[10px] font-bold tracking-[0.15em] uppercase font-montserrat transition-all duration-300 flex items-center gap-2"
              style={{
                background: isEditing ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
                color: isEditing ? '#ff6b6b' : '#d4af37',
                border: `1px solid ${isEditing ? 'rgba(255,107,107,0.3)' : 'rgba(212,175,55,0.3)'}`,
                backdropFilter: 'blur(12px)',
              }}
            >
              {isEditing ? (
                <>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit Profile
                </>
              )}
            </button>
          </div>
        </div>

        {/* ─── User Info Section ─── */}
        <div className="pt-18 px-8 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6" style={{ paddingTop: '60px' }}>
            <div>
              <h2 className="text-2xl font-bold font-playfair text-[#1C1C1E] leading-tight">
                {user?.fullName}
              </h2>
              <p className="text-sm font-montserrat text-gray-500 mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold tracking-[0.15em] text-[#aa841c] bg-[#aa841c]/8 border border-[#aa841c]/15 rounded-full uppercase font-montserrat">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {user?.role || "Member"}
                </span>
                <span className="text-[11px] font-montserrat text-gray-400">
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "Recently"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Alerts ─── */}
        <div className="px-8">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-4 mb-5 flex items-center gap-2.5 font-montserrat text-sm text-red-800 font-medium animate-in">
              <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2.5} strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              </span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 mb-5 flex items-center gap-2.5 font-montserrat text-sm text-emerald-800 font-medium animate-in">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </span>
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* ─── Content ─── */}
        <div className="px-8 pb-8">
          {/* Image Upload Area (always visible) */}
          <div className="mb-8 p-5 rounded-2xl border border-dashed border-gray-200 bg-[#FAFAF9] hover:border-[#aa841c]/30 hover:bg-[#aa841c]/[0.02] transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#aa841c]/8 flex items-center justify-center flex-shrink-0">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#aa841c" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1C1C1E] font-montserrat">Profile Photo</p>
                <p className="text-[11px] text-gray-400 font-montserrat mt-0.5">
                  Click avatar above or drag & drop an image. JPG, PNG, GIF or WebP · Max 5MB
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-[#1C1C1E] text-white rounded-xl hover:bg-[#aa841c] disabled:opacity-50 text-[10px] font-bold tracking-wider uppercase font-montserrat transition-all duration-300 flex-shrink-0"
              >
                {isUploading ? "Uploading..." : "Upload Photo"}
              </button>
            </div>
          </div>

          {/* Form / Details */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-5 font-montserrat">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-2.5">
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#aa841c" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#aa841c]/15 focus:border-[#aa841c] text-sm text-gray-900 transition-all duration-200 bg-white"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-2.5">
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#aa841c" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#aa841c]/15 focus:border-[#aa841c] text-sm text-gray-900 transition-all duration-200 bg-white"
                    placeholder="+94 77 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-2.5">
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#aa841c" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Avatar URL (Optional)
                </label>
                <input
                  type="url"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#aa841c]/15 focus:border-[#aa841c] text-sm text-gray-900 transition-all duration-200 bg-white font-mono text-xs"
                  placeholder="https://example.com/avatar.jpg"
                />
                <p className="text-[10px] text-gray-400 mt-1.5 font-montserrat">
                  Or use the upload button above to add a photo directly
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3.5 px-6 bg-gradient-to-r from-[#1C1C1E] to-[#2C2C2E] text-white rounded-xl hover:from-[#aa841c] hover:to-[#c9a534] disabled:opacity-50 font-bold text-[11px] tracking-[0.12em] uppercase transition-all duration-300 shadow-lg shadow-[#1C1C1E]/10 hover:shadow-[#aa841c]/20 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-0 font-montserrat">
              {/* Info Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div className="p-5 rounded-2xl bg-[#FAFAF9] border border-gray-100/80 hover:border-[#aa841c]/15 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#aa841c]/8 flex items-center justify-center group-hover:bg-[#aa841c]/12 transition-colors duration-300">
                      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#aa841c" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <h3 className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">Email Address</h3>
                  </div>
                  <p className="text-[15px] text-[#1C1C1E] font-medium pl-12">{user?.email}</p>
                </div>

                {/* Phone */}
                <div className="p-5 rounded-2xl bg-[#FAFAF9] border border-gray-100/80 hover:border-[#aa841c]/15 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#aa841c]/8 flex items-center justify-center group-hover:bg-[#aa841c]/12 transition-colors duration-300">
                      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#aa841c" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <h3 className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">Phone Number</h3>
                  </div>
                  <p className="text-[15px] text-[#1C1C1E] font-medium pl-12">{user?.phone || "Not provided"}</p>
                </div>

                {/* Account Status */}
                <div className="p-5 rounded-2xl bg-[#FAFAF9] border border-gray-100/80 hover:border-[#aa841c]/15 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#aa841c]/8 flex items-center justify-center group-hover:bg-[#aa841c]/12 transition-colors duration-300">
                      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#aa841c" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <h3 className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">Account Status</h3>
                  </div>
                  <div className="flex items-center gap-2 pl-12">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[15px] text-[#aa841c] font-bold capitalize">{user?.role || "Customer"}</p>
                  </div>
                </div>

                {/* Member Since */}
                <div className="p-5 rounded-2xl bg-[#FAFAF9] border border-gray-100/80 hover:border-[#aa841c]/15 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#aa841c]/8 flex items-center justify-center group-hover:bg-[#aa841c]/12 transition-colors duration-300">
                      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#aa841c" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <h3 className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">Joined</h3>
                  </div>
                  <p className="text-[15px] text-[#1C1C1E] font-medium pl-12">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Recently"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Footer ─── */}
        <div className="bg-[#FAFAF9] px-8 py-5 border-t border-gray-100 font-montserrat">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-gray-500 font-medium">
              Need to update your security settings? Go to{" "}
              <a href="/account/settings" className="text-[#aa841c] hover:underline font-bold transition-colors">
                Account Settings
              </a>
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Secured
            </div>
          </div>
        </div>
        {/* ─── Confirmation Modal ─── */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-gray-100/80 shadow-2xl max-w-sm w-full mx-4 overflow-hidden transform transition-all duration-300 scale-100 animate-in zoom-in-95 font-montserrat">
              {/* Header */}
              <div className="bg-[#1C1C1E] p-6 text-center text-white relative">
                <div className="w-12 h-12 rounded-xl bg-[#aa841c]/10 border border-[#aa841c]/30 flex items-center justify-center mx-auto mb-3">
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold font-playfair tracking-wide text-white">Change Profile Photo</h3>
                <p className="text-[11px] text-gray-400 mt-1 font-light">Confirm your new profile selection</p>
              </div>

              {/* Body */}
              <div className="p-6 text-center">
                {previewUrl && (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-md mx-auto mb-4">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <p className="text-xs text-gray-500 leading-relaxed max-w-[240px] mx-auto">
                  Are you sure you want to change your profile picture to the selected image?
                </p>
              </div>

              {/* Actions */}
              <div className="p-4 bg-[#FAFAF9] border-t border-gray-100 flex gap-3">
                <button
                  onClick={cancelUpload}
                  className="flex-1 py-3 px-4 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={executeUpload}
                  className="flex-1 py-3 px-4 bg-[#1C1C1E] hover:bg-[#aa841c] text-white rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all duration-200 shadow-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
