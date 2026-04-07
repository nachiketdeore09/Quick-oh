"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { orderService } from "@/services/services";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MapPin, Loader2, CheckCircle2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import RazorpayScript from "@/components/RazorpayScript";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { 
  ssr: false, 
  loading: () => <div className="h-72 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl flex items-center justify-center font-medium text-gray-400">Loading Interactive Map...</div>
});

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleUseProfileAddress = () => {
    if (user?.address && user?.latitude && user?.longitude) {
      setAddress(user.address);
      setCoords({ lat: user.latitude, lng: user.longitude });
      toast.success("Using address from your profile!");
    }
  };

  const handleLocationSelect = (lat: number, lng: number, pickedAddress?: string) => {
    setCoords({ lat, lng });
    if (pickedAddress && !address) {
      setAddress(pickedAddress);
    }
  };

  const processPayment = async (orderData: any) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.totalAmount * 100, // Amount in paise
      currency: "INR",
      name: "Quick-oh",
      description: "Fastest Grocery Delivery",
      order_id: "", // Typically generated on backend, but we'll use local if backend doesn't support it yet
      handler: async function (response: any) {
        toast.success("Payment successful!");
        await clearCart();
        router.push(`/tracking/${orderData._id}`);
      },
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: user?.phoneNumber
      },
      theme: {
        color: "#007cf0"
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePlaceOrder = async () => {
    if (!address || !coords) {
      toast.error("Please provide your address and pick a location on the map.");
      return;
    }

    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setLoading(true);
    try {
      const resp = await orderService.createOrder(address, coords.lat, coords.lng);
      const orderData = resp.data || resp;
      
      // Trigger Razorpay
      processPayment(orderData);
      
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (cart.length === 0) {
      router.push("/shop");
    }
  }, [cart, router]);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-32 text-center">
         <p>Cart is empty. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-20 bg-gray-50 dark:bg-gray-950">
      <RazorpayScript />
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm relative">
              {/* Confirmation Overlay */}
              {showConfirmation && (
                <div className="absolute inset-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-[#007cf0]" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Ready to Order?</h2>
                  <p className="text-gray-500 mb-6">You will be redirected to our secure payment gateway to complete the transaction.</p>
                  <div className="flex gap-4 w-full max-w-xs">
                    <button 
                      onClick={() => setShowConfirmation(false)}
                      className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="flex-1 py-3 bg-[#007cf0] text-white rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50"
                    >
                      {loading ? "Processing..." : "Pay Now"}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="text-[#007cf0]" /> Delivery Details
                </h2>
                {user?.address && (
                  <button 
                    onClick={handleUseProfileAddress}
                    className="text-xs font-bold text-[#007cf0] bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                  >
                    Use Saved Address
                  </button>
                )}
              </div>
              
              <div className="mb-8">
                <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                  Select Delivery Location
                </label>
                <MapPicker onLocationSelect={handleLocationSelect} />
                {coords && (
                  <p className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Location pinned: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                  </p>
                )}
              </div>

              <div className="mb-2">
                 <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                   Detailed Address (House/Flat No, Landmark)
                 </label>
                 <textarea 
                   rows={3}
                   className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-[#007cf0] transition shadow-sm"
                   placeholder="e.g. Flat 402, Building X, Near Central Park..."
                   value={address}
                   onChange={(e) => setAddress(e.target.value)}
                 />
              </div>
            </div>
          </div>

          <div className="w-full md:w-80">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm sticky top-28">
               <h2 className="text-xl font-bold mb-4">Summary</h2>
               <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-2">
                 <span>{cart.reduce((a, b) => a + b.quantity, 0)} Items</span>
                 <span>₹{totalPrice}</span>
               </div>
               <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                 <span>Delivery</span>
                 <span className="text-green-500">Free</span>
               </div>
               <div className="flex justify-between text-lg font-bold mb-6">
                 <span>Total Pay</span>
                 <span>₹{totalPrice}</span>
               </div>

               <button 
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#007cf0] to-[#00dfd8] text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-[#007cf0]/20 transition flex justify-center items-center gap-2 group disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : showConfirmation ? "Pay Now" : "Confirm Order"}
               </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

