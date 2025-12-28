import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Grid,
  Divider,
  List,
  ListItem,
  Paper,
} from "@mui/material";
import { toast } from "react-toastify";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const ActiveOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const navigate = useNavigate();

  const fetchActiveOrders = async () => {
    try {
      const res = await axios.get(
        // "http://localhost:8000/api/v1/order/getActiveOrders",
        "https://quick-oh.onrender.com/api/v1/order/getActiveOrders",
        { withCredentials: true }
      );

      setOrders(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch active orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();

    if (!socket) return;
    socket.on("newOrder", () => {
      toast.success("📦 New order added!");
      fetchActiveOrders();
    });

    return () => {
      socket.off("newOrder");
    };
  }, [socket]);

  const handleAcceptOrder = async (orderId) => {
    const confirmAccept = window.confirm(
      "Do you want to accept this delivery?"
    );
    if (!confirmAccept) return;

    try {
      await axios.put(
        // `http://localhost:8000/api/v1/order/acceptListedOrder/${orderId}`,
        `https://quick-oh.onrender.com/api/v1/order/acceptListedOrder/${orderId}`,
        {},
        { withCredentials: true }
      );
      toast.success("✅ Order accepted!");
      fetchActiveOrders();
      navigate(`/deliveryPartner-delivery-details/${orderId}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to accept order.");
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f9fafb, #d2ecef)",
        padding: "2rem",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        fontWeight="bold"
        sx={{
          textAlign: "center",
          background: "linear-gradient(90deg, #007cf0, #00dfd8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 4,
        }}
      >
        Active Orders
      </Typography>

      {orders.length === 0 ? (
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: "center",
            width: "50%",
            mx: "auto",
            borderRadius: 3,
            background: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No active orders found.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {orders.map((order) => (
            <Grid item xs={12} sm={6} md={4} key={order._id}>
              <Card
                elevation={4}
                sx={{
                  borderRadius: "16px",
                  background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    background: "linear-gradient(135deg, #f9fafb, #d2ecef)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                    Order #{order._id.slice(-6).toUpperCase()}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Typography>
                    <strong>Status:</strong> {order.status}
                  </Typography>
                  <Typography>
                    <strong>Total:</strong> ₹{order.totalAmount.toFixed(2)}
                  </Typography>
                  <Typography>
                    <strong>Payment:</strong> {order.paymentStatus}
                  </Typography>
                  <Typography>
                    <strong>Shipping:</strong> {order.shippingAddress.address}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>
                    <strong>User:</strong> {order.user?.name} (
                    {order.user?.email})
                  </Typography>

                  <Typography sx={{ mt: 2, fontWeight: "bold" }}>
                    Items:
                  </Typography>
                  <List dense>
                    {order.items.map((item, idx) => (
                      <ListItem
                        key={idx}
                        sx={{
                          py: 0,
                          px: 1,
                          fontSize: "0.9rem",
                          color: "#555",
                        }}
                      >
                        • {item.product?.productName} × {item.quantity}
                      </ListItem>
                    ))}
                  </List>
                </CardContent>

                {order.status === "Pending" && (
                  <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleAcceptOrder(order._id)}
                      sx={{
                        textTransform: "none",
                        px: 3,
                        py: 1,
                        borderRadius: "8px",
                        fontWeight: 600,
                      }}
                    >
                      Accept Delivery
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ActiveOrders;
