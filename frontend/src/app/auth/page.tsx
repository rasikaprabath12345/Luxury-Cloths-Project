"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState<boolean>(false); // Login / Register මාරු කිරීමට
  const [name, setName] = useState<string>(""); // Register සඳහා පමණි
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        // ==========================================
        // 📝 1. ලියාපදිංචි වීමේ කොටස (Register Logic)
        // ==========================================
        const response = await axios.post("http://localhost:5226/api/Auth/register", {
          fullName: name, // 🎯 Backend එක ඉල්ලන විදිහට 'fullName' ලෙස සකස් කළා
          email: email,
          password: password,
        });

        if (response.status === 200 || response.status === 201) {
          alert("🎉 සාර්ථකව ලියාපදිංචි වුණා! දැන් ඔබේ ගිණුමට ලොග් වන්න.");
          setIsRegister(false); // සාර්ථක නම් ස්වයංක්‍රීයව Login Form එකට හරවයි
          setName("");
        }
      } else {
        // ==========================================
        // 🔑 2. පද්ධතියට ඇතුළු වීමේ කොටස (Login Logic)
        // ==========================================
        const response = await axios.post("http://localhost:5226/api/Auth/login", {
          email: email,
          password: password,
        });

        if (response.status === 200) {
          // 🔍 බැකෙන්ඩ් එකෙන් එන දත්ත බලාගැනීමට
          console.log("📦 බැකෙන්ඩ් එකෙන් ආපු Login Data:", response.data);

          const token = response.data.token;
          
          // 🎯 Backend එකෙන් 'userId' හෝ 'id' ලෙස එවන ඕනෑම එකක් ආරක්ෂිතව ලබාගනී (undefined එරර් එක මඟහරවයි)
          const userId = response.data.userId || response.data.id;

          // Token එක LocalStorage එකට දැමීම
          if (token) {
            localStorage.setItem("luxury_token", token);
          }

          // User ID එක තිබේ නම් පමණක් string එකක් බවට හරවා සේව් කරයි
          if (userId !== undefined && userId !== null) {
            localStorage.setItem("luxury_userId", userId.toString());
          }

          alert("🎉 සාර්ථකව පද්ධතියට ඇතුළු වුණා!");
          
          // සාර්ථකව ලොග් වූ පසු Cart එකට හෝ මුල් පිටුවට රීඩිරෙක්ට් කිරීම
          router.push("/storefront/cart");
        }
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      
      // බැකෙන්ඩ් එකෙන් එන ඇත්තම එරර් මැසේජ් එකක් තිබේ නම් එය පෙන්වයි
      const serverMessage = error.response?.data?.message || error.response?.data?.title;
      alert(
        serverMessage || 
        "⚠️ ක්‍රියාවලිය අසාර්ථකයි. ඇතුළත් කළ දත්ත නැවත පරීක්ෂා කරන්න."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 p-8 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-amber-500">LUXURY CLOTHS</h2>
          <p className="text-gray-400 text-sm mt-2">
            {isRegister ? "නව ගිණුමක් සාදා එකතු වන්න" : "ඔබේ ගිණුමට ලොග් වන්න"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Register වෙනකොට විතරක් නම (Name) ඉල්ලන Input එක පෙන්වයි */}
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">පරිශීලක නාමය (Name)</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition text-sm"
                placeholder="Rasika Prabath"
              />
            </div>
          )}

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 disabled:text-gray-500 text-black font-bold py-3.5 rounded-xl transition text-sm tracking-wide uppercase mt-4"
          >
            {loading ? "ක්‍රියාවලිය සිදුවෙමින් පවතී..." : isRegister ? "ගිණුම සාදන්න (Sign Up)" : "ඇතුළු වන්න (Sign In)"}
          </button>
        </form>

        {/* Form Toggle Button */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setName("");
              setEmail("");
              setPassword("");
            }}
            className="text-sm text-amber-500 hover:underline focus:outline-none"
          >
            {isRegister ? "දැනටමත් ගਿණුමක් තිබේද? ලොග් වන්න (Sign In)" : "නව ගිණුමක් සාදන්න (Sign Up)"}
          </button>
        </div>
      </div>
    </div>
  );
}