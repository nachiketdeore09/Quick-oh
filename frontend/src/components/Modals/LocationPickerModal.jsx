// components/LocationPickerModal.jsx
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import axios from "axios";
import styles from "./LocationPickerModal.module.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationPickerModal({ onClose, onSelect }) {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        console.log("lat: ", lat);
        console.log("lng: ", lng);
        axios
          .get(`http://localhost:8000/api/v1/maps/reverse-geocode`, {
            params: { lat, lon: lng },
            withCredentials: true,
          })
          .then((res) => {
            setAddress(res.data.data.display_name);
            console.log(res.data.data.display_name);
          })
          .catch(() => setAddress("Failed to fetch address"));
      },
    });

    return position ? <Marker position={position} /> : null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Select Delivery Location</h3>
        <MapContainer
          center={[20.5937, 78.9629]} // center on India
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: "300px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
        </MapContainer>

        {address && (
          <div className={styles.addressBox}>
            <p>
              <strong>Selected Address:</strong>
            </p>
            <p>{address}</p>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button
            onClick={() =>
              onSelect({
                address,
                latitude: position[0],
                longitude: position[1],
              })
            }
            disabled={!address}
          >
            Confirm
          </button>
          <button onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default LocationPickerModal;
