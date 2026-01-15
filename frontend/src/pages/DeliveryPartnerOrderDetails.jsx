import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  Button,
  CircularProgress,
  Chip,
  IconButton,
} from "@mui/material";
import LiveLocationTracker from "../components/LiveLocationTracker";
import LiveRouteMap from "../components/LiveRouteMap";
import ChatIcon from "@mui/icons-material/Chat";
import ChatWindow from "../components/chatWindow.jsx";
import { useChat } from "../context/ChatContext";
import socket from "../socket.js";

const DeliveryPartnerOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [partnerPosition, setPartnerPosition] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const partnerPositionRef = useRef(null);

  // user joins the chat room
  const { joinChat, unreadByOrder } = useChat();
  useEffect(() => {
    joinChat(orderId);
  }, [orderId]);

  //Function to update the partners position
  const updatePartnerPosition = useCallback((lat, lng) => {
    if (
      !partnerPositionRef.current ||
      partnerPositionRef.current[0] !== lat ||
      partnerPositionRef.current[1] !== lng
    ) {
      partnerPositionRef.current = [lat, lng];
      setPartnerPosition(partnerPositionRef.current);
    }
  }, []);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          // "http://localhost:8000/api/v1/users/current-user",
          "https://quick-oh.onrender.com/api/v1/users/current-user",
          { withCredentials: true }
        );
        setCurrentUser(res.data.data);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };
    fetchUser();
  }, []);

  // 📦 Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(
          // `http://localhost:8000/api/v1/order/getSingleOrderById/${orderId}`,
          `https://quick-oh.onrender.com/api/v1/order/getSingleOrderById/${orderId}`,
          { withCredentials: true }
        );
        setOrder(res.data.data);
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // 🔌 Join order room + listen for own location echo (optional)
  useEffect(() => {
    socket.emit("joinOrderRoom", { orderId });
    socket.emit("join-chat", { orderId });

    const handleLocationUpdate = ({ latitude, longitude }) => {
      updatePartnerPosition(latitude, longitude);
    };
    socket.on("partner-location-update", handleLocationUpdate);

    return () => {
      socket.off("partner-location-update", handleLocationUpdate);
    };
  }, [orderId, updatePartnerPosition]);

  const handleConfirmDelivery = async () => {
    try {
      setConfirming(true);
      await axios.post(
        // `http://localhost:8000/api/v1/order/updateOrderStatus/${orderId}`,
        `https://quick-oh.onrender.com/api/v1/order/updateOrderStatus/${orderId}`,
        { status: "Delivered" },
        { withCredentials: true }
      );

      socket.emit("order-delivered", { orderId });
      alert("✅ Delivery confirmed successfully!");
      navigate("/active-orders");
    } catch (err) {
      console.error("Delivery confirmation failed:", err);
      alert("Failed to confirm delivery");
    } finally {
      setConfirming(false);
    }
  };

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );

  if (!order)
    return (
      <Typography textAlign="center" mt={4}>
        Order not found
      </Typography>
    );

  const customerPosition = [
    order.shippingAddress.latitude,
    order.shippingAddress.longitude,
  ];

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      {/* 📡 Start live GPS tracking */}
      <LiveLocationTracker
        orderId={orderId}
        partnerId={order.assignedTo}
        onLocationUpdate={setPartnerPosition}
      />

      <Typography variant="h4" fontWeight="bold" color="primary">
        Delivery Navigation
      </Typography>

      {/* 🗺️ Live Route Map */}
      <Box sx={{ width: "100%", height: "420px" }}>
        <LiveRouteMap
          customerPosition={customerPosition}
          partnerPosition={partnerPosition}
        />
      </Box>

      {/* 📦 Order Details */}
      <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h5">Order #{order._id}</Typography>
          <Divider sx={{ my: 2 }} />

          <Typography>
            <strong>Customer:</strong> {order.user?.name}
          </Typography>

          <Typography sx={{ mt: 1 }}>
            <strong>Status:</strong>{" "}
            <Chip
              label={order.status}
              color={
                order.status === "Delivered"
                  ? "success"
                  : order.status === "Pending"
                  ? "warning"
                  : "primary"
              }
              size="small"
            />
          </Typography>

          <Typography sx={{ mt: 1 }}>
            <strong>Payment:</strong> {order.paymentStatus}
          </Typography>

          <Typography sx={{ mt: 1 }}>
            <strong>Address:</strong> {order.shippingAddress.address}
          </Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>
            Items
          </Typography>

          <List dense>
            {order.items.map((item, idx) => (
              <ListItem key={idx}>
                {item.product?.productName} × {item.quantity}
              </ListItem>
            ))}
          </List>

          {order.status !== "Delivered" && (
            <Box textAlign="center" mt={2}>
              <Button
                variant="contained"
                color="primary"
                disabled={confirming}
                onClick={handleConfirmDelivery}
                sx={{ px: 4, py: 1, borderRadius: 2 }}
              >
                {confirming ? "Confirming..." : "Confirm Delivery"}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
      {/* Floating Chat Button */}
      <IconButton
        onClick={() => setOpenChat(true)}
        sx={{
          position: "fixed",
          bottom: 25,
          left: 25,
          bgcolor: "primary.main",
          color: "white",
          width: 56,
          height: 56,
          boxShadow: 4,
          "&:hover": { bgcolor: "primary.dark" },
          zIndex: 1500,
        }}
      >
        <ChatIcon />
      </IconButton>

      <ChatWindow
        open={openChat}
        onClose={() => setOpenChat(false)}
        orderId={order._id}
        currentUser={currentUser}
      />

      {/*  For the unread message */}
      {unreadByOrder[orderId] > 0 && (
        <Box
          sx={{
            position: "absolute",
            top: -4,
            right: -4,
            bgcolor: "red",
            color: "white",
            borderRadius: "50%",
            width: 20,
            height: 20,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {unreadByOrder[orderId]}
        </Box>
      )}
    </Box>
  );
};

export default DeliveryPartnerOrderDetails;
