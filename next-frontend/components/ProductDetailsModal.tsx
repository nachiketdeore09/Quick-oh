"use client";

import React, { useEffect } from "react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { Plus, Minus, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailsModal = ({ product, onClose }: ProductDetailsModalProps) => {
  const { cart, addToCart, updateQuantity } = useCart();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (product) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden"; // Prevent scrolling behind modal
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [product, onClose]);

  if (!product) return null;

  const cartItem = cart?.find(item => item.product._id === product._id);
  const quantity = cartItem?.quantity || 0;

  const finalPrice = product.discount 
    ? product.price - (product.price * product.discount / 100) 
    : product.price;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image Section */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 relative">
            {product.discount > 0 && (
              <div className="absolute top-6 left-6 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl z-10 shadow-sm">
                {product.discount}% OFF
              </div>
            )}
            <motion.div 
              layoutId={`img-${product._id}`}
              className="w-full aspect-square relative"
            >
              <img 
                src={product.productImage || "https://placehold.co/500x500?text=Product"} 
                alt={product.productName} 
                className="w-full h-full object-contain drop-shadow-xl"
              />
            </motion.div>
          </div>

          {/* Content Section */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#007cf0] mb-2 bg-[#007cf0]/10 w-max px-2.5 py-1 rounded-md">
              {product.productCategory}
            </span>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
              {product.productName}
            </h2>
            
            <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-6 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {product.stock || "In Stock"}
            </p>

            {/* Pricing Details */}
            <div className="mb-6 flex items-baseline gap-3">
              <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                ₹{Math.round(finalPrice)}
              </span>
              {product.discount > 0 && (
                <span className="text-lg text-gray-400 line-through decoration-gray-300 dark:decoration-gray-600">
                  ₹{product.price}
                </span>
              )}
            </div>

            {/* Description Area */}
            {product.description && (
              <div className="mb-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex-1">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100 mb-3">
                  <Info className="w-4 h-4 text-gray-400" />
                  Product Description
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            {/* Action Area */}
            <div className={`mt-auto pt-4 ${!product.description && "pt-8 border-t border-gray-100 dark:border-gray-800"}`}>
              {quantity > 0 ? (
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium px-4 text-gray-600 dark:text-gray-300">Quantity</span>
                  <div className="flex items-center gap-4 bg-white dark:bg-gray-900 shadow-sm rounded-xl p-1">
                    <button 
                      onClick={(e) => updateQuantity(product._id, quantity - 1, quantity)} 
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 transition"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="font-bold w-6 text-center text-lg">{quantity}</span>
                    <button 
                      onClick={(e) => updateQuantity(product._id, quantity + 1, quantity)} 
                      className="w-10 h-10 flex items-center justify-center bg-[#007cf0] hover:bg-[#0066c6] text-white rounded-lg transition shadow-md"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => addToCart(product._id, 1)}
                  className="w-full py-4 bg-gradient-to-r from-[#007cf0] to-[#00dfd8] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[#007cf0]/25 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add to Cart
                </motion.button>
              )}
            </div>
            
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
