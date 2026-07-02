"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function ProfilePage() {
  const { user, updateProfile, isLoading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-[#aa841c] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Header */}
        <div className="bg-[#1C1C1E] px-8 py-10 text-white relative overflow-hidden border-b border-gray-800">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#aa841c]/5 rounded-full blur-3xl pointer-events-none"></div>
          <span className="text-[10px] font-bold tracking-widest text-[#aa841c] uppercase block mb-1.5 font-montserrat">
            Member Area
          </span>
          <h1 className="text-3xl font-bold font-playfair tracking-tight">Your Profile</h1>
          <p className="text-gray-400 mt-1.5 text-xs font-montserrat font-light">
            Manage and update your personal identity details
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-4 mb-6 flex items-center gap-2.5 font-montserrat text-sm text-red-800 font-medium">
              <span className="text-red-500">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-green-50 border border-green-100 p-4 mb-6 flex items-center gap-2.5 font-montserrat text-sm text-green-800 font-medium">
              <span className="text-green-600">✨</span>
              <span>{success}</span>
            </div>
          )}

          {/* Profile Info Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-8 border-b border-gray-50">
            <div className="flex items-center space-x-4">
              {user?.avatar ? (
                <div className="relative w-20 h-20 rounded-full overflow-hidden border border-[#aa841c]/25 p-0.5 shadow-sm flex-shrink-0">
                  <Image
                    src={user.avatar}
                    alt={user.fullName || "User Avatar"}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#aa841c] to-[#d4af37] text-white flex items-center justify-center font-bold text-2xl shadow-sm flex-shrink-0">
                  {user?.fullName?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold font-playfair text-[#1C1C1E]">
                  {user?.fullName}
                </h2>
                <p className="text-sm font-montserrat text-gray-500">{user?.email}</p>
                <p className="text-[11px] font-montserrat text-gray-400 mt-1">
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "Recently"}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setError("");
                setSuccess("");
              }}
              className="px-5 py-2.5 bg-[#1C1C1E] text-white rounded-xl hover:bg-[#aa841c] font-semibold text-xs tracking-wider uppercase font-montserrat transition-all duration-300 shadow-sm align-self-start sm:align-self-auto"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {/* Form / Details */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6 font-montserrat">
              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#aa841c]/10 focus:border-[#aa841c] text-sm text-gray-900 transition-all duration-200"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#aa841c]/10 focus:border-[#aa841c] text-sm text-gray-900 transition-all duration-200"
                  placeholder="+94 77 123 4567"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">
                  Avatar URL
                </label>
                <input
                  type="url"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#aa841c]/10 focus:border-[#aa841c] text-sm text-gray-900 transition-all duration-200"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-[#1C1C1E] text-white rounded-xl hover:bg-[#aa841c] disabled:opacity-50 font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-md shadow-[#1C1C1E]/5"
              >
                {isLoading ? "Saving Changes..." : "Save Changes"}
              </button>
            </form>
          ) : (
            <div className="space-y-6 font-montserrat">
              <div className="pb-4 border-b border-gray-50">
                <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase">Email Address</h3>
                <p className="mt-1.5 text-base text-[#1C1C1E] font-medium">{user?.email}</p>
              </div>

              <div className="pb-4 border-b border-gray-50">
                <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase">Phone Number</h3>
                <p className="mt-1.5 text-base text-[#1C1C1E] font-medium">{user?.phone || "Not provided"}</p>
              </div>

              <div className="pb-4">
                <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase">Account Status</h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <p className="text-sm text-[#aa841c] font-bold capitalize tracking-wide">{user?.role || "Customer"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info link */}
        <div className="bg-[#F9F8F6]/50 px-8 py-5 border-t border-gray-100 font-montserrat">
          <p className="text-xs text-gray-500 font-medium">
            Need to update your security settings? Go to{" "}
            <a href="/account/settings" className="text-[#aa841c] hover:underline font-bold transition-colors">
              Account Settings
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
