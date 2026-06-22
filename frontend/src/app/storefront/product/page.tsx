"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "../../../context/CartContext"; 
import AddProductForm from "@/src/components/AddProductForm";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    images?: { imageUrl: string; isMain: boolean }[];
    category?: { name: string };
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { addToCart } = useCart();
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        axios.get("http://localhost:5226/api/products")
            .then((res) => {
                setProducts(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-8">Luxury Clothing Collection</h1>
            
            {/* අලුත් නිෂ්පාදනයක් එක් කිරීමේ බටන් එක */}
            <div className="mb-6 text-right">
                <button 
                    onClick={() => setIsFormOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    අලුත් නිෂ්පාදනයක් එක් කරන්න
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="border p-4 rounded-xl shadow-sm">
                        <img 
                            src={product.images?.[0]?.imageUrl || "https://via.placeholder.com/300"} 
                            alt={product.name} 
                            className="w-full h-48 object-cover rounded-lg"
                        />
                        <h2 className="text-lg font-bold mt-2">{product.name}</h2>
                        <p className="text-gray-600">${product.price.toFixed(2)}</p>
                        <button 
                            onClick={() => addToCart(product)}
                            className="w-full mt-4 bg-black text-white py-2 rounded-lg hover:bg-gray-800"
                        >
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>

            {/* Form එක return එක ඇතුළට ගෙනාවා */}
            {isFormOpen && (
                <AddProductForm 
                    onClose={() => setIsFormOpen(false)} 
                    onProductAdded={() => {
                        setIsFormOpen(false);
                        window.location.reload(); 
                    }} 
                />
            )}
        </div>
    );
}