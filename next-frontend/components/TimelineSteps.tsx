"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, CreditCard, Box, MapPin } from "lucide-react";

export const TimelineSteps = () => {
  const steps = [
    {
      title: "Browse & Add",
      description: "Pick from thousands of fresh products",
      icon: ShoppingCart,
      color: "bg-blue-500",
    },
    {
      title: "Quick Checkout",
      description: "Pay securely in seconds",
      icon: CreditCard,
      color: "bg-indigo-500",
    },
    {
      title: "We Pack It",
      description: "Prepared instantly at our dark store",
      icon: Box,
      color: "bg-orange-500",
    },
    {
      title: "At Your Door",
      description: "Delivered to you within 10 minutes",
      icon: MapPin,
      color: "bg-teal-500",
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-950 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">How Quick-oh Works</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Experience the magic of 10-minute grocery delivery with our streamlined process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-[60px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-blue-500/20 via-orange-500/20 to-teal-500/20" />
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative flex flex-col items-center text-center z-10"
              >
                <div className={`w-20 h-20 rounded-2xl ${step.color} shadow-lg shadow-${step.color.split('-')[1]}-500/30 flex items-center justify-center text-white mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300`}>
                  <Icon className="w-10 h-10" />
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 w-full p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
