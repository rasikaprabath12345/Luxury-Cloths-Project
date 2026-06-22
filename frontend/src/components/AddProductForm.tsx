"use client";
import { useState } from "react";
import axios from "axios";

export default function AddProductForm({ onClose, onProductAdded }: { onClose: () => void, onProductAdded: () => void }) {
    const [formData, setFormData] = useState({ 
        name: "", 
        description: "", 
        price: 0, 
        stockQuantity: 0, 
        categoryId: 1 
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // බැකෙන්ඩ් එකට POST කරනවා
            await axios.post("http://localhost:5226/api/products", formData);
            alert("නිෂ්පාදනය සාර්ථකව එකතු කරන ලදී!");
            onProductAdded(); // පේජ් එක Refresh කිරීමට මෙය උදව් වෙනවා
        } catch (err: any) {
            console.error("Error details:", err.response?.data || err.message);
            alert("නිෂ්පාදනය එකතු කිරීමේදී දෝෂයක් ඇති විය.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg w-96 shadow-xl">
                <h2 className="text-xl font-bold mb-4">අලුත් ඇඳුමක් එක් කරන්න</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="නම" className="w-full border p-2 rounded" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    <input type="number" placeholder="මිල" className="w-full border p-2 rounded" onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} required />
                    <input type="number" placeholder="තොගය" className="w-full border p-2 rounded" onChange={(e) => setFormData({...formData, stockQuantity: parseInt(e.target.value)})} required />
                    <textarea placeholder="විස්තරය" className="w-full border p-2 rounded" onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">වහන්න</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">එක් කරන්න</button>
                    </div>
                </form>
            </div>
        </div>
    );
}