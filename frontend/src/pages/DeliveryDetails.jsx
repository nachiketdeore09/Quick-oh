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
import io from "socket.io-client";
import LiveLocationTracker from "../components/LiveLocationTracker";
import ThankYouPopup from "../components/ThankyouPopup.jsx";

// Fix Leaflet marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DeliveryDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [partnerPosition, setPartnerPosition] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);

  const [confirming, setConfirming] = useState(false);
  const [reloading, setReloading] = useState(false);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/users/current-user",
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
        `http://localhost:8000/api/v1/order/getSingleOrderById/${orderId}`,
        { withCredentials: true }
      );
      setOrder(res.data.data);

      const currRes = await axios.get(
        "http://localhost:8000/api/v1/users/current-user",
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

    const assignedTo = order.assignedTo;
    socketRef.current = io("http://localhost:8000", {
      withCredentials: true,
    });

    socketRef.current.emit("joinRoom", { userId: currentUser._id });

    socketRef.current.on(
      `location-update-${assignedTo}`,
      ({ latitude, longitude }) => {
        setPartnerPosition([latitude, longitude]);
      }
    );

    socketRef.current.on("order-updated", (updatedOrder) => {
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
      socketRef.current?.disconnect();
    };
  }, [order, currentUser, navigate]);

  const handleConfirmDelivery = async () => {
    try {
      setConfirming(true);
      const res = await axios.post(
        `http://localhost:8000/api/v1/order/updateOrderStatus/${orderId}`,
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
      <LiveLocationTracker userId={order.assignedTo} />

      {/* Header with Reload button */}
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
        <MapContainer
          center={customerPosition}
          zoom={14}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={customerPosition}>
            <Popup>
              Customer Location
              <br />
              {address}
            </Popup>
          </Marker>
          {partnerPosition && (
            <>
              <Marker position={partnerPosition}>
                <Popup>Delivery Partner</Popup>
              </Marker>
              <Polyline
                positions={[partnerPosition, customerPosition]}
                color="blue"
              />
            </>
          )}
        </MapContainer>
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
    </Box>
  );
};

export default DeliveryDetails;
