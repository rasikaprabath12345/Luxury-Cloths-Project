"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface CartItem {
  id: number;
  variantId: number; // බැකෙන්ඩ් එකට අවශ්‍ය ProductVariantId එක
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("BankTransfer");
  const [loading, setLoading] = useState<boolean>(true);
  const [isOrdering, setIsOrdering] = useState<boolean>(false);
  const router = useRouter();

  // 1. පිටුව Load වන විට LocalStorage එකෙන් Cart දත්ත ලබා ගැනීම
  useEffect(() => {
    const savedCart = localStorage.getItem("luxury_cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    } else {
      // --- ටෙස්ට් කිරීමට පමණක් Dummy Data කිහිපයක් ---
      const dummyItems: CartItem[] = [
        { id: 1, variantId: 1, name: "Premium Luxury Silk Dress", price: 12500, quantity: 1, size: "M", color: "Black" },
        { id: 2, variantId: 2, name: "Classic Slim Fit Designer Shirt", price: 8500, quantity: 2, size: "L", color: "White" }
      ];
      setCartItems(dummyItems);
      localStorage.setItem("luxury_cart", JSON.stringify(dummyItems));
    }
    loadingFormCheck();
  }, []);

  const loadingFormCheck = () => {
    setLoading(false);
  };

  // 2. භාණ්ඩ ප්‍රමාණයන් වෙනස් කිරීම (Update Quantity)
  const updateQuantity = (variantId: number, newQty: number) => {
    if (newQty < 1) return;
    const updated = cartItems.map(item => item.variantId === variantId ? { ...item, quantity: newQty } : item);
    setCartItems(updated);
    localStorage.setItem("luxury_cart", JSON.stringify(updated));
  };

  // 3. භාණ්ඩයක් කරත්තයෙන් ඉවත් කිරීම (Remove Item)
  const removeItem = (variantId: number) => {
    const filtered = cartItems.filter(item => item.variantId !== variantId);
    setCartItems(filtered);
    localStorage.setItem("luxury_cart", JSON.stringify(filtered));
  };

  // 4. මුළු එකතුව ගණනය කිරීම
  const subTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingFee = cartItems.length > 0 ? 500 : 0; // સ્ථිර Delivery ගාස්තුවක්
  const totalAmount = subTotal + shippingFee;

  // 5. බැකෙන්ඩ් එකට ඕඩර් එක යැවීම (Place Order) - Auth සම්බන්ධ කර යාවත්කාලීන කරන ලදී 🚀
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    
    // 💡 LocalStorage එකෙන් දැනට ලොග් වී සිටින යූසර්ගේ ID එක කියවීම
    const savedUserId = localStorage.getItem("luxury_userId");

    // 🔒 යූසර් ලොග් වෙලා නැත්නම් ඕඩර් එක දාන්න නොදී Login පේජ් එකට හරවා යැවීම
    if (!savedUserId) {
      alert("🔒 ඇණවුම සිදු කිරීමට ප්‍රථම කරුණාකර පද්ධතියට ලොග් වන්න (Login).");
      router.push("/auth"); // ඔයාගේ ලොගින් පේජ් එක තියෙන පාත් එක
      return;
    }

    setIsOrdering(true);
    try {
      // බැකෙන්ඩ් එක බලාපොරොත්තු වන CreateOrderDto හැඩයට දත්ත සකස් කිරීම
      const orderData = {
        userId: parseInt(savedUserId), // ස්ථිර 1 වෙනුවට ලොග් වුනු කෙනාගේ ඇත්තම ID එක දානවා
        paymentMethod: paymentMethod,
        items: cartItems.map(item => ({
          productVariantId: item.variantId,
          quantity: item.quantity
        }))
      };

      const response = await axios.post("http://localhost:5226/api/Orders", orderData);

      if (response.status === 200) {
        alert("🎉 " + response.data.message);
        
        // ඕඩර් එක සාර්ථක නිසා කරත්තය හිස් කිරීම
        setCartItems([]);
        localStorage.removeItem("luxury_cart");
        
        // කෙලින්ම අප කලින් සෑදූ ඇණවුම් ඉතිහාසය පිටුවට යොමු කරයි
        router.push("/orders");
      }
    } catch (error: any) {
      console.error("ඇණවුම සිදු කිරීමට නොහැකි විය:", error);
      alert("කනගාටුයි! ඇණවුම සිදු කිරීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.");
    } finally {
      setIsOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight mb-10 border-b border-gray-800 pb-4 text-amber-500">
          මගේ කරත්තය (Shopping Cart)
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-zinc-950 rounded-2xl border border-dashed border-zinc-800">
            <p className="text-gray-400 text-xl mb-6">ඔබේ සාප්පු සවාරි කරත්තය දැනට හිස්ව පවතී.</p>
            <button onClick={() => router.push("/")} className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-8 rounded-lg transition">
              භාණ්ඩ බලන්න යන්න
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* වම් පැත්ත: කරත්තයේ ඇති භාණ්ඩ ලැයිස්තුව */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => (
                <div key={item.variantId} className="flex flex-col sm:flex-row items-center justify-between bg-zinc-950 border border-zinc-800 p-5 rounded-xl gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* Dummy Image Placeholder */}
                    <div className="w-20 h-24 bg-zinc-900 rounded-md flex items-center justify-center border border-zinc-800 flex-shrink-0">
                      <span className="text-xs text-gray-500">Luxury</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white">{item.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        ප්‍රමාණය: <span className="text-amber-500 font-medium">{item.size}</span> | වර්ණය: <span className="text-gray-300">{item.color}</span>
                      </p>
                      <p className="text-sm text-amber-500 font-bold mt-2">Rs. {item.price.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Quantity Controller & Delete Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-none pt-3 sm:pt-0 border-zinc-800">
                    <div className="flex items-center border border-zinc-700 rounded-lg overflow-hidden bg-black">
                      <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold">-</button>
                      <span className="px-4 py-1 text-sm font-medium w-12 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold">+</button>
                    </div>

                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-gray-400">එකතුව</p>
                      <p className="font-bold text-white">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                    </div>

                    <button onClick={() => removeItem(item.variantId)} className="text-red-500 hover:text-red-400 font-medium text-sm transition">
                      අයින් කරන්න
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* දකුණු පැත්ත: ඕඩර් සමරිය සහ ගෙවීම් ක්‍රම */}
            <div className="lg:col-span-4 bg-zinc-950 border border-zinc-800 p-6 rounded-xl h-fit">
              <h2 className="text-xl font-bold mb-6 text-white border-b border-zinc-800 pb-2">මිල විස්තරය</h2>
              
              <div className="space-y-4 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>භාණ්ඩවල වටිනාකම</span>
                  <span className="text-white">Rs. {subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery ගාස්තුව</span>
                  <span className="text-white">Rs. {shippingFee.toLocaleString()}</span>
                </div>
                <hr className="border-zinc-800 my-2" />
                <div className="flex justify-between text-base font-bold text-amber-500">
                  <span>මුළු එකතුව</span>
                  <span>Rs. {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mt-8">
                <label className="block text-sm font-semibold mb-3 text-gray-400">ගෙවීම් ක්‍රමය තෝරන්න</label>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${paymentMethod === "BankTransfer" ? "border-amber-500 bg-amber-500/10" : "border-zinc-800 bg-black"}`}>
                    <input type="radio" name="payment" value="BankTransfer" checked={paymentMethod === "BankTransfer"} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-amber-500" />
                    <div>
                      <p className="font-medium text-sm text-white">Bank Transfer (බැංකු තැන්පතු)</p>
                      <p className="text-xs text-gray-400 mt-0.5">Slip එක පසුව අමුණන්න අවශ්‍ය වේ.</p>
                    </div>
                  </label>
                  
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${paymentMethod === "COD" ? "border-amber-500 bg-amber-500/10" : "border-zinc-800 bg-black"}`}>
                    <input type="radio" name="payment" value="COD" checked={paymentMethod === "COD"} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-amber-500" />
                    <div>
                      <p className="font-medium text-sm text-white">Cash on Delivery (COD)</p>
                      <p className="text-xs text-gray-400 mt-0.5">භාණ්ඩ ලැබුණු පසු මුදල් ගෙවන්න.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isOrdering || cartItems.length === 0}
                className="w-full mt-8 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 disabled:text-gray-500 text-black font-bold py-4 rounded-xl transition text-center tracking-wide uppercase"
              >
                {isOrdering ? "ඇණවුම සකසමින් පවතී..." : "ඇණවුම ස්ථිර කරන්න (Place Order)"}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}