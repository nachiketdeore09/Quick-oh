import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OSMLocationPickerModal from "../components/Modals/OSMLocationPickerModal";
import PaymentModal from "../components/Modals/PaymentModal";

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, addToCart, removeOneItem, removeFromCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0);
  const itemTotal = cartItems.reduce(
    (s, i) => s + (i.price - (i.price * i.discount) / 100) * i.quantity,
    0
  );

  const deliveryFee = itemTotal >= 199 ? 0 : 25;
  const grandTotal = itemTotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!shippingAddress || !shippingAddress.address?.trim()) {
      alert("Please select a delivery location");
      return;
    }

    try {
      const res = await axios.post(
        // "http://localhost:8000/api/v1/order/createOrder",
        "https://quick-oh.onrender.com/api/v1/order/createOrder",
        {
          address: shippingAddress.address,
          latitude: shippingAddress.latitude,
          longitude: shippingAddress.longitude,
        },
        { withCredentials: true }
      );

      setSelectedOrder({
        amount: Math.round(grandTotal),
        orderId: res.data.data._id,
      });

      setShowPaymentModal(true);
    } catch (error) {
      console.error("Order placement failed:", error);
      alert("Failed to place order");
    }
  };

  /* ---------------- EMPTY CART ---------------- */
  if (totalItems === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
          Your cart is empty
        </Typography>
        <Typography sx={{ color: "#777", mb: 3 }}>
          Looks like you haven't added anything yet
        </Typography>

        <Button
          variant="contained"
          sx={{
            backgroundColor: "#a3e635",
            color: "#1a1a1a",
            fontWeight: 700,
            borderRadius: "12px",
            px: 4,
          }}
          onClick={() => navigate("/shop")}
        >
          Start Shopping
        </Button>
      </Box>
    );
  }

  /* ---------------- CART WITH ITEMS ---------------- */
  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Your Cart
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#777" }}>
            {totalItems} item{totalItems > 1 ? "s" : ""}
          </Typography>
        </Box>
      </Box>

      {/* Delivery Banner */}
      <Paper
        sx={{
          mb: 3,
          p: 2,
          backgroundColor: "#f5fbe8",
          borderRadius: "14px",
        }}
      >
        <Typography fontWeight={700} color="#7cb518">
          Delivery in 10–15 minutes
        </Typography>
        <Typography fontSize={14} color="#555">
          Express delivery available
        </Typography>
      </Paper>

      {/* Items */}
      {cartItems.map((item) => (
        <Paper
          key={item._id}
          sx={{
            mb: 2,
            p: 2,
            borderRadius: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <img
              src={item.productImage}
              alt={item.productName}
              style={{
                width: 60,
                height: 60,
                borderRadius: 12,
                objectFit: "cover",
              }}
            />
            <Box>
              <Typography fontWeight={600}>{item.productName}</Typography>
              <Typography fontSize={14}>₹{item.price}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={() => removeOneItem(item)}>
              <RemoveIcon />
            </IconButton>

            <Typography fontWeight={700}>{item.quantity}</Typography>

            <IconButton onClick={() => addToCart(item)}>
              <AddIcon />
            </IconButton>

            <IconButton color="error" onClick={() => removeFromCart(item._id)}>
              <DeleteOutlineIcon />
            </IconButton>
          </Box>
        </Paper>
      ))}

      {/* Bill Details */}
      <Paper sx={{ p: 2, borderRadius: "14px", mt: 3 }}>
        <Typography fontWeight={700} mb={1}>
          Bill Details
        </Typography>

        <Row label="Item Total" value={`₹${itemTotal}`} />
        <Row label="Delivery Fee" value={`₹${deliveryFee}`} />

        {deliveryFee > 0 && (
          <Typography fontSize={13} color="#777">
            Add ₹{199 - itemTotal} more for free delivery
          </Typography>
        )}

        <Divider sx={{ my: 1 }} />

        <Row label="Grand Total" value={`₹${grandTotal}`} bold />
      </Paper>

      {/* Delivery Address */}
      <Button
        variant="outlined"
        fullWidth
        sx={{
          mt: 3,
          borderRadius: "12px",
          borderColor: "#1976d2",
          color: "#1976d2",
          fontWeight: 600,
        }}
        onClick={() => setShowLocationModal(true)}
      >
        Select Delivery Location
      </Button>

      {shippingAddress?.address && (
        <Typography
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: "10px",
            backgroundColor: "#e3f2fd",
            color: "#1976d2",
            fontSize: 14,
          }}
        >
          📍 {shippingAddress.address}
        </Typography>
      )}

      {/* Place Order */}
      <Button
        fullWidth
        disabled={!shippingAddress?.address}
        onClick={handlePlaceOrder}
        sx={{
          mt: 3,
          py: 1.5,
          borderRadius: "14px",
          backgroundColor: "#a3e635",
          color: "#1a1a1a",
          fontWeight: 800,
          fontSize: 16,
          "&:disabled": {
            backgroundColor: "#d1d5db",
            color: "#6b7280",
          },
        }}
      >
        Place Order
      </Button>
      {/* Location Picker */}
      {showLocationModal && (
        <OSMLocationPickerModal
          onClose={() => setShowLocationModal(false)}
          onSelect={({ address, latitude, longitude }) => {
            setShippingAddress({ address, latitude, longitude });
            setShowLocationModal(false);
          }}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedOrder && (
        <PaymentModal
          amount={selectedOrder.amount}
          orderId={selectedOrder.orderId}
          onClose={() => {
            setShowPaymentModal(false);
            navigate("/shop");
          }}
          onSuccess={() => {
            setShowPaymentModal(false);
            navigate(`/customer-delivery-details/${selectedOrder.orderId}`);
          }}
          onFailure={() => {
            setShowPaymentModal(false);
            navigate("/shop");
          }}
        />
      )}
    </Box>
  );
};

const Row = ({ label, value, bold }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
    <Typography fontWeight={bold ? 700 : 500}>{label}</Typography>
    <Typography fontWeight={bold ? 700 : 500}>{value}</Typography>
  </Box>
);

export default CartPage;
