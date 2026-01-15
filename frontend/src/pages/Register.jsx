import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  Checkbox,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "../context/UserContext";
import { z } from "zod";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import styles from "./Register.module.css"; // ✅ Using CSS module correctly

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  profilePicture: z.any().nullable(),
});

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    profilePicture: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { updateProfileImage, updateRole } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      registerSchema.parse(formData);

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      const response = await axios.post(
        "https://quick-oh.onrender.com/api/v1/users/register",
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 201 || response.status === 200) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("profileImage", response.data.data.profilePicture);
        localStorage.setItem("role", "customer");
        localStorage.setItem("accessToken", response.data.data.accessToken);

        updateProfileImage(response.data.data.profilePicture);
        updateRole("customer");
        toast.success("Registration successful!");
        setTimeout(() => navigate("/shop"), 1500);
      } else throw new Error(`Unexpected response code: ${response.status}`);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const messages = err._zod.def.map((e) => e.message);
        setError(messages.join("\n"));
      } else {
        console.error("Error submitting form:", err);
        setError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f4f7fb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          width: "100%",
          maxWidth: 530,
          borderRadius: 4,
          p: 4,
        }}
      >
        {/* Logo */}
        <Box textAlign="center" mb={2}>
          <Box
            sx={{
              mx: "auto",
              width: 56,
              height: 56,
              bgcolor: "#007cf0",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1,
            }}
          >
            <ShoppingBagOutlinedIcon sx={{ color: "#fff", fontSize: 28 }} />
          </Box>
          <Typography fontWeight={800} fontSize={26} color="#007cf0">
            QuickMart
          </Typography>
          <Typography fontSize={14} color="#6b7280" mt={1}>
            Create your account and start shopping
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {/* Full Name */}
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <PersonOutlineIcon sx={{ mr: 1, color: "#9ca3af" }} />
              ),
            }}
            sx={{ mb: 2 }}
            required
          />

          {/* Email + Phone */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <MailOutlineIcon sx={{ mr: 1, color: "#9ca3af" }} />
                ),
              }}
              required
            />
            <TextField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <PhoneOutlinedIcon sx={{ mr: 1, color: "#9ca3af" }} />
                ),
              }}
              required
            />
          </Box>

          {/* Password */}
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <LockOutlinedIcon sx={{ mr: 1, color: "#9ca3af" }} />
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
            sx={{ mt: 2 }}
            required
          />

          {/* Confirm Password */}
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <LockOutlinedIcon sx={{ mr: 1, color: "#9ca3af" }} />
              ),
              endAdornment: (
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <VisibilityOffOutlinedIcon />
                  ) : (
                    <VisibilityOutlinedIcon />
                  )}
                </IconButton>
              ),
            }}
            sx={{ mt: 2 }}
            required
          />

          {/* Terms */}
          <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
            <Checkbox
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              sx={{ color: "#007cf0" }}
            />
            <Typography fontSize={13} color="#6b7280">
              I agree to the{" "}
              <Box component="span" color="#007cf0" fontWeight={600}>
                Terms of Service
              </Box>{" "}
              and{" "}
              <Box component="span" color="#007cf0" fontWeight={600}>
                Privacy Policy
              </Box>
            </Typography>
          </Box>

          {/* Submit */}
          <Button
            fullWidth
            type="submit"
            disabled={!agreed}
            sx={{
              mt: 3,
              py: 1.5,
              borderRadius: 2,
              bgcolor: "#84cc16",
              color: "#1a1a1a",
              fontWeight: 700,
              "&:hover": { bgcolor: "#65a30d" },
            }}
          >
            Create Account
          </Button>
        </Box>

        {/* Features */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 3,
            mt: 3,
            flexWrap: "wrap",
          }}
        >
          {["10 min delivery", "No minimum order", "Fresh products"].map(
            (text) => (
              <Box key={text} sx={{ display: "flex", gap: 0.5 }}>
                <CheckCircleOutlineIcon
                  sx={{ fontSize: 16, color: "#84cc16" }}
                />
                <Typography fontSize={12} color="#6b7280">
                  {text}
                </Typography>
              </Box>
            )
          )}
        </Box>

        {/* Login */}
        <Typography textAlign="center" mt={3} fontSize={14} color="#6b7280">
          Already have an account?
          <Box
            component={Link}
            to="/login"
            sx={{ color: "#007cf0", fontWeight: 600, ml: 0.5 }}
          >
            Sign in
          </Box>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Register;
