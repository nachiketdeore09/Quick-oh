"use client";

import React, { useEffect, useState, use } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSocket } from "@/context/SocketContext";
import { orderService } from "@/services/services";
import { Order } from "@/types";
import { CheckCircle2, Package, Truck, Clock, MapPin, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

// Dynamically import map to avoid SSR 'window is not defined' error
const LiveMap = dynamic(() => import("@/components/MapComponent"), { 
  ssr: false, 
  loading: () => <div className="h-64 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl flex items-center justify-center">Loading Map...</div>
});

export default function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const { socket, isConnected } = useSocket();
  const router = useRouter();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [partnerLocation, setPartnerLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    if (order?.status === "Delivered") {
       const timer = setTimeout(() => {
          router.push("/shop");
          toast.success("Delivery complete! Returning to shop.");
       }, 5000);
       return () => clearTimeout(timer);
    }
  }, [order?.status, router]);

  const steps = ["Pending", "Accepted", "Shipped", "Delivered"];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getSingleOrderById(id);
        const orderData = data.data || data;
        setOrder(orderData);
        
        // Also fetch initial live partner location
        try {
           const locData = await orderService.livePartnerLocation(id);
           if (locData?.data?.latitude && locData?.data?.longitude) {
              setPartnerLocation({ lat: locData.data.latitude, lng: locData.data.longitude });
           }
        } catch (e) {
           // Partner location might not be available yet
           console.log("No initial partner location");
        }
      } catch (error) {
        console.error("Failed to fetch order", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!socket || !isConnected || !order) return;

    // Join order tracking room specific to this order
    socket.emit("joinOrderRoom", { orderId: id });

    const handleStatusUpdate = (data: { orderId: string, status: any }) => {
      if (data.orderId === id) {
        setOrder((prev) => prev ? { ...prev, status: data.status } : null);
      }
    };

    const handleLocationUpdate = (data: { latitude: number, longitude: number }) => {
      setPartnerLocation({ lat: data.latitude, lng: data.longitude });
    };

    socket.on("order-status-update", handleStatusUpdate);
    socket.on("partner-location-update", handleLocationUpdate);

    return () => {
      socket.off("order-status-update", handleStatusUpdate);
      socket.off("partner-location-update", handleLocationUpdate);
    };
  }, [socket, isConnected, order, id]);

  if (loading) return <div className="min-h-screen pt-32 text-center">Loading Tracking Info...</div>;
  if (!order) return <div className="min-h-screen pt-32 text-center">Order not found.</div>;

  const currentStepIndex = steps.indexOf(order.status === "Cancelled" ? "Pending" : order.status);

  return (
    <div className="min-h-screen flex flex-col pt-20 bg-gray-50 dark:bg-gray-950">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Track Your Order</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
              <div>
                <p className="text-gray-500 mb-1">Order ID</p>
                <p className="font-semibold">#{id.slice(-6).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 mb-1">Status</p>
                <p className={`font-bold ${order.status === 'Cancelled' ? 'text-red-500' : 'text-[#007cf0]'}`}>{order.status}</p>
              </div>
            </div>

            {order.status === "Cancelled" ? (
              <div className="text-center py-8 text-red-500 font-bold text-lg">Order was Cancelled</div>
            ) : (
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800 z-0"></div>
                <div 
                  className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-[#007cf0] to-[#00dfd8] z-0 transition-all duration-500"
                  style={{ height: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                <div className="space-y-8 relative z-10">
                  {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isActive = index === currentStepIndex;
                    
                    let Icon = Clock;
                    if (step === "Accepted") Icon = Package;
                    if (step === "Shipped") Icon = Truck;
                    if (step === "Delivered") Icon = CheckCircle2;

                    return (
                      <div key={step} className="flex gap-6 items-center">
                        <motion.div 
                          initial={false}
                          animate={{ 
                            scale: isActive ? 1.2 : 1,
                            backgroundColor: isCompleted ? "#007cf0" : "var(--fallback-bg, #f3f4f6)"
                          }}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${isCompleted ? 'text-white shadow-md shadow-blue-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}
                        >
                          <Icon className="w-5 h-5" />
                        </motion.div>
                        <div>
                          <h3 className={`text-lg font-semibold ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {step}
                          </h3>
                          {isActive && step === "Shipped" && (
                            <p className="text-sm text-[#007cf0] mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> Driver is on the way
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
             <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <MapPin className="text-[#00dfd8]" /> Live Partner Map
                </h3>
                {order.status === "Delivered" || order.status === "Cancelled" ? (
                   <div className="h-64 w-full bg-gray-50 flex items-center justify-center rounded-2xl border border-gray-100">
                     Tracking completed.
                   </div>
                ) : order.shippingAddress?.latitude ? (
                   <div className="h-64 w-full rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                     <LiveMap 
                       lat={order.shippingAddress.latitude} 
                       lng={order.shippingAddress.longitude} 
                       partnerLat={partnerLocation?.lat}
                       partnerLng={partnerLocation?.lng}
                       label="Your Delivery Location" 
                     />
                   </div>
                ) : (
                   <div className="h-64 w-full bg-gray-50 flex items-center justify-center rounded-2xl border border-gray-100">
                     No delivery address found for this order.
                   </div>
                )}
             </div>
             
             <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="font-bold text-lg mb-2">Delivery Address</h3>
                <p className="text-gray-500">{order.shippingAddress?.address || order.address || "Fetching address..."}</p>
             </div>

             {/* Order Items Dropdown */}
             <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mt-6">
               <button 
                 onClick={() => setShowItems(!showItems)}
                 className="w-full p-6 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
               >
                 <div className="flex items-center gap-3">
                   <ShoppingBag className="text-[#007cf0] w-6 h-6" />
                   <span className="font-bold text-lg">Order Items</span>
                 </div>
                 {showItems ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
               </button>
               
               {showItems && (
                 <div className="p-6 pt-0 space-y-4">
                   <div className="h-px bg-gray-100 dark:bg-gray-800 mb-4"></div>
                   {order.items?.map((item: any) => (
                     <div key={item._id} className="flex items-center justify-between gap-4">
                       <div className="flex items-center gap-4">
                         <img 
                           src={item.product?.productImage} 
                           alt={item.product?.productName}
                           className="w-12 h-12 rounded-xl object-cover bg-gray-100 p-1"
                         />
                         <div>
                           <p className="font-semibold text-sm line-clamp-1">{item.product?.productName}</p>
                           <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity}</p>
                         </div>
                       </div>
                       <div className="text-right flex-shrink-0">
                         <p className="font-bold text-sm">₹{item.product?.price * item.quantity}</p>
                       </div>
                     </div>
                   ))}
                   <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between font-bold">
                      <span>Total Amount</span>
                      <span className="text-[#007cf0]">₹{order.totalAmount}</span>
                   </div>
                 </div>
               )}
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
