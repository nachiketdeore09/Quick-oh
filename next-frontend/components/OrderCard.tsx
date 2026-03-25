"use client";

import React from "react";
import { Order } from "@/types";
import { Package, Clock, CheckCircle2, Truck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/cn";

export const OrderCard = ({ order }: { order: Order }) => {
  const statusConfig = {
    Pending: { icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
    Accepted: { icon: CheckCircle2, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    Shipped: { icon: Truck, color: "text-orange-500", bg: "bg-orange-500/10" },
    Delivered: { icon: Package, color: "text-green-500", bg: "bg-green-500/10" },
    Cancelled: { icon: Package, color: "text-red-500", bg: "bg-red-500/10" }
  };
  
  const config = statusConfig[order.status] || statusConfig.Pending;
  const StatusIcon = config.icon;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            Order #{order._id.slice(-6).toUpperCase()}
            {order.createdAt && <span className="truncate"> • {new Date(order.createdAt).toLocaleDateString()}</span>}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {order.items?.slice(0, 3).map((item, idx) => (
              <span key={idx} className="text-sm font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                {item.quantity}x {item.product?.productName || "Item"}
              </span>
            ))}
            {(order.items?.length || 0) > 3 && (
              <span className="text-sm font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                +{(order.items?.length || 0) - 3} more
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">₹{order.totalAmount || 0}</p>
          <p className="text-sm text-gray-500">{order.items?.length || 0} items</p>
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
          Track Order
        </Link>
      </div>
    </div>
  );
};
