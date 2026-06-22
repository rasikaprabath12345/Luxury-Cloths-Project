import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// නිවැරදි relative path එක පාවිච්චි කළා
import { CartProvider } from "../context/CartContext"; 

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
      <body className="min-h-full flex flex-col">
        {/* මෙතනින් තමයි මුළු ඇප් එකටම Cart එකේ දත්ත බෙදාහරින්නේ */}
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}