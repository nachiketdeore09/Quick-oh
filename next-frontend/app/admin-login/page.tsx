"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/services";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { Shield, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const resp = await authService.login(formData);
      const authData = resp.data;
      
      const userPayload = {
        ...authData.user,
        token: authData.accessToken
      };

      if (userPayload.role !== "admin") {
        toast.error("Unauthorized. Admin privileges required.");
        return;
      }
      
      login(userPayload);
      toast.success("Welcome, Admin!");
      router.push("/"); // Direct to home or admin dashboard
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#007cf0]/10 to-transparent pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-800 relative z-10"
      >
        <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6 transition">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Link>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#007cf0] to-[#00dfd8] flex items-center justify-center shadow-lg shadow-[#007cf0]/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Portal</h1>
            <p className="text-gray-400 text-sm">Quick-oh Admin Access</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-8">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input 
                type="email" 
                placeholder="admin@quickoh.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-700 bg-gray-800 focus:ring-2 focus:ring-[#007cf0] outline-none transition text-white placeholder-gray-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input 
                type="password" 
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-700 bg-gray-800 focus:ring-2 focus:ring-[#007cf0] outline-none transition text-white placeholder-gray-500"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#007cf0] to-[#00dfd8] text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition flex justify-center items-center shadow-md shadow-[#007cf0]/20 disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Secure Login"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
