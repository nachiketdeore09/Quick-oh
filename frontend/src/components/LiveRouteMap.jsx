import { useEffect, memo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const Routing = ({ from, to }) => {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!from || !to || routingRef.current) return;

    routingRef.current = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      routeWhileDragging: false,
      draggableWaypoints: false,
      addWaypoints: false,
      show: false,
      lineOptions: {
        styles: [{ color: "#0e549aff", weight: 4 }],
      },
      createMarker: () => null,
    }).addTo(map);

    // added this so to further diplay dstance and estimated time to user.
    // routingControl.on("routesfound", (e) => {
    //   const route = e.routes[0];
    //   const distanceKm = (route.summary.totalDistance / 1000).toFixed(1);
    //   const timeMin = Math.ceil(route.summary.totalTime / 60);
    // });

    return () => {
      if (routingRef.current) {
        map.removeControl(routingRef.current);
        routingRef.current = null;
      }
    };
  }, [map]);

  // update waypoints ONLY when positions change
  useEffect(() => {
    if (routingRef.current && from && to) {
      routingRef.current.setWaypoints([
        L.latLng(from[0], from[1]),
        L.latLng(to[0], to[1]),
      ]);
    }
  }, [from, to]);

  return null;
};

const LiveRouteMap = memo(({ customerPosition, partnerPosition }) => {
  const center = partnerPosition || customerPosition;
  // console.log(customerPosition);
  // console.log(partnerPosition);

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Customer Marker */}
      <Marker position={customerPosition}>
        <Popup>📍 Customer Location</Popup>
      </Marker>

      {/* Delivery Partner Marker */}
      {partnerPosition && (
        <Marker position={partnerPosition}>
          <Popup>🛵 Delivery Partner</Popup>
        </Marker>
      )}

      {/* Route */}
      {partnerPosition && (
        <Routing from={partnerPosition} to={customerPosition} />
      )}
    </MapContainer>
  );
});

export default LiveRouteMap;
