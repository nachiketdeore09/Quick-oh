import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import OSMLocationPickerModal from "./Modals/OSMLocationPickerModal";
import PaymentModal from "./Modals/PaymentModal";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tooltip,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const FloatingCart = () => {
  const { cartItems, addToCart, removeOneItem, removeFromCart } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  const totalPrice = cartItems.reduce(
    (acc, item) =>
      acc + (item.price - (item.price * item.discount) / 100) * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (!shippingAddress || !shippingAddress.address.trim()) {
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

      setShowCart(false);
      setSelectedOrder({
        amount: Math.round(totalPrice),
        orderId: res.data.data._id,
      });
      setShowPaymentModal(true);
      alert("Order placed successfully!");
    } catch (error) {
      console.error("Order placement failed:", error);
      alert("Failed to place order");
    }
  };

  return (
    <>
      {/* Floating Cart Icon */}
      {cartItems.length > 0 && (
        <Tooltip title="View Cart">
          <Box
            onClick={() => setShowCart(true)}
            sx={{
              position: "fixed",
              bottom: 25,
              right: 30,
              backgroundColor: "#1976d2",
              color: "white",
              borderRadius: "50%",
              width: 60,
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: 3,
              zIndex: 1200,
              transition: "transform 0.2s ease-in-out",
              "&:hover": { transform: "scale(1.1)" },
            }}
          >
            <ShoppingCartIcon fontSize="large" />
            <Box
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: "white",
                color: "#1976d2",
                fontSize: "0.8rem",
                borderRadius: "50%",
                width: 22,
                height: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                boxShadow: 1,
              }}
            >
              {cartItems.length}
            </Box>
          </Box>
        </Tooltip>
      )}

      {/* Cart Popup */}
      {showCart && (
        <Paper
          elevation={5}
          sx={{
            position: "fixed",
            bottom: 90,
            right: 25,
            width: 380,
            backgroundColor: "#f9f9f9",
            borderRadius: 3,
            p: 3,
            zIndex: 1300,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ color: "#1976d2", fontWeight: 600 }}>
              Your Cart
            </Typography>
            <IconButton size="small" onClick={() => setShowCart(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <List>
            {cartItems.map((item) => (
              <ListItem
                key={item._id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: "#fff",
                  boxShadow: 1,
                }}
              >
                <ListItemText
                  primary={item.productName}
                  secondary={`₹${(
                    item.price -
                    (item.price * item.discount) / 100
                  ).toFixed(2)} × ${item.quantity}`}
                  sx={{ color: "#333" }}
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => removeOneItem(item)}
                    sx={{ color: "#1976d2" }}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography>{item.quantity}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => addToCart(item)}
                    sx={{ color: "#1976d2" }}
                  >
                    <AddIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => removeFromCart(item._id)}
                    sx={{ color: "red" }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ mt: 2, mb: 2 }} />

          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "#1976d2", mb: 2 }}
          >
            Total: ₹{totalPrice.toFixed(2)}
          </Typography>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => setShowLocationModal(true)}
            sx={{
              borderColor: "#1976d2",
              color: "#1976d2",
              mb: 2,
              "&:hover": { backgroundColor: "#1976d2", color: "white" },
            }}
          >
            Select Delivery Location
          </Button>

          {showLocationModal && (
            <OSMLocationPickerModal
              onClose={() => setShowLocationModal(false)}
              onSelect={({ address, latitude, longitude }) => {
                setShippingAddress({ address, latitude, longitude });
                setShowLocationModal(false);
              }}
            />
          )}

          {shippingAddress?.address && (
            <Typography
              variant="body2"
              sx={{
                mb: 2,
                backgroundColor: "#e3f2fd",
                p: 1,
                borderRadius: 1,
                color: "#1976d2",
              }}
            >
              📍 {shippingAddress.address}
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={!shippingAddress.address}
            onClick={handlePlaceOrder}
            sx={{
              fontWeight: "bold",
              mb: 1,
            }}
          >
            Place Order
          </Button>

          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={() => setShowCart(false)}
          >
            Close
          </Button>
        </Paper>
      )}

      {/* payment pop-up */}
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
    </>
  );
};

export default FloatingCart;
