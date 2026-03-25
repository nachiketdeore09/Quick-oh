"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, MapPin, ShoppingBag, Navigation } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden w-full pt-16 pb-24 md:pt-24 md:pb-32 px-4 md:px-8">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-gradient-to-br from-[#007cf0]/20 to-[#00dfd8]/20 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <motion.div 
          className="flex-1 text-center md:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium text-sm mb-6 border border-blue-500/20">
            <Clock className="w-4 h-4" /> 
            <span>10-Minute Delivery Guarantee</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Groceries delivered in <br className="hidden md:block"/>
            <span className="text-gradient">minutes, not hours.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto md:mx-0">
            Get everything you need from fresh produce to personal care items 
            delivered to your doorstep in 10 minutes or less.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link 
              href="/shop" 
              className="bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-xl shadow-gray-900/10"
            >
              Shop Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/delivery-login" 
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              Partner Login <Navigation className="w-5 h-5 text-[#00dfd8]" />
            </Link>
          </div>
        </motion.div>

        {/* Floating elements section */}
        <motion.div 
          className="flex-1 relative w-full h-[400px] md:h-[500px] hidden md:block"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-[40px] border border-white/50 shadow-2xl overflow-hidden flex items-center justify-center">
             <div className="text-center p-8 glass rounded-3xl animate-pulse">
                <ShoppingBag className="w-24 h-24 mx-auto text-[#007cf0] mb-4" />
                <h3 className="text-2xl font-bold">Quick-oh Store</h3>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
