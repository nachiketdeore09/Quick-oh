import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const socket = io("https://quick-oh.onrender.com", {
  withCredentials: true,
});

const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center]);
  return null;
};

const LiveLocationTracker = ({ orderId, partnerId, onLocationUpdate }) => {
  const [deliveryPosition, setDeliveryPosition] = useState(null);
  const markerRef = useRef(null);

  useEffect(() => {
    console.log(partnerId);
    if (!partnerId) {
      alert("No user ID passed");
      return;
    }

    // socket.emit("joinRoom", { userId });
    socket.emit("joinOrderRoom", { orderId });

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log("🛵 Emitting location:", latitude, longitude);
        // setDeliveryPosition([latitude, longitude]);

        onLocationUpdate([latitude, longitude]);
        socket.emit("partner-location-update", { latitude, longitude });
        socket.emit("updateLocation", {
          orderId,
          latitude,
          longitude,
        });
      },
      (err) => {
        console.error("Error getting location:", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [orderId, onLocationUpdate]);

  return null;
};

export default LiveLocationTracker;
