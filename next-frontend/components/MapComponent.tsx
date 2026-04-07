"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix missing marker icons
const customerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const partnerIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
function Routing({ from, to }: { from: [number, number], to: [number, number] }) {
  const [route, setRoute] = React.useState<[number, number][]>([from, to]);

  useEffect(() => {
    if (!from || !to) return;

    const fetchRoute = async () => {
      try {
        // OSRM coordinates are [lng, lat]
        const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
        const resp = await fetch(url);
        const data = await resp.json();

        if (data.code === "Ok" && data.routes?.[0]?.geometry?.coordinates) {
          // GeoJSON coordinates are [lng, lat], Leaflet needs [lat, lng]
          const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
          setRoute(coords);
        } else {
          setRoute([from, to]); // Fallback to straight line
        }
      } catch (e) {
        setRoute([from, to]); // Fallback
      }
    };

    fetchRoute();
  }, [from[0], from[1], to[0], to[1]]);

  return (
    <Polyline 
      positions={route} 
      color="#00dfd8" 
      weight={6} 
      opacity={0.8}
      lineCap="round"
      lineJoin="round"
    />
  );
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface MapProps {
  lat: number;
  lng: number;
  label?: string;
  partnerLat?: number;
  partnerLng?: number;
}

export default function MapComponent({ lat, lng, label = "Customer Location", partnerLat, partnerLng }: MapProps) {
  if (typeof window === "undefined") return null;

  const center: [number, number] = partnerLat && partnerLng ? [partnerLat, partnerLng] : [lat, lng];

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden z-0 relative">
      <MapContainer 
        center={center} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <ChangeView center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Customer Marker */}
        <Marker position={[lat, lng]} icon={customerIcon}>
          <Popup>{label}</Popup>
        </Marker>

        {/* Partner Marker */}
        {partnerLat && partnerLng && (
          <>
            <Marker position={[partnerLat, partnerLng]} icon={partnerIcon}>
              <Popup>Your Location</Popup>
            </Marker>
            <Routing from={[partnerLat, partnerLng]} to={[lat, lng]} />
          </>
        )}
      </MapContainer>
    </div>
  );
}

