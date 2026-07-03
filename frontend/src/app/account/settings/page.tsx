"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { changePassword, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      await changePassword(
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword
      );
      setSuccess("Password changed successfully!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to change password");
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Header */}
        <div className="h-28 bg-gradient-to-br from-[#1C1C1E] via-[#2C2C2E] to-[#1C1C1E] relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23aa841c' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#aa841c]/10 rounded-full blur-[80px] pointer-events-none" />
          
          {/* Header Text */}
          <div className="relative z-10 px-8 pt-5">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#d4af37] uppercase block mb-0.5 font-montserrat">
              Security Area
            </span>
            <h1 className="text-xl font-bold font-playfair tracking-tight text-white">Account Settings</h1>
            <p className="text-gray-500 mt-0.5 text-[10px] font-montserrat font-light">
              Manage your account security configurations
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 font-montserrat">
          {/* Change Password Section */}
          <div>
            <h2 className="text-base font-bold font-playfair text-[#1C1C1E] mb-4">Change Password</h2>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-4 mb-5 flex items-center gap-2.5 text-xs text-red-800 font-medium animate-in">
                <span className="text-red-500">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="rounded-xl bg-green-50 border border-green-100 p-4 mb-5 flex items-center gap-2.5 text-xs text-green-800 font-medium animate-in">
                <span className="text-green-600">✨</span>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#aa841c]/15 focus:border-[#aa841c] text-xs text-gray-900 transition-all duration-200 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#aa841c]/15 focus:border-[#aa841c] text-xs text-gray-900 transition-all duration-200 bg-white"
                  required
                  minLength={6}
                />
                <p className="text-[9px] text-gray-400 mt-1 font-light">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#aa841c]/15 focus:border-[#aa841c] text-xs text-gray-900 transition-all duration-200 bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#1C1C1E] text-white rounded-xl hover:bg-[#aa841c] disabled:opacity-50 font-bold text-[10px] tracking-wider uppercase transition-all duration-300 shadow-md shadow-[#1C1C1E]/5"
              >
                {isLoading ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>

          {/* Security Tips */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-bold font-playfair text-[#1C1C1E] mb-3.5">
              Security Best Practices
            </h3>
            <ul className="space-y-2.5 text-[11px] text-gray-500 font-medium">
              <li className="flex items-start">
                <span className="text-[#aa841c] font-bold mr-2.5">✓</span>
                Use a strong password combining letters, numbers, and symbols.
              </li>
              <li className="flex items-start">
                <span className="text-[#aa841c] font-bold mr-2.5">✓</span>
                Avoid reusing the same password across multiple online accounts.
              </li>
              <li className="flex items-start">
                <span className="text-[#aa841c] font-bold mr-2.5">✓</span>
                Refresh your credentials periodically to keep your account safe.
              </li>
              <li className="flex items-start">
                <span className="text-[#aa841c] font-bold mr-2.5">✓</span>
                Never share or store your plain credentials on unverified platforms.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
