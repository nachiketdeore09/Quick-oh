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
    <div
      style={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* 🔹 Dark Overlay */}

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          position: "relative",
          zIndex: 2,
          paddingTop: "2rem",
          paddingBottom: "2rem",
        }}
      >
        <Slide direction="up" in={true} mountOnEnter unmountOnExit>
          <Fade in timeout={700}>
            <Paper
              elevation={8}
              sx={{
                p: 4,
                maxWidth: 500,
                width: "100%",
                borderRadius: 5,
                backdropFilter: "blur(12px)",
                background: "rgba(255, 255, 255, 0.25)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
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
                Welcome Back
              </Typography>
              {errors.length > 0 && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <ul style={{ color: "#ff4d4d", marginLeft: "1rem" }}>
                    {errors.map((err, index) => (
                      <li
                        key={index}
                        style={{ marginBottom: "4px", fontSize: "0.9rem" }}
                      >
                        {err}
                      </li>
                    ))}
                  </ul>
                </Box>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  required
                  InputProps={{
                    style: { color: "#555" },
                  }}
                  InputLabelProps={{
                    style: { color: "#555" },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#555",
                      },
                      "&:hover fieldset": {
                        borderColor: "#00dfd8",
                      },
                    },
                  }}
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
                  InputProps={{
                    style: { color: "#555" },
                  }}
                  InputLabelProps={{
                    style: { color: "#555" },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#555",
                      },
                      "&:hover fieldset": {
                        borderColor: "#00dfd8",
                      },
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
                  InputProps={{
                    style: { color: "#555" },
                  }}
                  InputLabelProps={{
                    style: { color: "#555" },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#555",
                      },
                      "&:hover fieldset": {
                        borderColor: "#00dfd8",
                      },
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
                  mt={2}
                  textAlign="center"
                  fontSize="0.9rem"
                  sx={{ color: "#555" }}
                >
                  Don’t have an account?{" "}
                  <MuiLink
                    component={Link}
                    to="/register"
                    underline="hover"
                    sx={{
                      color: "#00dfd8",
                      fontWeight: "bold",
                    }}
                  >
                    Register here
                  </MuiLink>
                </Typography>
              </Box>
            </Paper>
          </Fade>
        </Slide>
      </Box>
    </div>
  );
};

export default Login;
