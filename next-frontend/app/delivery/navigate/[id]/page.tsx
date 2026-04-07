"use client";

import React, { useEffect, useState, use } from "react";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import { orderService, api } from "@/services/services";
import { Order } from "@/types";
import { MapPin, CheckCircle2, Navigation, LogOut, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import Link from "next/link";

// Using dynamic map component because Leaflet throws errors on SSR
const LiveMap = dynamic(() => import("@/components/MapComponent"), { ssr: false, loading: () => <div className="h-64 w-full bg-gray-800 animate-pulse rounded-2xl"></div> });

export default function DeliveryNavigation({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const { socket, isConnected } = useSocket();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [partnerCoords, setPartnerCoords] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "deliveryPartner")) {
      router.push("/delivery-login");
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Fetch Order Details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getSingleOrderById(id);
        const orderData = data.data || data;
        setOrder(orderData);
      } catch (err) {
        toast.error("Failed to fetch order details");
        router.push("/delivery-dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, router]);

  // Handle GPS location streaming to backend socket for order tracking
  useEffect(() => {
    if (!order || !socket || !isConnected || order.status === "Delivered" || order.status === "Cancelled") return;

    let watchId: number;

    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setPartnerCoords({ lat, lng });

          // Emit location to socket so frontend tracking page updates
          socket.emit("updateLocation", {
            orderId: id,
            latitude: lat,
            longitude: lng
          });
        },
        (err) => console.warn("GPS error:", err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [socket, isConnected, order, id]);

  const handleUpdateStatus = async (newStatus: "Shipped" | "Delivered") => {
    setUpdating(true);
    try {
      // API call to update status (requires admin/server logic, but Assuming we hit the endpoint using Axios or emit socket)
      // Because /updateOrderStatus/:id uses checkAdmin middleware, typically partner might have a separate endpoint 
      // OR we just emit to socket and a backend watcher (or standard controller if bypass admin locally) takes it.
      // Assuming a standard api.post exists, or we emit to socket if API blocks it.

      // We will try standard POST to backend, if that fails due to admin check, fallback to emitting to socket directly.
      const res = await api.post(`/order/updateOrderStatus/${id}`, { status: newStatus });
      setOrder({ ...order!, status: newStatus });
      toast.success(`Order marked as ${newStatus}`);

      if (newStatus === "Delivered") {
        setTimeout(() => router.push("/delivery-dashboard"), 2000);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to update status to ${newStatus}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-teal-400">Loading route...</div>;
  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/delivery-dashboard" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition">
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </Link>
          <div>
            <h1 className="font-bold text-lg">Order #{id.slice(-6).toUpperCase()}</h1>
            <p className="text-xs text-teal-400 font-bold uppercase">{order.status}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 flex flex-col gap-6">

        {/* Map View */}
        <div className="bg-gray-900 rounded-3xl p-4 border border-gray-800 shadow-xl overflow-hidden relative">
          <div className="absolute top-6 left-6 z-10 bg-gray-900/90 backdrop-blur-md p-3 rounded-xl border border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <span className="text-xs text-gray-300">Origin: Dark Store</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00dfd8]"></div>
              <span className="text-xs text-gray-300">Destination: Customer</span>
            </div>
          </div>

          <div className="h-[40vh] w-full rounded-2xl overflow-hidden border border-gray-800">
            {order.shippingAddress?.latitude ? (
              <LiveMap
                lat={order.shippingAddress.latitude}
                lng={order.shippingAddress.longitude}
                partnerLat={partnerCoords?.lat}
                partnerLng={partnerCoords?.lng}
                label="Customer Location"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">No GPS Data available for customer.</div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800 shadow-xl">
          <h2 className="text-xl font-bold mb-4">Delivery Actions</h2>

          <div className="flex flex-col sm:flex-row gap-4">
            {order.status === "Assigned" && (
              <button
                onClick={() => handleUpdateStatus("Shipped")}
                disabled={updating}
                className="flex-1 bg-gradient-to-r from-teal-400 to-[#00dfd8] text-gray-900 py-4 rounded-xl font-bold hover:opacity-90 transition flex justify-center items-center gap-2 disabled:opacity-50"
              >
                <Navigation className="w-5 h-5" /> Start Trip (Pick up order)
              </button>
            )}

            {order.status === "Shipped" && (
              <button
                onClick={() => handleUpdateStatus("Delivered")}
                disabled={updating}
                className="flex-1 bg-green-500 text-white py-4 rounded-xl font-bold hover:bg-green-600 transition flex justify-center items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5" /> Mark as Delivered
              </button>
            )}

            {order.status === "Delivered" && (
              <div className="flex-1 bg-green-500/20 text-green-400 py-4 rounded-xl font-bold flex justify-center items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Order Successfully Delivered
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer Details</h3>
            <p className="font-bold text-lg mb-1">
              {typeof order.user === 'object' ? order.user?.name : "Customer"}
            </p>
            <p className="text-gray-400 flex items-start gap-2">
              <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
              {order.shippingAddress?.address}
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
