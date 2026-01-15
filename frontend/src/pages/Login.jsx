import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Link as MuiLink,
  Slide,
  Fade,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useUser } from "../context/UserContext";
import { z } from "zod";
import { toast } from "react-toastify";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const navigate = useNavigate();
  const { updateProfileImage, updateRole } = useUser();

  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [errors, setErrors] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      loginSchema.parse(formData);

      const response = await axios.post(
        // "http://localhost:8000/api/v1/users/login",
        "https://quick-oh.onrender.com/api/v1/users/login",
        formData,
        { withCredentials: true }
      );

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem(
        "profileImage",
        response.data.data.user.profilePicture
      );

      updateProfileImage(response.data.data.user.profilePicture);
      updateRole("customer");

      toast.success("Login successful!");
      navigate("/shop");
    } catch (err) {
      if (err instanceof z.ZodError) {
        const messages = err._zod.def.map((e) => e.message);
        setErrors(messages);
      } else {
        console.error("Error during login:", err);
        setErrors({
          general:
            err?.response?.data?.message ||
            "Login failed. Please check your credentials.",
        });
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #eef2f7 50%, #e5edf5 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 530,
          p: "48px 40px",
          borderRadius: "24px",
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.22)",
          color: "#111827",
        }}
      >
        {/* Logo */}
        <Box sx={{ textAlign: "center", mb: 1 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              mx: "auto",
              mb: 1,
              borderRadius: "14px",
              background: "linear-gradient(135deg, #007cf0, #00dfd8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 16px #007cf048",
              fontWeight: 900,
              color: "#1a1a1a",
            }}
          >
            🛍️
          </Box>

          <Typography
            sx={{
              fontSize: 28,
              fontWeight: 700,
              background: "#007cf0",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
            }}
          >
            Quick-oh.
          </Typography>

          <Typography
            sx={{
              fontSize: 15,
              color: "#6b7280",
              mt: 1,
              mb: 4,
            }}
          >
            Welcome back! Get groceries in 10 minutes
          </Typography>
        </Box>

        {/* Errors */}
        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </Alert>
        )}

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "grid", gap: 2 }}
        >
          <TextField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            fullWidth
            InputProps={{
              style: {
                background: "#f9fafb",
                borderRadius: 12,
              },
            }}
            InputLabelProps={{ style: { color: "#6b7280" } }}
          />

          <TextField
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            fullWidth
            InputProps={{
              style: {
                background: "#f9fafb",
                borderRadius: 12,
              },
            }}
            InputLabelProps={{ style: { color: "#6b7280" } }}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            fullWidth
            InputProps={{
              style: {
                background: "#f9fafb",
                borderRadius: 12,
              },
            }}
            InputLabelProps={{ style: { color: "#6b7280" } }}
          />

          <Typography
            textAlign="right"
            sx={{
              fontSize: 13,
              color: "#000000",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Forgot password?
          </Typography>

          <Button
            type="submit"
            fullWidth
            sx={{
              mt: 1,
              py: 1.6,
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 16,
              background: "linear-gradient(135deg,#84cc16,#65a30d)",
              color: "#1a1a1a",
              boxShadow: "0 6px 18px rgba(132,204,22,0.35)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 10px 28px rgba(132,204,22,0.45)",
              },
            }}
          >
            ⚡ Sign In
          </Button>
        </Box>

        {/* Divider */}
        <Box sx={{ display: "flex", alignItems: "center", my: 3 }}>
          <Box sx={{ flex: 1, height: 1, bgcolor: "#e5e7eb" }} />
          <Typography sx={{ mx: 2, fontSize: 13, color: "#9ca3af" }}>
            or continue with
          </Typography>
          <Box sx={{ flex: 1, height: 1, bgcolor: "#e5e7eb" }} />
        </Box>

        {/* Social */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            fullWidth
            sx={{
              color: "#374151",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
            }}
          >
            Google
          </Button>
          <Button
            fullWidth
            sx={{
              color: "#374151",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
            }}
          >
            Facebook
          </Button>
        </Box>

        {/* Footer */}
        <Typography textAlign="center" mt={3} fontSize={14} color="#6b7280">
          Don’t have an account?
          <MuiLink
            component={Link}
            to="/register"
            sx={{ color: "#007cf0", ml: 0.5, fontWeight: 600 }}
          >
            Sign up
          </MuiLink>
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 3,
            mt: 3,
            pt: 2,
            borderTop: "1px solid #e5e7eb",
            fontSize: 13,
          }}
        >
          <MuiLink
            component={Link}
            to="/delivery-login"
            sx={{ color: "#9ca3af" }}
          >
            Partner Login
          </MuiLink>
          <MuiLink
            component={Link}
            to="/vendor/login"
            sx={{ color: "#9ca3af" }}
          >
            Admin Login
          </MuiLink>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
