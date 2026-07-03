"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9F8F6]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#aa841c] border-t-transparent rounded-full animate-spin"></div>
          <span className="font-montserrat text-sm text-gray-500 font-medium">Loading account...</span>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navItems = [
    { label: "Profile", href: "/account/profile" },
    { label: "Settings", href: "/account/settings" },
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F6] py-8 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <div className="w-full lg:w-64 bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden flex-shrink-0">
            {/* User Info Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-b from-[#F9F8F6]/50 to-white flex flex-col items-center text-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-16 h-16 rounded-full object-cover border border-[#aa841c]/25 p-0.5 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#aa841c] to-[#d4af37] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {user?.fullName?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <h2 className="font-playfair text-lg font-bold text-[#1C1C1E] mt-3 leading-tight">
                {user?.fullName}
              </h2>
              <p className="font-montserrat text-xs text-gray-500 mt-1 truncate w-full">
                {user?.email}
              </p>
              <span className="inline-block mt-2 px-2.5 py-0.5 text-[9px] font-bold tracking-widest text-[#aa841c] bg-[#aa841c]/10 rounded-full uppercase font-montserrat">
                {user?.role || "Member"}
              </span>
            </div>

            {/* Nav Menu */}
            <nav className="p-4 space-y-1 font-montserrat">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-[#aa841c]/5 text-[#aa841c] border-l-4 border-[#aa841c] pl-3"
                        : "text-gray-600 hover:bg-gray-50 hover:text-[#aa841c] border-l-4 border-transparent"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50/50 rounded-xl transition-all duration-200 border-l-4 border-transparent"
              >
                Logout
              </button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
