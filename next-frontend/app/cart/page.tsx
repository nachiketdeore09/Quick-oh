"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartItem } from "@/components/CartItem";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Cart() {
  const { cart, totalPrice, totalItems, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleProceed = () => {
    if (!isAuthenticated) {
      toast.error("Please login to checkout");
      router.push("/login?redirect=/cart");
      return;
    }
    // Route to checkout map interface API
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        
        {loading && cart.length === 0 ? (
           <div className="py-20 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#00dfd8] border-t-transparent rounded-full" /></div>
        ) : cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-sm text-center">Add items from the shop to start building your 10-minute grocery order.</p>
            <Link 
              href="/shop" 
              className="bg-gradient-to-r from-[#007cf0] to-[#00dfd8] text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition inline-block"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="text-xl font-semibold mb-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
                <span>Items ({totalItems})</span>
                <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-50" disabled={loading}>Clear All</button>
              </h2>
              
              <div className="space-y-2 opacity-100 transition-opacity" style={{ opacity: loading ? 0.5 : 1 }}>
                {cart.map((item) => (
                  <CartItem key={item.product._id} item={item} />
                ))}
              </div>
            </div>

            <div className="w-full lg:w-96 flex-shrink-0">
              <div className="sticky top-28 bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                
                <div className="space-y-4 text-sm mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Delivery Fee</span>
                    <span>₹0 <span className="text-green-500 ml-1 text-xs px-2 bg-green-100 dark:bg-green-900/30 rounded-full">FREE</span></span>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">Includes all taxes & delivery fees</p>
                </div>
                
                <button 
                  onClick={handleProceed}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#007cf0] to-[#00dfd8] text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-[#007cf0]/20 transition flex justify-center items-center gap-2 group disabled:opacity-50"
                >
                  Confirm Cart
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
