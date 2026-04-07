"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { orderService } from "@/services/services";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/types";
import { Loader } from "@/components/Loader";
import { Package, Clock, CheckCircle2, Truck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/cn";

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    const fetchOrders = async () => {
      try {
        const data = await orderService.getUserOrderHistory();
        setOrders(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null; // Protected by wrapper usually

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {loading ? (
          <Loader />
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm text-center">
             <Package className="w-16 h-16 text-gray-300 mb-6" />
             <h2 className="text-2xl font-semibold mb-2">No Past Orders</h2>
             <p className="text-gray-500 mb-6">Looks like you haven't placed an order yet.</p>
             <Link 
              href="/shop" 
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded-xl font-medium"
             >
               Start Browsing
             </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
                const statusConfig = {
                    Pending: { icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
                    Accepted: { icon: CheckCircle2, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                    Assigned: { icon: Truck, color: "text-yellow-500", bg: "bg-yellow-500/10" },
                    Shipped: { icon: Truck, color: "text-orange-500", bg: "bg-orange-500/10" },
                    Delivered: { icon: Package, color: "text-green-500", bg: "bg-green-500/10" },
                    Cancelled: { icon: Package, color: "text-red-500", bg: "bg-red-500/10" }
                };
                const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.Pending;
                const StatusIcon = config.icon;

                return (
                 <div key={order._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            Order #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-sm mt-2 font-medium">{order.address}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg">₹{order.totalAmount || "0"}</p>
                    </div>
                    </div>
                    
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex items-center justify-between">
                    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium", config.bg, config.color)}>
                        <StatusIcon className="w-4 h-4" />
                        {order.status}
                    </div>
                    
                    <Link 
                        href={`/tracking/${order._id}`}
                        className="text-[#007cf0] hover:text-[#00dfd8] font-medium transition text-sm flex items-center gap-1"
                    >
                        View tracking map
                    </Link>
                    </div>
                </div>
                )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
