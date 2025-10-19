import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  Slide,
  Link as MuiLink,
} from "@mui/material";
import { useUser } from "../context/UserContext";

function VendorLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { updateProfileImage, updateRole } = useUser();

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

      console.log("Vendor login success:", res.data);

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("profileImage", res.data.data.user.profilePicture);
      localStorage.setItem("role", "vendor");

      updateProfileImage(res.data.data.user.profilePicture);
      updateRole("vendor");

      navigate("/vendor/dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f9fafb, #d2ecef)",
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
            Vendor Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Vendor Email"
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
              label="Vendor Password"
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
              Not registered as a vendor?{" "}
              <MuiLink
                sx={{
                  color: "#1976d2",
                  fontWeight: "bold",
                  cursor: "pointer",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => navigate("/vendor/register")}
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

export default VendorLogin;
