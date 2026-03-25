"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { CartItem, Product } from "@/types";
import { cartService } from "@/services/services";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, newQuantity: number, oldQuantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const resp = await cartService.getCartInfo();
      const cartData = resp.data || { cart: [], total: 0 };
      setCart(cartData.cart || []);
      setTotalPrice(cartData.total || 0);
    } catch (error) {
      console.error("Failed to fetch cart", error);
      // Suppress toast logic inside initial mount
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId: string, quantity: number): Promise<void> => {
    if (!isAuthenticated) {
      toast.error("Please login to add to cart");
      return;
    }
    setLoading(true);
    try {
      await cartService.addProductToCart(productId, quantity);
      toast.success("Added to cart");
      await fetchCart();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      await cartService.removeAnItemFromCart(productId);
      toast.success("Removed from cart");
      await fetchCart();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to remove item");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number, oldQuantity: number) => {
    if (!isAuthenticated) return;
    if (newQuantity <= 0) {
      return removeFromCart(productId);
    }
    setLoading(true);
    try {
      if (newQuantity > oldQuantity) {
         // Assuming API requirement: call addProductToCart with exactly quantity differences
         await cartService.addProductToCart(productId, newQuantity - oldQuantity);
      } else if (newQuantity < oldQuantity) {
         // Assuming API requirement: reduceOneItem might just reduce by 1 each call
         const diff = oldQuantity - newQuantity;
         for (let i = 0; i < diff; i++) {
           await cartService.reduceOneItem(productId);
         }
      }
      await fetchCart();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Error updating cart quantity");
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      await cartService.clearCart();
      await fetchCart();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Error clearing cart");
    } finally {
      setLoading(false);
    }
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice, // Fetching directly from backend total response calculation
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
