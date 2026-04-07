"use client";

import React, { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/services";
import { Order } from "@/types";
import { MapPin, Package, Navigation, LogOut, CheckCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function DeliveryDashboard() {
  const { socket, isConnected } = useSocket();
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [ordersPool, setOrdersPool] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "deliveryPartner")) {
      router.push("/delivery-login?redirect=/delivery-dashboard");
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Fetch initial pool of active orders (Pending/Processing)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const resp = await orderService.getActiveOrders();
        const data = resp.data || resp;
        setOrdersPool(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error("Failed to load active orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket || !isConnected || !user) return;

    // Join the partner-specific room to receive new order broadcasts
    socket.emit("joinRoom", `delivery-partner-${user._id}`);

    const handleNewOrder = (data: any) => {
      toast.success("New Order Available in your zone!");
      // Re-fetch pool or optimistially add
      // The payload has { orderId, shippingAddress, totalAmount }
      // It's safer to re-fetch to get full details (items, products etc)
      orderService.getActiveOrders().then(resp => {
         const d = resp.data || resp;
         if (Array.isArray(d)) setOrdersPool(d);
      });
    };

    socket.on("newOrder", handleNewOrder);

    return () => {
      socket.off("newOrder", handleNewOrder);
    };
  }, [socket, isConnected, user]);

  const handleAcceptOrder = async (orderId: string) => {
    setAcceptingId(orderId);
    try {
      await orderService.acceptListedOrder(orderId);
      toast.success("Order Accepted Successfully!");
      // Proceed to the delivery navigation screen for this order
      router.push(`/delivery/navigate/${orderId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to accept order");
      // If someone else accepted it, refresh the pool
      const resp = await orderService.getActiveOrders();
      setOrdersPool(Array.isArray(resp.data) ? resp.data : []);
    } finally {
      setAcceptingId(null);
    }
  };

  if (!isAuthenticated || user?.role !== "deliveryPartner") return null;

  // Separate orders into available vs assigned to ME (if they refresh page while holding an order)
  const availableOrders = ordersPool.filter(o => o.status === "Pending" && !o.assignedTo);
  const myActiveOrders = ordersPool.filter(o => (o.status === "Assigned" || o.status === "Shipped") && o.assignedTo === user._id);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-[#00dfd8] flex items-center justify-center hidden sm:flex">
            <MapPin className="text-gray-900 w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Partner Dashboard</h1>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {isConnected ? 'Online & Listening for Orders' : 'Disconnected'}
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => { logout(); router.push("/delivery-login"); }}
          className="text-gray-400 hover:text-white flex items-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 mt-6 space-y-8">
        
        {/* Check if partner has an active ongoing duty */}
        {myActiveOrders.length > 0 && (
          <section>
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-teal-400">
               <Navigation className="w-5 h-5" /> Ongoing Delivery
             </h2>
             <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-teal-500/30 rounded-3xl p-6 shadow-xl shadow-teal-500/10 mb-8">
                {myActiveOrders.map(order => (
                  <div key={order._id} className="flex flex-col sm:flex-row justify-between items-center gap-4">
                     <div>
                       <h3 className="font-bold text-lg">Order #{order._id.slice(-6).toUpperCase()}</h3>
                       <p className="text-sm text-gray-400">Currently {order.status}</p>
                     </div>
                     <button
                        onClick={() => router.push(`/delivery/navigate/${order._id}`)}
                        className="w-full sm:w-auto bg-teal-500 text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-teal-400 transition"
                      >
                        Resume Navigation
                      </button>
                  </div>
                ))}
             </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Package className="w-5 h-5" /> Available Order Pool
          </h2>

          {authLoading ? (
            <div className="py-20 text-center text-gray-400">Verifying Partner Access...</div>
          ) : availableOrders.length === 0 ? (
            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
              <Clock className="w-16 h-16 text-gray-600 mb-4 animate-pulse" />
              <h3 className="text-xl font-medium text-gray-300">No pending orders</h3>
              <p className="text-gray-500 mt-2 max-w-sm">Wait for new orders to drop. They will appear here automatically.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableOrders.map(order => (
                <motion.div 
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
                >
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                        NEW ORDER
                      </span>
                      <span className="text-teal-400 font-bold">₹{order.totalAmount}</span>
                    </div>
                    <h3 className="text-lg font-bold">Order #{order._id.slice(-6).toUpperCase()}</h3>
                    
                    <div className="mt-4 bg-gray-950 p-3 rounded-xl border border-gray-800">
                      <h4 className="text-xs text-gray-500 uppercase mb-1">Deliver To:</h4>
                      <p className="text-sm text-gray-300 line-clamp-2">{order.shippingAddress?.address || "Customer Location"}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleAcceptOrder(order._id)}
                    disabled={acceptingId === order._id}
                    className="w-full bg-gradient-to-r from-teal-400 to-[#00dfd8] text-gray-900 py-3 rounded-xl font-bold hover:opacity-90 transition flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {acceptingId === order._id ? "Accepting..." : <><CheckCircle className="w-5 h-5" /> Accept Delivery</>}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
