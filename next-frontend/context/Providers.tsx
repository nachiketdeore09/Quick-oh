"use client";

import React from "react";
import { AuthProvider } from "./AuthContext";
import { SocketProvider } from "./SocketContext";
import { CartProvider } from "./CartContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SocketProvider>
        <CartProvider>{children}</CartProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
