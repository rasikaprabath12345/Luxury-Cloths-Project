import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Context Providers
import { CartProvider } from "../context/CartContext"; 
import { AuthProvider } from "../context/AuthContext";
// Navbar component
import Navbar from "../components/Navbar";
// Footer component
import Footer from "../components/Footer"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white">
        <AuthProvider>
          <CartProvider>
            {/* Navbar shared across all pages */}
            <Navbar />
            
            {/* Each page renders here with top padding for fixed navbar */}
            <main className="flex-grow">
              {children}
            </main>

            {/* Footer shared across all pages */}
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}