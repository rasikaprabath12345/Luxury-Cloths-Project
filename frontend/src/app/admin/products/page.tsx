"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AddProductForm from "../../../components/AddProductForm"; 

interface Product {
    id: number;
    name: string;
    price: number;
    stockQuantity: number;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        axios.get("http://localhost:5226/api/products")
            .then((res) => {
                setProducts(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching products:", err);
                setLoading(false);
            });
    };

    const deleteProduct = (id: number) => {
        if (confirm("මෙම නිෂ්පාදනය ඉවත් කිරීමට අවශ්‍ය බව ස්ථිරද?")) {
            axios.delete(`http://localhost:5226/api/products/${id}`)
                .then(() => {
                    setProducts(products.filter(p => p.id !== id));
                })
                .catch(err => console.error("Error deleting:", err));
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">නිෂ්පාදන කළමනාකරණය</h1>
                <button 
                    onClick={() => setIsFormOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    අලුත් නිෂ්පාදනයක් එක් කරන්න
                </button>
            </div>
            
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b bg-gray-50">
                        <th className="p-4">නම</th>
                        <th className="p-4">මිල</th>
                        <th className="p-4">තොගය</th>
                        <th className="p-4">ක්‍රියා</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">{product.name}</td>
                            <td className="p-4">${product.price.toFixed(2)}</td>
                            <td className="p-4">{product.stockQuantity}</td>
                            <td className="p-4">
                                <button 
                                    onClick={() => deleteProduct(product.id)}
                                    className="text-red-600 hover:underline"
                                >
                                    ඉවත් කරන්න
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Form එක විවෘත කිරීම */}
            {isFormOpen && (
                <AddProductForm 
                    onClose={() => setIsFormOpen(false)} 
                    onProductAdded={() => {
                        setIsFormOpen(false);
                        fetchProducts(); // ලැයිස්තුව නැවුම් කිරීම
                    }} 
                />
            )}
        </div>
    );
}