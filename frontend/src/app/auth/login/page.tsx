"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // පිටුව Refresh වීම වැළැක්වීමට
    setLoading(true);

    try {
      // 1. බැකෙන්ඩ් එකේ Login එන්ඩ්පොයින්ට් එකට දත්ත යැවීම
      const response = await axios.post("http://localhost:5226/api/Auth/login", {
        email: email,
        password: password,
      });

      if (response.status === 200) {
        // 2. බැකෙන්ඩ් එකෙන් එවපු Token සහ User ID එක ලබා ගැනීම
        // (💡 බැකෙන්ඩ් එකෙන් එවන්නේ 'id' නම් 'userId: id' ලෙස වෙනස් කරන්න)
        const { token, userId } = response.data;

        // 3. දත්ත බ්‍රවුසර් එකේ (LocalStorage) ආරක්ෂිතව සේව් කිරීම
        localStorage.setItem("luxury_token", token);
        localStorage.setItem("luxury_userId", userId.toString());

        alert("🎉 සාර්ථකව පද්ධතියට ඇතුළු වුණා (Login Success)!");

        // 4. කෙලින්ම අපි කලින් හදපු Cart පේජ් එකට යූසර්ව රීඩිරෙක්ට් කිරීම
        router.push("/storefront/cart");
      }
    } catch (error: any) {
      console.error("Login Failed:", error);
      alert("⚠️ ඇතුළත් කළ ඊමේල් ලිපිනය හෝ මුරපදය වැරදියි. කරුණාකර නැවත උත්සාහ කරන්න.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 p-8 rounded-2xl shadow-xl">
        
        {/* Brand Logo / Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-amber-500">LUXURY CLOTHS</h2>
          <p className="text-gray-400 text-sm mt-2">ඔබේ ගිණුමට ලොග් වන්න</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">ඊමේල් ලිපිනය (Email)</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition text-sm"
              placeholder="example@gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">මුරපදය (Password)</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition text-sm"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 disabled:text-gray-500 text-black font-bold py-3.5 rounded-xl transition text-sm tracking-wide uppercase mt-4"
          >
            {loading ? "පරීක්ෂා කරමින් පවතී..." : "ඇතුළු වන්න (Sign In)"}
          </button>
        </form>

      </div>
    </div>
  );
}