"use client";

import React from "react";
import { motion } from "framer-motion";

export const Loader = ({ fullScreen = false }: { fullScreen?: boolean }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 border-4 border-[#00dfd8] border-t-[#007cf0] rounded-full"
      />
      <p className="text-[#007cf0] font-medium tracking-wide animate-pulse">Loading...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="p-8 w-full flex justify-center">{content}</div>;
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 border border-gray-100 dark:border-gray-800 flex flex-col h-full animate-pulse">
      <div className="w-full h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-2" />
      <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-4" />
      <div className="mt-auto pt-4 flex items-center justify-between">
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
        <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      </div>
    </div>
  );
};
