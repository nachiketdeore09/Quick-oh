import React, { useState } from "react";
import axios from "axios";
import { Box, Button, Typography, CircularProgress } from "@mui/material";

const PaymentModal = ({ amount, orderId, onClose, onSuccess, onFailure }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/payment/create-order",
        { amount }
      );
      const { orderId: razorOrderId, key, amount: amt, currency } = res.data;

      const options = {
        key,
        amount: amt,
        currency,
        name: "Quick-Oh.",
        description: "Order Payment",
        order_id: razorOrderId,
        handler: async function (response) {
          alert("✅ Payment Successful!");
          await axios.post("http://localhost:8000/api/v1/payment/mark-paid", {
            orderId,
          });
          onSuccess();
        },
        prefill: {
          name: "Test User",
          email: "test@example.com",
          contact: "9999999999",
        },
        theme: { color: "#1976d2" },
        modal: {
          ondismiss: () => {
            alert("❌ Payment cancelled.");
            onFailure();
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initiation failed:", err);
      onFailure();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1300,
      }}
    >
      <Box
        sx={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "400px",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 2, color: "#1976d2", fontWeight: 600 }}
        >
          Complete Your Payment
        </Typography>
        <Typography sx={{ mb: 3 }}>Amount: ₹{amount}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePayment}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : "Pay with Razorpay"}
        </Button>
        <Button variant="outlined" color="error" onClick={onClose}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentModal;
