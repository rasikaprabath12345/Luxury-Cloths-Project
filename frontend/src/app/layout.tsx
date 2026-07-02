import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import { AuthProvider } from "../context/AuthContext";
import NextAuthProvider from "../components/NextAuthProvider";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatButtons from '@/components/ChatButtons';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Luxury Clothing Store",
  description: "Exclusive luxury clothing collection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${montserrat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white">
        <NextAuthProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>

              {/* Navbar */}
              <Navbar />

              {/* Main Content */}
              <main className="flex-grow">
                {children}
              </main>

              {/* Footer */}
              <Footer />

              {/* WhatsApp & Messenger Buttons */}
              <ChatButtons />

            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}