"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import CartDrawer from "./CartDrawer";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { cartItems } = useCart();
    const { user, logout, isAdmin } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        alert("Successfully logged out!");
        router.push("/");
    };

    return (
        <nav className="sticky top-0 bg-white border-b border-gray-200 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-2xl font-bold tracking-tighter">
                            LUXURY<span className="text-blue-600">.</span>
                        </Link>
                    </div>

                    {/* Nav Links */}
                    <div className="hidden md:flex space-x-8 items-center">
                        <Link href="/" className="text-gray-700 hover:text-blue-600">මුල් පිටුව</Link>
                        <Link href="/storefront/product" className="text-gray-700 hover:text-blue-600">නිෂ්පාදන</Link>
                        <Link href="/about" className="text-gray-700 hover:text-blue-600">අප ගැන</Link>
                        
                    {/* 🔒 Show My Orders for logged in users */}
                    {user && (
                        <Link href="/orders" className="text-blue-600 font-semibold hover:underline">
                            My Orders
                        </Link>
                    )}
                    
                    {/* 👨‍💼 Show Admin Dashboard for admin users */}
                    {isAdmin && (
                        <Link href="/admin/products" className="text-red-600 font-semibold hover:underline">
                            Admin Panel
                        </Link>
                    )}
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex items-center space-x-4">
                        <button className="text-gray-600 hover:text-blue-600">🔍</button>
                        <button 
                            onClick={() => setIsDrawerOpen(true)}
                            className="relative text-gray-600 hover:text-blue-600"
                        >
                            🛒
                            {cartItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartItems.length}
                                </span>
                            )}
                        </button>

                        {/* 🔑 Auth Button */}
                        {user ? (
                            <button 
                                onClick={handleLogout}
                                className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 text-sm font-medium transition shadow-sm"
                            >
                                Logout ({user.email})
                            </button>
                        ) : (
                            <Link href="/auth" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 text-sm font-medium transition shadow-sm">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Cart Drawer */}
            {isDrawerOpen && <CartDrawer onClose={() => setIsDrawerOpen(false)} />}
        </nav>
    );
}