import React from "react";
import { Box, Typography, Button } from "@mui/material";

const ThankYouPopup = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <Box
        sx={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          textAlign: "center",
          padding: "40px",
          maxWidth: "400px",
          width: "90%",
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", mb: 2, color: "#333" }}
        >
          🎉 Thank You!
        </Typography>
        <Typography sx={{ mb: 3, color: "#555" }}>
          order has been delivered successfully!
        </Typography>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: "#333",
            color: "#fff",
            "&:hover": { backgroundColor: "#555" },
          }}
        >
          Close
        </Button>
      </Box>
    </Box>
  );
};

export default ThankYouPopup;
