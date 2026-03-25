"use client";

import React from "react";
import Link from "next/link";
import { Category } from "@/types";
import { motion } from "framer-motion";

export const CategoryCard = ({ category }: { category: Category }) => {
  return (
    <Link href={`/shop?category=${encodeURIComponent(category.name)}`}>
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-[#00dfd8]/30 transition group cursor-pointer"
      >
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 group-hover:bg-[#007cf0]/5 transition-colors flex items-center justify-center p-2">
          <img 
            src={category.categoryImage || "https://placehold.co/150x150?text=Category"} 
            alt={category.name} 
            className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300" 
          />
        </div>
        <h3 className="font-semibold text-center text-sm group-hover:text-[#007cf0] transition-colors line-clamp-2">{category.name}</h3>
      </motion.div>
    </Link>
  );
};
