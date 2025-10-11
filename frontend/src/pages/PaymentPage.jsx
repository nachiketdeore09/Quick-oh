import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import React from "react";
import axios from "axios";

const PaymentPage = () => {
  const [qrLink, setQrLink] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { amount, orderId } = location.state || {};

  useEffect(() => {
    if (!amount) {
      alert("Amount not found!");
      navigate("/shop"); // redirect if no amount
    }
  }, [amount]);

  const handleQrPayment = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/payment/create-payment-link",
        {
          amount,
          customerName: "Test User",
          customerEmail: "test@example.com",
          customerContact: "9876543210",
        }
      );

      const paymentUrl = res.data.short_url;
      window.open(paymentUrl, "_blank");

      // 👇 Optional: Polling or redirect can be added here after QR is paid
    } catch (error) {
      console.error("QR Payment Error:", error);
    }
  };

  const handlePayment = async () => {
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
        name: "Your App",
        description: "Test Transaction",
        order_id: razorOrderId,
        handler: function (response) {
          alert("Payment Successful!");
          console.log(response);

          //update payment status
          axios.post("http://localhost:8000/api/v1/payment/mark-paid", {
            orderId: orderId,
          });

          // ✅ Redirect to Delivery Details page with original orderId
          navigate(`/delivery-details/${orderId}`);
        },
        prefill: {
          name: "Test User",
          email: "test@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initiation failed:", err);
    }
  };

  return (
    <div>
      <h2>Make Payment</h2>
      <button onClick={handlePayment}>Pay via Razorpay</button>
      <button onClick={handleQrPayment}>Pay via QR (₹{amount})</button>
    </div>
  );
};

export default PaymentPage;
