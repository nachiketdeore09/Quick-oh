"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 z-50 glass md:px-8 px-4 py-4 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight text-gradient">
          Quick-oh
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 font-medium text-sm">
          <Link href="/shop" className="hover:text-[#00dfd8] transition-colors">Shop</Link>
          {isAuthenticated && (
            <Link href="/orders" className="hover:text-[#00dfd8] transition-colors">My Orders</Link>
          )}
          {isAuthenticated && user?.role === "deliveryPartner" && (
            <Link href="/delivery-dashboard" className="hover:text-[#00dfd8] transition-colors">Dashboard</Link>
          )}
        </div>

        {/* Right side items */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/cart" className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full transform translate-x-1 -translate-y-1">
                {totalItems}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link 
                href={user?.role === "deliveryPartner" ? "/delivery-dashboard" : "/dashboard"}
                className="flex items-center gap-2 hover:text-[#00dfd8] transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#007cf0] to-[#00dfd8] flex items-center justify-center shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium hidden lg:inline">Dashboard</span>
              </Link>
              <button 
                onClick={logout}
                className="text-sm text-red-500 hover:text-red-600 transition font-medium border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/5"
              >
                Logout
              </button>
            </div>
          ) : (
             <Link 
               href="/login" 
               className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white px-4 py-2 rounded-full font-medium hover:opacity-90 transition shadow-md"
             >
               <User className="w-4 h-4" />
               Login
             </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <Link href="/cart" className="relative p-2">
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 flex flex-col items-center justify-center rounded-full transform translate-x-1 -translate-y-1">
                {totalItems}
              </span>
            )}
          </Link>
          <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white/50 dark:bg-black/50 backdrop-blur-xl mt-4 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800"
          >
            <div className="flex flex-col p-4 gap-4">
              <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">Shop</Link>
              {isAuthenticated && (
                <>
                  <Link href={user?.role === "deliveryPartner" ? "/delivery-dashboard" : "/dashboard"} onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl flex items-center gap-2">
                    <User className="w-5 h-5" /> Dashboard
                  </Link>
                  <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">My Orders</Link>
                </>
              )}
              {isAuthenticated && user?.role === "deliveryPartner" && (
                <Link href="/delivery-dashboard" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">Dashboard</Link>
              )}

              {isAuthenticated ? (
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="mt-4 bg-red-500/10 text-red-500  py-3 rounded-xl font-medium w-full"
                >
                  Logout
                </button>
              ) : (
                <Link 
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)} 
                  className="mt-4 text-center bg-gradient-to-r from-[#007cf0] to-[#00dfd8] text-white py-3 rounded-xl font-medium w-full shadow-md"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
