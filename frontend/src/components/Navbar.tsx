"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import CartDrawer from "./CartDrawer";
import { useCart } from "../context/CartContext";

export default function Navbar() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { cartItems } = useCart(); // Cart එකේ බඩු ගණන පෙන්වීමට
    const pathname = usePathname();
    const router = useRouter();

    // 🔄 හැම පේජ් එකක්ම මාරු වෙද්දීම යූසර් ලොග් වෙලාද නැද්ද කියලා චෙක් කර ස්ටේට් එක අප්ඩේට් කිරීම
    useEffect(() => {
        const token = localStorage.getItem("luxury_token");
        setIsLoggedIn(!!token);
    }, [pathname]);

    // 🚪 පද්ධතියෙන් ඉවත් වීමේ ෆන්ක්ෂන් එක (Logout Logic)
    const handleLogout = () => {
        // LocalStorage එකේ තියෙන දත්ත මකා දැමීම
        localStorage.removeItem("luxury_token");
        localStorage.removeItem("luxury_userId");
        setIsLoggedIn(false);
        
        alert("👋 සාර්ථකව පද්ධතියෙන් ඉවත් වුණා (Logged Out)!");
        
        // මුල් පිටුවටම රීඩිරෙක්ට් කරලා පේජ් එක සම්පූර්ණයෙන්ම රිෆ්‍රෙෂ් කිරීම
        window.location.href = "/";
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
                        
                        {/* 🔒 ලොග් වී ඇත්නම් පමණක් 'මගේ ඇණවුම්' ලින්ක් එක මැදින් පෙන්වයි */}
                        {isLoggedIn && (
                            <Link href="/orders" className="text-blue-600 font-semibold hover:underline">
                                මගේ ඇණවුම්
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

                        {/* 🔑 Auth Button: ලොග් වී ඇති තත්ත්වය අනුව බටන් එක වෙනස් වේ */}
                        {isLoggedIn ? (
                            <button 
                                onClick={handleLogout}
                                className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 text-sm font-medium transition shadow-sm"
                            >
                                Logout
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