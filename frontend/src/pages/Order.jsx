import { useLocation } from "react-router-dom";
import styles from "./Order.module.css";
import { useCart } from "../context/CartContext.jsx";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const location = useLocation();
  const newOrder = location.state?.newOrder;
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { cartItems } = useCart();
  const navigate = useNavigate();
  // console.log(cartItems);

  // fetch the order
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(
          // `http://localhost:8000/api/v1/order/getSingleOrderById/${newOrder._id}`,
          `https://quick-oh.onrender.com/api/v1/order/getSingleOrderById/${newOrder._id}`,
          { withCredentials: true }
        );
        setOrder(res.data.data);
        console.log(order.shippingAddress.address);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // for handling the cancel order
  const handleCancelOrder = async () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );
    if (!confirmCancel) return;

    try {
      const res = await axios.put(
        // `http://localhost:8000/api/v1/order/cancelOrder/${order._id}`,
        `https://quick-oh.onrender.com/api/v1/order/cancelOrder/${order._id}`,
        {},
        { withCredentials: true }
      );
      alert("Order cancelled successfully!");
      setOrder((prev) => ({ ...prev, status: "Cancelled" }));
      navigate("/shop");
    } catch (error) {
      alert(error?.response?.data?.message);
    }
  };

  if (loading) return <div className={styles.ordersPage}>Loading...</div>;
  if (!order) return <div className={styles.ordersPage}>Order not found.</div>;

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={styles.ordersPage}>
      <h2>Order Details</h2>
      <div className={styles.orderCard}>
        <h3>Order ID: {order._id}</h3>
        <p>
          <strong>User:</strong> {order.user?.name} ({order.user?.email})
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Payment Status:</strong> {order.paymentStatus}
        </p>
        <p>
          <strong>Total Items:</strong> {totalItems}
        </p>
        <p>
          <strong>Total Amount:</strong> ₹{order.totalAmount}
        </p>
        <p>
          <strong>Shipping Address:</strong> {order.shippingAddress.address} (
          Lat: {order.shippingAddress.latitude}, Lon:{" "}
          {order.shippingAddress.longitude})
        </p>

        <h4>Items:</h4>
        <ul>
          {order.items.map((item, index) => (
            <li key={index}>
              {item.product?.productName} (x{item.quantity}) - ₹
              {(item.product.price -
                (item.product.price * item.product.discount) / 100) *
                item.quantity}
            </li>
          ))}
        </ul>
        {/* cancel order*/}
        {order?.status === "Pending" && (
          <button className={styles.cancelOrderBtn} onClick={handleCancelOrder}>
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
};

export default Orders;
