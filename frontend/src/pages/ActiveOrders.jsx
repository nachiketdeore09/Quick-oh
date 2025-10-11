import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ActiveOrders.module.css";
import { useSocket } from "../context/SocketContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const ActiveOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const navigate = useNavigate();

  const fetchActiveOrders = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/order/getActiveOrders",
        {
          withCredentials: true,
        }
      );
      console.log(res.data);
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

    socket.on("newOrder", (data) => {
      toast.success("📦 New order Acive!");
      fetchActiveOrders();
    });

    return () => {
      socket.off("newOrder");
    };
  }, [socket]);

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  //handle the delivery assignment
  const handleAcceptOrder = async (orderId) => {
    const confirmAccept = window.confirm(
      "Do you want to accept this delivery?"
    );
    if (!confirmAccept) return;

    try {
      const res = await axios.put(
        `http://localhost:8000/api/v1/order/acceptListedOrder/${orderId}`,
        {}, // empty body
        { withCredentials: true }
      );
      toast.success("✅ Order accepted!");
      fetchActiveOrders(); // refresh list
      navigate(`/delivery-details/${orderId}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to accept order.");
    }
  };

  if (loading) return <div className={styles.loading}>Loading orders...</div>;

  return (
    <div className={styles.container}>
      <h2>Active Orders</h2>
      {orders.length === 0 ? (
        <p>No active orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className={styles.orderCard}>
            <h3>Order #{order._id}</h3>
            <p>
              <strong>Status:</strong> {order.status}
            </p>
            <p>
              <strong>Total:</strong> ₹{order.totalAmount.toFixed(2)}
            </p>
            <p>
              <strong>Payment:</strong> {order.paymentStatus}
            </p>
            <p>
              <strong>Shipping Address:</strong> {order.shippingAddress.address}
            </p>
            <p>
              <strong>User:</strong> {order.user?.name} ({order.user?.email})
            </p>
            <div className={styles.itemList}>
              <strong>Items:</strong>
              <ul>
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.product?.productName} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
            {order.status === "Pending" && (
              <button
                className={styles.acceptBtn}
                onClick={() => handleAcceptOrder(order._id)}
              >
                Accept Delivery
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ActiveOrders;
