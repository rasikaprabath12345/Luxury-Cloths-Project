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
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-blue-100 mt-2">Manage your personal information</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="text-sm font-medium text-red-800">{error}</div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4 mb-6">
              <div className="text-sm font-medium text-green-800">{success}</div>
            </div>
          )}

          {/* Profile Info */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.fullName}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-2xl">
                    {user?.fullName?.charAt(0) || "U"}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.fullName}
                </h2>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          {/* Form */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar URL
                </label>
                <input
                  type="url"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Email</h3>
                <p className="mt-1 text-gray-900">{user?.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700">Phone Number</h3>
                <p className="mt-1 text-gray-900">{user?.phone || "Not provided"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700">Account Role</h3>
                <p className="mt-1 text-gray-900 capitalize">{user?.role}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Need to change your password? Go to <a href="/account/settings" className="text-blue-600 hover:underline">Settings</a>
          </p>
        </div>
      </div>
    </div>
  );
}
