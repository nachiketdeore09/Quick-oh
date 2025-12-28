import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  Paper,
  Button,
} from "@mui/material";
import "leaflet/dist/leaflet.css";

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Helper to move map programmatically
const FlyToLocation = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16);
    }
  }, [position, map]);
  return null;
};

const OSMLocationPickerModal = ({ onClose, onSelect }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔍 Search locations (autocomplete)
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: query,
              format: "json",
              addressdetails: 1,
              limit: 7,
            },
          }
        );
        setSuggestions(res.data);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 300); // debounce

    return () => clearTimeout(timer);
  }, [query]);

  // 📍 When suggestion selected
  const handleSelectSuggestion = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    setPosition([lat, lon]);
    setAddress(place.display_name);
    setSuggestions([]);
    setQuery(place.display_name);
  };

  // 🖱 Map click handler
  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    setPosition([lat, lng]);

    try {
      setLoading(true);
      const res = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
          params: {
            lat,
            lon: lng,
            format: "json",
          },
        }
      );
      setAddress(res.data.display_name);
      setQuery(res.data.display_name);
    } catch {
      setAddress("Unable to fetch address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        sx={{
          width: 420,
          p: 3,
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" mb={1}>
          📍 Select Delivery Location
        </Typography>

        {/* Search box */}
        <TextField
          fullWidth
          placeholder="Search location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Autocomplete suggestions */}
        {suggestions.length > 0 && (
          <Paper sx={{ mt: 1, maxHeight: 160, overflowY: "auto" }}>
            <List dense>
              {suggestions.map((place) => (
                <ListItem
                  key={place.place_id}
                  button
                  onClick={() => handleSelectSuggestion(place)}
                >
                  {place.display_name}
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Map */}
        <Box mt={2} sx={{ height: 280 }}>
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
            whenCreated={(map) => map.on("click", handleMapClick)}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {position && (
              <>
                <Marker position={position} />
                <FlyToLocation position={position} />
              </>
            )}
          </MapContainer>
        </Box>

        {/* Selected address */}
        {address && (
          <Typography variant="body2" mt={2}>
            <strong>Selected:</strong> {address}
          </Typography>
        )}

        {/* Buttons */}
        <Box mt={2} display="flex" gap={2}>
          <Button
            variant="contained"
            fullWidth
            disabled={!position || loading}
            onClick={() =>
              onSelect({
                address,
                latitude: position[0],
                longitude: position[1],
              })
            }
          >
            Confirm
          </Button>
          <Button variant="outlined" fullWidth onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OSMLocationPickerModal;
