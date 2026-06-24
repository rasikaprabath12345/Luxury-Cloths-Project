"use client";

import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";

export default function CartDrawer({ onClose }: { onClose: () => void }) {
    const { cartItems, updateQuantity, removeFromCart } = useCart();
    const router = useRouter();
    const totalPrice = cartItems.reduce((acc, item: any) => acc + item.price * (item.quantity || 1), 0);

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        onClose();
        router.push("/storefront/checkout");
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-900 h-full p-6 flex flex-col justify-between shadow-2xl animate-slideLeft text-white">
                <div>
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
                        <h2 className="text-xl font-black text-amber-500">ඔබේ කරත්තය (Cart)</h2>
                        <button onClick={onClose} className="text-zinc-500 hover:text-white text-lg">✕</button>
                    </div>

                    <div className="mt-6 space-y-4 overflow-y-auto max-h-[70vh] pr-2">
                        {cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500">
                                <span className="text-4xl mb-4">🛒</span>
                                <p className="text-sm font-medium">කාර්ට් එක හිස්ව පවතී. 📦</p>
                            </div>
                        ) : (
                            cartItems.map((item: any) => {
                                const itemImg = item.imageUrl || item.image || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop";
                                const itemQuantity = item.quantity || 1;

                                return (
                                    <div key={item.id} className="flex items-center gap-4 bg-zinc-900/50 p-3 rounded-xl border border-zinc-900">
                                        <img src={itemImg} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" alt={item.name}/>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-zinc-200 truncate">{item.name}</h4>
                                            <p className="text-xs text-amber-500 font-bold mt-0.5">
                                                Rs. {(item.price * itemQuantity).toLocaleString()}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <button onClick={() => updateQuantity(item.id, itemQuantity - 1)} className="bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded text-xs text-white">-</button>
                                                <span className="text-xs font-bold text-white">{itemQuantity}</span>
                                                <button onClick={() => updateQuantity(item.id, itemQuantity + 1)} className="bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded text-xs text-white">+</button>
                                            </div>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-400 text-xs font-semibold">Remove</button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Total & Checkout */}
                <div className="border-t border-zinc-900 pt-4 space-y-4">
                    <div className="flex items-center justify-between text-sm font-bold">
                        <span className="text-zinc-400">මුළු එකතුව (Total):</span>
                        <span className="text-xl text-white">Rs. {totalPrice.toLocaleString()}</span>
                    </div>
                    <button 
                        onClick={handleCheckout}
                        disabled={cartItems.length === 0}
                        className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-black font-extrabold py-4 rounded-xl text-sm transition uppercase tracking-wider"
                    >
                        Checkout කරන්න 💳
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideLeft {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
                .animate-slideLeft {
                    animation: slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}