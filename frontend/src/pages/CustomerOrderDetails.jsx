import React, { useEffect, useState, useCallback } from "react";
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
  Paper,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ThankYouPopup from "../components/ThankyouPopup.jsx";
import ChatIcon from "@mui/icons-material/Chat";
import ChatWindow from "../components/chatWindow.jsx";
import LiveRouteMap from "../components/LiveRouteMap.jsx";
import { useChat } from "../context/ChatContext";
import { useUser } from "../context/UserContext.jsx";
import { useCart } from "../context/CartContext.jsx";
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
  const { role } = useUser();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [partnerPosition, setPartnerPosition] = useState(null);
  const [partnerId, setPartnerId] = useState(null);
  const [partner, setPartner] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const { clearCart } = useCart();
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
      if (res.data.data.assignedTo) {
        setPartnerId(res.data.data.assignedTo);
      }
      if (role === "customer" && res.data.data.status === "Delivered") {
        setShowThankYou(true);
        clearCart();
        // Auto close after 5 seconds and navigate
        setTimeout(() => {
          setShowThankYou(false);
          navigate("/shop");
        }, 3000);
      }
    } catch (err) {
      console.error("Failed to fetch order:", err);
    } finally {
      setLoading(false);
      setReloading(false);
    }
  }, [orderId, navigate, reloading]);

  useEffect(() => {
    if (!partnerId) return;

    const fetchPartner = async () => {
      try {
        const res = await axios.get(
          "https://quick-oh.onrender.com/api/v1/users/getUserById",
          {
            params: { userId: partnerId },
            withCredentials: true,
          }
        );
        console.log(res);
        setPartner(res.data.data);
      } catch (error) {
        console.error("Failed to fetch delivery partner", error);
      }
    };

    fetchPartner();
  }, [partnerId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  //fetching last known location from redis
  useEffect(() => {
    const fetchLastLocation = async () => {
      try {
        const res = await axios.get(
          // `http://localhost:8000/api/v1/order/livePartnerLocation/${orderId}`,
          `https://quick-oh.onrender.com/api/v1/order/livePartnerLocation/${orderId}`,
          { withCredentials: true }
        );
        console.log(res);
        if (res.data?.data?.latitude && res.data?.data?.longitude) {
          setPartnerPosition([res.data.data.latitude, res.data.data.longitude]);
        }
      } catch (err) {
        console.log(err);
        console.log("No last known delivery location yet");
      }
    };

    fetchLastLocation();
  }, [orderId]);

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
      socket.off("partner-location-update");
      socket.off("order-updated");
    };
  }, [orderId, order, currentUser, navigate]);

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
    <Box sx={{ width: "100%", bgcolor: "#f7f7f7", pb: 8 }}>
      {/*-------- Title -----------*/}
      <Box
        sx={{
          px: 3,
          py: 2,
          bgcolor: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography fontWeight={700}>Track Order</Typography>
            <Typography fontSize={13} color="#777">
              Order #{order._id.slice(-6)}
            </Typography>
          </Box>
          {/*-------- Reload Button -----------*/}
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

        <Box textAlign="right">
          <Typography fontSize={13} color="#7cb518">
            Arriving in
          </Typography>
          <Typography fontWeight={800} fontSize={18}>
            8 mins
          </Typography>
        </Box>
      </Box>

      {/*-------- Map -----------*/}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          height: "420px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "90%",
            height: "420px",
          }}
        >
          <LiveRouteMap
            customerPosition={customerPosition}
            partnerPosition={partnerPosition}
          />
        </Box>
      </Box>
      {/*-------- Delivery partner Card -----------*/}
      {partnerPosition ? (
        <Box sx={{ px: 3, mt: 3 }}>
          <Paper sx={{ p: 2, borderRadius: "16px" }}>
            <Typography fontWeight={700}>Delivery Partner</Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1,
              }}
            >
              <Typography>{partner?.name}• ⭐ 4.8</Typography>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button variant="outlined">Call</Button>
                <Button
                  variant="contained"
                  sx={{ bgcolor: "#a3e635", color: "#1a1a1a" }}
                >
                  Chat
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      ) : null}
      {/*-------- order details -----------*/}
      <Box sx={{ px: 3, mt: 3 }}>
        <Paper sx={{ p: 2, borderRadius: "16px" }}>
          <Typography fontWeight={700} mb={1}>
            Order Details
          </Typography>

          {order.items.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1,
                borderBottom: "1px solid #eee",
              }}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                <img
                  src={item.product.productImage}
                  alt=""
                  style={{ width: 50, height: 50, borderRadius: 10 }}
                />
                <Box>
                  <Typography fontWeight={600}>
                    {item.product.productName}
                  </Typography>
                  <Typography fontSize={13} color="#777">
                    × {item.quantity}
                  </Typography>
                </Box>
              </Box>

              <Typography fontWeight={700}>
                ₹{item.product.price * item.quantity}
              </Typography>
            </Box>
          ))}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Typography fontWeight={700}>Total</Typography>
            <Typography fontWeight={800}>₹{order.totalAmount}</Typography>
          </Box>
        </Paper>
      </Box>
      {/*-------- delivery address -----------*/}
      <Box sx={{ px: 3, mt: 3 }}>
        <Paper sx={{ p: 2, borderRadius: "16px" }}>
          <Typography fontWeight={700}>Delivery Address</Typography>
          <Typography sx={{ mt: 1, color: "#555" }}>
            {order.shippingAddress.address}
          </Typography>
        </Paper>
      </Box>

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
