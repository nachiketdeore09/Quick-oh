"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, ShoppingBag } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8 px-4 md:px-8 mt-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-1">
          <Link href="/" className="text-2xl font-bold tracking-tight text-gradient flex items-center gap-2 mb-4">
            <ShoppingBag className="text-[#00dfd8]" /> Quick-oh
          </Link>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
            Revolutionizing grocery delivery with blazing fast 10-minute speeds. Because your time matters.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center hover:bg-[#007cf0] hover:text-white transition-colors"><Facebook className="w-5 h-5"/></a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center hover:bg-[#007cf0] hover:text-white transition-colors"><Twitter className="w-5 h-5"/></a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center hover:bg-[#00dfd8] hover:text-white transition-colors"><Instagram className="w-5 h-5"/></a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center hover:bg-[#007cf0] hover:text-white transition-colors"><Linkedin className="w-5 h-5"/></a>
          </div>
        </div>
        
        <div className="col-span-1">
          <h3 className="font-semibold text-lg mb-4">Company</h3>
          <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
            <li><Link href="/about" className="hover:text-primary transition">About Us</Link></li>
            <li><Link href="/careers" className="hover:text-primary transition">Careers</Link></li>
            <li><Link href="/delivery-login" className="hover:text-primary transition">Become a Partner</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition">Contact</Link></li>
          </ul>
        </div>
        
        <div className="col-span-1">
          <h3 className="font-semibold text-lg mb-4">Categories</h3>
          <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
            <li><Link href="/shop?category=fruits" className="hover:text-primary transition">Fruits & Veggies</Link></li>
            <li><Link href="/shop?category=dairy" className="hover:text-primary transition">Dairy & Breakfast</Link></li>
            <li><Link href="/shop?category=snacks" className="hover:text-primary transition">Snacks & Munchies</Link></li>
            <li><Link href="/shop?category=drinks" className="hover:text-primary transition">Cold Drinks</Link></li>
          </ul>
        </div>
        
        <div className="col-span-1">
          <h3 className="font-semibold text-lg mb-4">Legal</h3>
          <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
            <li><Link href="/terms" className="hover:text-primary transition">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-primary transition">Privacy Policy</Link></li>
            <li><Link href="/refund" className="hover:text-primary transition">Refund Policy</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} Quick-oh Technologies Inc. All rights reserved.</p>
        <p className="mt-2 md:mt-0 flex gap-4">
          <span>Made with ❤️ for speed.</span>
        </p>
      </div>
    </footer>
  );
};
