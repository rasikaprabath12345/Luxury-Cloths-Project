import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Context Provider එක
import { CartProvider } from "../context/CartContext"; 
// Navbar එක - මෙය ඔබේ src/components/Navbar.tsx වෙත පෙන්වයි
import Navbar from "../components/Navbar"; 

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
        {/* මුළු ඇප් එකටම Cart එකේ දත්ත බෙදාහරින Provider එක */}
        <CartProvider>
          {/* සියලුම පේජ් වලට පොදු Navbar එක */}
          <Navbar />
          
          {/* සෑම පේජ් එකක්ම මෙතනින් ඇතුළත් වේ */}
          <main className="flex-grow">
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  );
}