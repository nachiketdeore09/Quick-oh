"use client";

import React, { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/services";
import { Order } from "@/types";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  ShoppingBag, 
  User, 
  ArrowRight,
  Loader2,
  Bell,
  Activity
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveOrders() {
  const { socket, isConnected } = useSocket();
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== "admin" && user?.role !== "vendor"))) {
      toast.error("Access denied. Admin portal only.");
      router.push("/admin-login");
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Initial Fetch: Fetch active orders (Pending for admin/vendor)
  const fetchOrders = async () => {
    try {
      const resp = await orderService.getActiveOrders();
      // Backend getActiveOrders for Admin/Vendor returns [Pending, Accepted, Assigned, Processing]
      const data = resp.data || resp;
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load live orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Socket: Listen for new orders
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join admin-room to receive new order broadcasts
    socket.emit("joinRoom", "admin-room");

    const handleNewOrder = (data: any) => {
      // Play sound notification if possible or just toast
      toast.success("New Order Incoming!", {
        icon: '🔔',
        duration: 5000,
      });
      fetchOrders(); // Refresh the list
    };

    socket.on("newOrder", handleNewOrder);

    return () => {
      socket.off("newOrder", handleNewOrder);
    };
  }, [socket, isConnected]);

  const handleAdminAccept = async (orderId: string) => {
    setAcceptingId(orderId);
    try {
      await orderService.adminAcceptOrder(orderId);
      toast.success("Order Accepted & Pushed to Delivery Partners!");
      fetchOrders(); // Refresh statuses
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to accept order");
    } finally {
      setAcceptingId(null);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-[#007cf0]" />
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === "Pending");
  const acceptedOrders = orders.filter(o => o.status === "Accepted");
  const ongoingOrders = orders.filter(o => ["Assigned", "Processing", "Shipped"].includes(o.status));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col pt-20">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Live Monitoring</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white">Order Command Center</h1>
            <p className="text-gray-500 mt-2">Manage incoming orders and push them to delivery partners.</p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white dark:bg-gray-900 px-6 py-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Pending</p>
                <p className="text-xl font-black">{pendingOrders.length}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 px-6 py-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[#007cf0]">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Active</p>
                <p className="text-xl font-black">{acceptedOrders.length + ongoingOrders.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Incoming Orders Section */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" /> Action Required
              <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingOrders.length}</span>
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1,2].map(i => <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-3xl" />)}
              </div>
            ) : pendingOrders.length > 0 ? (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {pendingOrders.map((order) => (
                    <motion.div 
                      key={order._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all border-l-4 border-l-orange-500"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Order #{order._id.slice(-6).toUpperCase()}</span>
                            <span className="text-sm font-medium text-gray-500">{new Date(order.createdAt!).toLocaleTimeString()}</span>
                          </div>
                          
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 shrink-0">
                               <User className="w-6 h-6" />
                            </div>
                            <div>
                               <h3 className="font-bold text-lg dark:text-white">{(order.user as any)?.name || "Customer"}</h3>
                               <p className="text-sm text-gray-500 flex items-center gap-1">
                                 <MapPin className="w-3.5 h-3.5" /> {order.shippingAddress?.address}
                               </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-xl text-xs font-medium border border-gray-100 dark:border-gray-700">
                                {item.product?.productName} <span className="text-gray-400 ml-1">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="md:w-56 flex flex-col justify-between items-end gap-6 text-right">
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase">Total Amount</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">₹{order.totalAmount}</p>
                          </div>
                          
                          <button 
                            onClick={() => handleAdminAccept(order._id)}
                            disabled={acceptingId === order._id}
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-400 text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {acceptingId === order._id ? <Loader2 className="animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> ACCEPT ORDER</>}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-[40px] p-20 text-center border border-dashed border-gray-200 dark:border-gray-800">
                <ShoppingBag className="w-16 h-16 text-gray-200 dark:text-gray-800 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400">All Quiet For Now</h3>
                <p className="text-gray-500 mt-2">New orders from customers will appear here in real-time.</p>
              </div>
            )}
          </div>

          {/* Activity Stream Section */}
          <div className="space-y-6">
             <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> Processing Pool
              <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full">{acceptedOrders.length + ongoingOrders.length}</span>
            </h2>

            <div className="space-y-4">
               {acceptedOrders.map(order => (
                 <div key={order._id} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black bg-blue-500/10 text-[#007cf0] px-2 py-1 rounded-md uppercase tracking-wider">Awaiting Partner</span>
                      <span className="text-xs text-gray-400">#{order._id.slice(-4).toUpperCase()}</span>
                    </div>
                    <p className="font-bold text-sm truncate">{(order.user as any)?.name || "Customer"}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1 italic">Waiting for a nearby delivery partner to pick up...</p>
                 </div>
               ))}

               {ongoingOrders.map(order => (
                 <div key={order._id} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black bg-green-500/10 text-green-600 px-2 py-1 rounded-md uppercase tracking-wider">In Transit</span>
                      <span className="text-xs text-gray-400">#{order._id.slice(-4).toUpperCase()}</span>
                    </div>
                    <p className="font-bold text-sm truncate">{(order.user as any)?.name || "Customer"}</p>
                    <div className="mt-3 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-green-500/20 flex items-center justify-center">
                             <Package className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{order.status}</span>
                       </div>
                       <ArrowRight className="w-4 h-4 text-gray-300" />
                    </div>
                 </div>
               ))}

               {acceptedOrders.length === 0 && ongoingOrders.length === 0 && (
                 <div className="py-10 text-center text-gray-400 text-sm">No ongoing deliveries</div>
               )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
