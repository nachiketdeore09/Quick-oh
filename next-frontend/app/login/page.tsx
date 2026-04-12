"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/services";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
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
      // Backend returns ApiResponse(200, { user, accessToken, refreshToken }, "...")
      // So resp is { statusCode, data, message }
      const authData = resp.data;
      
      const userPayload = {
        ...authData.user,
        token: authData.accessToken
      };
      
      login(userPayload);
      toast.success("Welcome back to Quick-oh!");
      
      if (authData.user?.role === "deliveryPartner") {
        router.push("/delivery-dashboard");
      } else {
        router.push("/shop");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800"
      >
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">Login</h1>
        <p className="text-gray-500 mb-8">Enter your details to access your account.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="email" 
                placeholder="you@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#007cf0] outline-none transition"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="password" 
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#007cf0] outline-none transition"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#007cf0] to-[#00dfd8] text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition flex justify-center items-center shadow-md disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#007cf0] hover:underline font-medium">
            Sign up
          </Link>
        </p>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-xs text-gray-400 mb-2">Staff member?</p>
          <Link 
            href="/admin-login" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-[#007cf0] transition-colors"
          >
            Access Admin Portal &rarr;
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
