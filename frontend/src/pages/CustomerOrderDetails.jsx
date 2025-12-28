import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  List,
  ListItem,
  Divider,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ThankYouPopup from "../components/ThankyouPopup.jsx";
import ChatIcon from "@mui/icons-material/Chat";
import ChatWindow from "../components/chatWindow.jsx";
import LiveRouteMap from "../components/LiveRouteMap.jsx";
import { useChat } from "../context/ChatContext";
import socket from "../socket";

// Fix Leaflet marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const CustomerOrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [partnerPosition, setPartnerPosition] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [openChat, setOpenChat] = useState(false);

  const [confirming, setConfirming] = useState(false);
  const [reloading, setReloading] = useState(false);
  const navigate = useNavigate();

  // user joins the chat room
  const { joinChat, unreadByOrder } = useChat();
  useEffect(() => {
    joinChat(orderId);
  }, [orderId]);

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

  // Fetch order details (reusable)
  const fetchOrderDetails = useCallback(async () => {
    try {
      if (!reloading) setLoading(true);
      const res = await axios.get(
        // `http://localhost:8000/api/v1/order/getSingleOrderById/${orderId}`,
        `https://quick-oh.onrender.com/api/v1/order/getSingleOrderById/${orderId}`,
        { withCredentials: true }
      );
      setOrder(res.data.data);

      const currRes = await axios.get(
        // "http://localhost:8000/api/v1/users/current-user",
        "https://quick-oh.onrender.com/api/v1/users/current-user",
        { withCredentials: true }
      );
      if (
        currRes.data.data.role === "customer" &&
        res.data.data.status === "Delivered"
      ) {
        setShowThankYou(true);

        // Auto close after 5 seconds and navigate
        setTimeout(() => {
          setShowThankYou(false);
          navigate("/shop");
        }, 5000);
      }
    } catch (err) {
      console.error("Failed to fetch order:", err);
    } finally {
      setLoading(false);
      setReloading(false);
    }
  }, [orderId, navigate, reloading]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Socket tracking
  useEffect(() => {
    if (!order || !currentUser) return;

    socket.emit("joinOrderRoom", { orderId });

    socket.on("partner-location-update", ({ latitude, longitude }) => {
      console.log("📡 Partner location received:", latitude, longitude);
      setPartnerPosition([latitude, longitude]);
    });

    socket.on("order-updated", (updatedOrder) => {
      if (updatedOrder._id === order._id) {
        setOrder(updatedOrder);
        if (updatedOrder.status === "Delivered") {
          if (currentUser._id === updatedOrder.assignedTo) {
            navigate("/active-orders");
          } else {
            navigate("/shop");
          }
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, order, currentUser, navigate]);

  const handleConfirmDelivery = async () => {
    try {
      setConfirming(true);
      const res = await axios.post(
        // `http://localhost:8000/api/v1/order/updateOrderStatus/${orderId}`,
        `https://quick-oh.onrender.com/api/v1/order/updateOrderStatus/${orderId}`,
        { status: "Delivered" },
        { withCredentials: true }
      );
      alert("✅ Delivery confirmed successfully!");
      setOrder((prev) => ({ ...prev, status: "Delivered" }));
      socketRef.current.emit("order-delivered", res.data.data);
      if (currentUser && order.assignedTo === currentUser._id) {
        navigate("/active-orders");
      }
    } catch (err) {
      console.error("Failed to confirm delivery:", err);
      alert("❌ Failed to confirm delivery");
    } finally {
      setConfirming(false);
    }
  };

  // 🔄 Reload handler (refresh order details without page reload)
  const handleReload = async () => {
    setReloading(true);
    await fetchOrderDetails();
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
      <Typography variant="h6" textAlign="center" mt={4}>
        Order not found.
      </Typography>
    );

  const { latitude, longitude, address } = order.shippingAddress;
  const customerPosition = [latitude, longitude];

  const isDeliveryPartner =
    currentUser &&
    (order.assignedTo === currentUser._id ||
      order.assignedTo?._id === currentUser._id);

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <Typography variant="h4" fontWeight="bold" color="primary">
          Live Delivery Tracking
        </Typography>
        <Tooltip title="Reload Delivery Details">
          <IconButton
            onClick={handleReload}
            color="primary"
            disabled={reloading}
            sx={{
              transition: "transform 0.2s",
              "&:hover": { transform: "rotate(90deg)" },
            }}
          >
            {reloading ? (
              <CircularProgress size={20} color="primary" />
            ) : (
              <RefreshIcon />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: 3,
          width: "100%",
        }}
      >
        <Box
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 3,
            width: "100%",
          }}
        >
          <LiveRouteMap
            customerPosition={customerPosition}
            partnerPosition={partnerPosition}
          />
        </Box>
      </Box>

      <Card sx={{ width: "100%", borderRadius: 3, boxShadow: 4, p: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Order #{order._id}
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Typography>
            <strong>Customer:</strong> {order.user?.name} ({order.user?.email})
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
            <strong>Total Amount:</strong> ₹{order.totalAmount}
          </Typography>
          <Typography sx={{ mt: 1 }}>
            <strong>Shipping Address:</strong> {address}
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

          {isDeliveryPartner && order.status !== "Delivered" && (
            <Box textAlign="center" mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleConfirmDelivery}
                disabled={confirming}
                sx={{
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                {confirming ? "Confirming..." : "Confirm Delivery"}
              </Button>
            </Box>
          )}

          {order.status === "Delivered" && (
            <Box
              mt={3}
              p={2}
              sx={{
                backgroundColor: "rgba(46,125,50,0.1)",
                borderLeft: "4px solid #2e7d32",
                borderRadius: 2,
              }}
            >
              <Typography color="success.main" fontWeight="bold">
                ✅ Order has been delivered successfully!
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
      <ThankYouPopup
        open={showThankYou}
        onClose={() => setShowThankYou(false)}
      />

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

export default CustomerOrderDetails;
