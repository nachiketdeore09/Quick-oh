import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./DeliveryDetails.module.css";
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
import { useNavigate } from "react-router-dom";

// Fix Leaflet marker icon issue
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
  const [confirming, setConfirming] = useState(false);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/users/current-user",
          {
            withCredentials: true,
          }
        );
        console.log(res.data.data);
        setCurrentUser(res.data.data);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };

    fetchUser();
  }, []);

  //Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/order/getSingleOrderById/${orderId}`,
          { withCredentials: true }
        );
        setOrder(res.data.data);

        const currRes = await axios.get(
          "http://localhost:8000/api/v1/users/current-user",
          {
            withCredentials: true,
          }
        );
        if (
          currRes.data.data.role === "customer" &&
          res.data.data.status === "Delivered"
        ) {
          console.log("here too");
          navigate("/shop");
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Setup socket tracking after order is fetched
  useEffect(() => {
    if (!order || !currentUser) return;

    const assignedTo = order.assignedTo;
    socketRef.current = io("http://localhost:8000", {
      withCredentials: true,
    });

    // Join personal room (delivery partner or customer)
    socketRef.current.emit("joinRoom", { userId: currentUser._id });

    // Listen for delivery partner location updates
    socketRef.current.on(
      `location-update-${assignedTo}`,
      ({ latitude, longitude }) => {
        setPartnerPosition([latitude, longitude]);
      }
    );

    // Listen for order status updates
    socketRef.current.on("order-updated", (updatedOrder) => {
      if (updatedOrder._id === order._id) {
        setOrder(updatedOrder);
        console.log(updatedOrder.status);
        // Navigate based on role
        if (updatedOrder.status === "Delivered") {
          if (currentUser._id === updatedOrder.assignedTo) {
            navigate("/active-orders"); // delivery partner
          } else {
            navigate("/shop"); // customer
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

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!order) return <div className={styles.error}>Order not found.</div>;

  const { latitude, longitude, address } = order.shippingAddress;
  const customerPosition = [latitude, longitude];

  const isDeliveryPartner =
    currentUser &&
    (order.assignedTo === currentUser._id ||
      order.assignedTo?._id === currentUser._id);

  return (
    <div className={styles.container}>
      {/* Live tracker */}
      <LiveLocationTracker userId={order.assignedTo} />

      <h2>Live Delivery Tracking</h2>

      <MapContainer
        center={customerPosition}
        zoom={14}
        style={{ height: "400px", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Customer Marker */}
        <Marker position={customerPosition}>
          <Popup>
            Customer Location
            <br />
            {address}
          </Popup>
        </Marker>

        {/* Delivery Partner Marker */}
        {partnerPosition && (
          <Marker position={partnerPosition}>
            <Popup>Delivery Partner</Popup>
          </Marker>
        )}

        {/* Polyline Route */}
        {partnerPosition && (
          <Polyline
            positions={[partnerPosition, customerPosition]}
            color="blue"
          />
        )}
      </MapContainer>

      <div className={styles.details}>
        <h3>Order #{order._id}</h3>
        <p>
          <strong>Customer:</strong> {order.user?.name} ({order.user?.email})
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Payment:</strong> {order.paymentStatus}
        </p>
        <p>
          <strong>Total Amount:</strong> ₹{order.totalAmount}
        </p>
        <p>
          <strong>Shipping Address:</strong> {address}
        </p>

        <h4>Items</h4>
        <ul>
          {order.items.map((item, idx) => (
            <li key={idx}>
              {item.product?.productName} × {item.quantity}
            </li>
          ))}
        </ul>

        {/* Show button only for assigned delivery partner */}
        {isDeliveryPartner && (
          <button
            className={styles.confirmButton}
            onClick={handleConfirmDelivery}
            disabled={confirming}
          >
            {confirming ? "Confirming..." : "Confirm Delivery"}
          </button>
        )}
      </div>
    </div>
  );
};

export default DeliveryDetails;
