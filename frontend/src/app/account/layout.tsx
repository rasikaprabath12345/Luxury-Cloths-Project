"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Account</h2>
          <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
        </div>

        <nav className="mt-4">
          <Link
            href="/account/profile"
            className="block px-6 py-3 text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-blue-600 border-l-4 border-transparent"
          >
            Profile
          </Link>
          <Link
            href="/account/orders"
            className="block px-6 py-3 text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-blue-600 border-l-4 border-transparent"
          >
            Orders
          </Link>
          <Link
            href="/account/settings"
            className="block px-6 py-3 text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-blue-600 border-l-4 border-transparent"
          >
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-6 py-3 text-red-600 hover:bg-red-50 border-l-4 border-transparent"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
}
