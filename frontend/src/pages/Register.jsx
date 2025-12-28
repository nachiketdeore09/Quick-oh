import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Fade,
  Slide,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "../context/UserContext";
import { z } from "zod";
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
    <div className={styles.registerPage}>
      {/* 🔹 Registration Form */}
      <Box
        sx={{
          minHeight: "calc(100vh - 80px)", // leaves space for navbar height
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          position: "relative",
          zIndex: 2,
          mt: 6, // margin from navbar
          mb: 4, // margin at the bottom
        }}
      >
        <Slide direction="up" in={true} mountOnEnter unmountOnExit>
          <Fade in timeout={700}>
            <Paper
              elevation={8}
              sx={{
                p: 4,
                maxWidth: 700,
                width: "100%",
                borderRadius: 5,
                backdropFilter: "blur(12px)",
                background: "rgba(255, 255, 255, 0.25)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
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
                Create Your Account
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2, whiteSpace: "pre-line" }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={handleSubmit}
                encType="multipart/form-data"
              >
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  required
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
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  margin="normal"
                  required
                />

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Profile Picture
                  </Typography>
                  <input
                    type="file"
                    name="profilePicture"
                    accept="image/*"
                    onChange={handleChange}
                    style={{
                      padding: "10px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(255,255,255,0.8)",
                      width: "100%",
                    }}
                  />
                </Box>

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{
                    mt: 4,
                    py: 1.5,
                    fontSize: "1rem",
                    borderRadius: "9999px",
                    background: "linear-gradient(90deg, #007cf0, #00dfd8)",
                  }}
                >
                  Register
                </Button>

                <Typography
                  mt={2}
                  textAlign="center"
                  fontSize="0.9rem"
                  sx={{ color: "#555" }}
                >
                  Already have an account?{" "}
                  <Link to="/login" style={{ color: "#00dfd8" }}>
                    Login
                  </Link>
                </Typography>
              </Box>
            </Paper>
          </Fade>
        </Slide>
      </Box>
    </div>
  );
};

export default Register;
