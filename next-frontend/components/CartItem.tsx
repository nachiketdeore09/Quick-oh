"use client";

import React from "react";
import { CartItem as CartItemType } from "@/types";
import { useCart } from "@/context/CartContext";
import { Plus, Minus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export const CartItem = ({ item }: { item: CartItemType }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity, subtotal } = item;

  // We rely on backend 'subtotal'
  const unitPrice = product.discount 
    ? product.price - (product.price * product.discount / 100) 
    : product.price;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center gap-4 py-4 border-b border-gray-100 dark:border-gray-800"
    >
      <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
        <img 
          src={product.productImage || "https://placehold.co/100x100"} 
          alt={product.productName} 
          className="w-full h-full object-contain" 
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{product.productName}</h4>
        <p className="text-sm text-gray-500 mb-2">₹{Math.round(unitPrice)} / unit</p>
        <span className="font-bold">₹{Math.round(subtotal)}</span>
      </div>

      <div className="flex flex-col items-end gap-3">
        <button 
          onClick={() => removeFromCart(product._id)}
          className="text-gray-400 hover:text-red-500 transition"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-xl px-2 py-1">
          <button 
            onClick={() => updateQuantity(product._id, quantity - 1, quantity)} 
            className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg transition"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-medium w-4 text-center">{quantity}</span>
          <button 
            onClick={() => updateQuantity(product._id, quantity + 1, quantity)} 
            className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
