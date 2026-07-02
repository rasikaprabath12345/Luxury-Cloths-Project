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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Header */}
        <div className="bg-[#1C1C1E] px-8 py-10 text-white relative overflow-hidden border-b border-gray-800">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#aa841c]/5 rounded-full blur-3xl pointer-events-none"></div>
          <span className="text-[10px] font-bold tracking-widest text-[#aa841c] uppercase block mb-1.5 font-montserrat">
            Security Area
          </span>
          <h1 className="text-3xl font-bold font-playfair tracking-tight">Account Settings</h1>
          <p className="text-gray-400 mt-1.5 text-xs font-montserrat font-light">
            Manage your account security configurations
          </p>
        </div>

        {/* Content */}
        <div className="p-8 font-montserrat">
          {/* Change Password Section */}
          <div>
            <h2 className="text-xl font-bold font-playfair text-[#1C1C1E] mb-6">Change Password</h2>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-4 mb-6 flex items-center gap-2.5 text-sm text-red-800 font-medium">
                <span className="text-red-500">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="rounded-xl bg-green-50 border border-green-100 p-4 mb-6 flex items-center gap-2.5 text-sm text-green-800 font-medium">
                <span className="text-green-600">✨</span>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#aa841c]/10 focus:border-[#aa841c] text-sm text-gray-900 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#aa841c]/10 focus:border-[#aa841c] text-sm text-gray-900 transition-all duration-200"
                  required
                  minLength={6}
                />
                <p className="text-[11px] text-gray-400 mt-1.5 font-light">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#aa841c]/10 focus:border-[#aa841c] text-sm text-gray-900 transition-all duration-200"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-[#1C1C1E] text-white rounded-xl hover:bg-[#aa841c] disabled:opacity-50 font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-md shadow-[#1C1C1E]/5"
              >
                {isLoading ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>

          {/* Security Tips */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h3 className="text-base font-bold font-playfair text-[#1C1C1E] mb-4">
              Security Best Practices
            </h3>
            <ul className="space-y-3 text-xs text-gray-500 font-medium">
              <li className="flex items-start">
                <span className="text-[#aa841c] font-bold mr-3">✓</span>
                Use a strong password combining letters, numbers, and symbols.
              </li>
              <li className="flex items-start">
                <span className="text-[#aa841c] font-bold mr-3">✓</span>
                Avoid reusing the same password across multiple online accounts.
              </li>
              <li className="flex items-start">
                <span className="text-[#aa841c] font-bold mr-3">✓</span>
                Refresh your credentials periodically to keep your account safe.
              </li>
              <li className="flex items-start">
                <span className="text-[#aa841c] font-bold mr-3">✓</span>
                Never share or store your plain credentials on unverified platforms.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
