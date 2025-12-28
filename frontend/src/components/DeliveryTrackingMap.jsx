import { useEffect, useState } from "react";
import io from "socket.io-client";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";

const socket = io("https://quick-oh.onrender.com");

const DeliveryTrackingMap = ({ destination }) => {
  const [partnerLocation, setPartnerLocation] = useState(null);

  useEffect(() => {
    socket.on("partnerLocationUpdate", ({ latitude, longitude }) => {
      setPartnerLocation([latitude, longitude]);
    });

    return () => socket.off("partnerLocationUpdate");
  }, []);

  return (
    <MapContainer center={destination} zoom={13} style={{ height: "400px" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {partnerLocation && <Marker position={partnerLocation} />}
      {destination && <Marker position={destination} />}
      {partnerLocation && destination && (
        <Polyline positions={[partnerLocation, destination]} color="blue" />
      )}
    </MapContainer>
  );
};

export default DeliveryTrackingMap;
