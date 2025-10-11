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
        background: "linear-gradient(to right, #e1f5fe, #f9fafb)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Slide direction="up" in={true} mountOnEnter unmountOnExit>
        <Paper
          elevation={6}
          sx={{
            maxWidth: 500,
            width: "100%",
            p: 4,
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Vendor Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
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
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              sx={{ mt: 3, py: 1.5 }}
            >
              Login
            </Button>
          </Box>
        </Paper>
      </Slide>
    </Box>
  );
}

export default VendorLogin;

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import styles from "./VendorLogin.module.css";
// import { useUser } from "../context/UserContext";

// function VendorLogin() {
//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");
//   const { updateProfileImage, updateRole } = useUser();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const res = await axios.post(
//         "http://localhost:8000/api/v1/users/login",
//         formData,
//         { withCredentials: true }
//       );

//       console.log("Vendor login success:", res.data);

//       localStorage.setItem("isAuthenticated", "true");
//       localStorage.setItem("profileImage", res.data.data.user.profilePicture);
//       localStorage.setItem("role", "vendor");

//       //update the user context fields
//       updateProfileImage(res.data.data.user.profilePicture);
//       updateRole("vendor");
//       // You can add role-based redirection here
//       navigate("/vendor/dashboard");
//     } catch (err) {
//       console.error(err);
//       setError("Invalid credentials. Please try again.");
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <form onSubmit={handleSubmit} className={styles.loginForm}>
//         <h2>Vendor Login</h2>
//         {error && <p className={styles.error}>{error}</p>}
//         <input
//           type="email"
//           name="email"
//           placeholder="Vendor Email"
//           value={formData.email}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="password"
//           name="password"
//           placeholder="Vendor Password"
//           value={formData.password}
//           onChange={handleChange}
//           required
//         />
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// }

// export default VendorLogin;
