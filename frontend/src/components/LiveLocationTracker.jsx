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

const socket = io("http://localhost:8000", {
  withCredentials: true,
});

const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center]);
  return null;
};

const LiveLocationTracker = ({ userId, customerLocation }) => {
  const [deliveryPosition, setDeliveryPosition] = useState(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      alert("No user ID passed");
      return;
    }

    socket.emit("joinRoom", { userId });

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setDeliveryPosition([latitude, longitude]);

        socket.emit("updateLocation", {
          userId,
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
  }, []);

  const defaultCenter = deliveryPosition || customerLocation;

  return null;
};

export default LiveLocationTracker;
