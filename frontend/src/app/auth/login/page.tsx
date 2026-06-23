"use client";

import { useState } from "react";
import axios from "axios";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // ඔබගේ .NET Backend එකේ Login Endpoint එකට යැවිය යුතුයි
            const response = await axios.post("http://localhost:5226/api/auth/login", {
                email,
                password
            });
            alert("Login සාර්ථකයි!");
            window.location.href = "/";
        } catch (err) {
            alert("Login අසාර්ථකයි. කරුණාකර නැවත උත්සාහ කරන්න.");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
                <input 
                    type="email" placeholder="Email" required 
                    className="w-full p-3 border rounded mb-4"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input 
                    type="password" placeholder="Password" required 
                    className="w-full p-3 border rounded mb-6"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                    Login වන්න
                </button>
            </form>
        </div>
    );
}