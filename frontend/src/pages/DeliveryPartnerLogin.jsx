import { useState } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Slide,
  Link as MuiLink,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";

function DeliveryPartnerLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { updateProfileImage, updateRole } = useUser();
  const socket = useSocket();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/users/login",
        formData,
        { withCredentials: true }
      );

      const user = res.data.data.user;

      if (user.role === "deliveryPartner") {
        updateRole("deliveryPartner");
        updateProfileImage(user.profilePicture);
        localStorage.setItem("isAuthenticated", "true");

        socket?.emit("joinRoom", `delivery-partner-${user._id}`);
        navigate("/delivery-dashboard");
      } else {
        setError("Access denied: Not a delivery partner");
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #007cf0, #00dfd8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Slide direction="up" in={true} mountOnEnter unmountOnExit>
        <Paper
          elevation={10}
          sx={{
            p: 5,
            maxWidth: 500,
            width: "100%",
            borderRadius: 4,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 4px 25px rgba(0,0,0,0.4)",
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            textAlign="center"
            sx={{
              background: "linear-gradient(90deg, #007cf0, #00dfd8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Delivery Partner Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#00dfd8" },
                  "&.Mui-focused fieldset": { borderColor: "#00dfd8" },
                },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#00dfd8" },
                  "&.Mui-focused fieldset": { borderColor: "#00dfd8" },
                },
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{
                mt: 4,
                py: 1.5,
                fontSize: "1rem",
                borderRadius: "9999px",
                background: "linear-gradient(90deg, #007cf0, #00dfd8)",
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              Login
            </Button>

            <Typography
              variant="body2"
              textAlign="center"
              sx={{ mt: 3, color: "#555" }}
            >
              Not registered as a delivery partner?{" "}
              <MuiLink
                sx={{
                  color: "#007cf0",
                  fontWeight: "bold",
                  cursor: "pointer",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => navigate("/delivery/register")}
              >
                Register here
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Slide>
    </Box>
  );
}

export default DeliveryPartnerLogin;
