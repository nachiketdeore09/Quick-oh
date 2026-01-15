import { useState } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  IconButton,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";

import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

function DeliveryPartnerLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
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
        // "http://localhost:8000/api/v1/users/login",
        "https://quick-oh.onrender.com/api/v1/users/login",
        formData,
        { withCredentials: true }
      );

      const user = res.data.data.user;
      console.log(res.data.data);

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
        display: "flex",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #eef2f7 50%, #e5edf5 100%)",
      }}
    >
      {/* LEFT PANEL */}
      <Box
        sx={{
          flex: 0.9,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          px: 15,
          color: "white",
        }}
      >
        <Typography
          component={Link}
          to="/login"
          sx={{
            position: "absolute",
            top: 24,
            left: 24,
            color: "#6b7280",
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          ← Back to Customer Login
        </Typography>

        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 999,
            bgcolor: " #00dfd8a0",
            mb: 3,
            width: "fit-content",
            color: "#6b7280",
          }}
        >
          <DirectionsBikeIcon fontSize="small" />
          <Typography fontSize={14}>Delivery Partner Program</Typography>
        </Box>

        <Typography
          fontSize={48}
          fontWeight={800}
          lineHeight={1.1}
          color="#007cf0"
        >
          Earn money on <br />
          <Box component="span" sx={{ color: "#007cf0" }}>
            your schedule
          </Box>
        </Typography>

        <Typography sx={{ mt: 3, maxWidth: 500, color: "#6b7280" }}>
          Join thousands of delivery partners making great income with flexible
          hours. Deliver groceries in 10 minutes and earn instant payouts.
        </Typography>

        <Box sx={{ display: "flex", gap: 5, mt: 5 }}>
          {[
            ["₹25K+", "Avg. monthly earnings"],
            ["50K+", "Active partners"],
            ["1", "City"],
          ].map(([v, l]) => (
            <Box key={l}>
              <Typography fontSize={30} fontWeight={700} color="#6b7280">
                {v}
              </Typography>
              <Typography fontSize={14} color="#6b7280">
                {l}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* RIGHT PANEL */}
      <Box
        sx={{
          flex: 0.8,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          px: 3,
        }}
      >
        <Paper
          elevation={10}
          sx={{
            width: "100%",
            maxWidth: 480,
            p: 4,
            borderRadius: 4,
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                bgcolor: "#00dfd8",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DirectionsBikeIcon sx={{ color: "#6b7280", fontSize: 28 }} />
            </Box>
            <Box>
              <Typography fontWeight={700} fontSize={20}>
                Partner Portal
              </Typography>
              <Typography fontSize={13} color="text.secondary">
                Quick-oh Delivery
              </Typography>
            </Box>
          </Box>

          <Typography color="text.secondary" mb={3}>
            Sign in to manage your deliveries
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* FORM */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email or Phone"
              name="email"
              value={formData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <MailOutlineIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <LockOutlinedIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon />
                    ) : (
                      <VisibilityOutlinedIcon />
                    )}
                  </IconButton>
                ),
              }}
              required
            />

            <Button
              fullWidth
              type="submit"
              sx={{
                mt: 3,
                py: 1.5,
                borderRadius: 2,
                bgcolor: "#007cf0",
                color: "#fff",
                fontWeight: 600,
                "&:hover": { bgcolor: "#015db4ff" },
              }}
              endIcon={<ArrowForwardIcon />}
            >
              Start Delivering
            </Button>
          </Box>

          {/* BENEFITS */}
          <Box
            sx={{
              mt: 4,
              p: 2,
              borderRadius: 3,
              bgcolor: "#f1f5f9",
            }}
          >
            <Typography fontSize={13} fontWeight={700} color="#007cf0" mb={2}>
              PARTNER BENEFITS
            </Typography>

            {[
              [CurrencyRupeeIcon, "Daily payouts directly to your bank"],
              [AccessTimeIcon, "Work anytime, anywhere"],
              [LocationOnOutlinedIcon, "Short delivery distances"],
            ].map(([Icon, text]) => (
              <Box key={text} sx={{ display: "flex", gap: 2, mb: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "#e0e7ff",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon fontSize="small" color="primary" />
                </Box>
                <Typography fontSize={14}>{text}</Typography>
              </Box>
            ))}
          </Box>

          <Typography textAlign="center" mt={3} fontSize={14}>
            Want to become a partner?
            <Box
              component="span"
              sx={{
                color: "#007cf0",
                fontWeight: 600,
                ml: 0.5,
                cursor: "pointer",
              }}
              onClick={() => navigate("/delivery/register")}
            >
              Apply Now
            </Box>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

export default DeliveryPartnerLogin;
