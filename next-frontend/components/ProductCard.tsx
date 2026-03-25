"use client";

import React from "react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";

export const ProductCard = ({ product }: { product: Product }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  
  // Find cart quantity based on `_id` now
  const cartItem = cart?.find(item => item.product._id === product._id);
  const quantity = cartItem?.quantity || 0;

  // Calculate discounted price: price - (price * discount / 100)
  const finalPrice = product.discount 
    ? product.price - (product.price * product.discount / 100) 
    : product.price;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition flex flex-col h-full group">
      <div className="relative w-full h-40 bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden mb-4 p-4 flex items-center justify-center cursor-pointer">
        {product.discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg z-10">
            {product.discount}% OFF
          </div>
        )}
        <img 
          src={product.productImage || "https://placehold.co/300x300?text=Product"} 
          alt={product.productName} 
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="flex-1 flex flex-col">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">{product.productCategory}</p>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 min-h-[48px]">{product.productName}</h3>
        <p className="text-sm text-gray-400 line-clamp-1 mt-1">{product.stock || "In Stock"}</p>
        
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold">₹{Math.round(finalPrice)}</span>
            {product.discount > 0 && (
              <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
            )}
          </div>
          
          {quantity > 0 ? (
            <div className="flex items-center gap-3 bg-gradient-to-r from-[#007cf0] to-[#00dfd8] text-white rounded-xl px-2 py-1 shadow-md">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  updateQuantity(product._id, quantity - 1, quantity);
                }} 
                className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded-md transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-medium w-4 text-center">{quantity}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  updateQuantity(product._id, quantity + 1, quantity);
                }} 
                className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded-md transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product._id, 1);
              }}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-[#007cf0] hover:bg-[#007cf0] hover:text-white rounded-xl font-medium transition flex items-center gap-2"
            >
              Add
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
