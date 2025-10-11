import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";

function DeliveryPartnerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { updateProfileImage, updateRole } = useUser();
  const socket = useSocket();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/users/login",
        { email, password },
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
        setErrorMsg("Access denied: Not a delivery partner");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(error?.response?.data?.message || "Login failed");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #e0f7fa, #f9fafb)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          maxWidth: 500,
          width: "100%",
          borderRadius: 4,
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Delivery Partner Login
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
        />

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3, py: 1.5 }}
          onClick={handleLogin}
        >
          Login
        </Button>
      </Paper>
    </Box>
  );
}

export default DeliveryPartnerLogin;

// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import styles from "./DeliveryPartnerLogin.module.css";
// import { useUser } from "../context/UserContext.jsx";
// import { useSocket } from "../context/SocketContext.jsx";

// function DeliveryPartnerLogin() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();
//   const { updateProfileImage, updateRole } = useUser();
//   const socket = useSocket();

//   const handleLogin = async () => {
//     try {
//       const res = await axios.post(
//         "http://localhost:8000/api/v1/users/login",
//         { email, password },
//         { withCredentials: true }
//       );
//       console.log(res.data.data.user);
//       if (res.data.data.user.role === "deliveryPartner") {
//         alert("Login successful");
//         updateRole("deliveryPartner");
//         localStorage.setItem("isAuthenticated", "true");
//         updateProfileImage(res.data.data.user.profilePicture);

//         //join the room
//         socket?.emit("joinRoom", `delivery-partner-${res.data.data.user._id}`);
//         //redirect to dashboard
//         navigate("/delivery-dashboard");
//       } else {
//         alert("Access denied: Not a delivery partner");
//       }
//     } catch (error) {
//       console.log(error);
//       alert("Login failed: " + error?.response?.data?.message);
//     }
//   };

//   return (
//     <div className={styles.loginContainer}>
//       <h2>Delivery Partner Login</h2>
//       <input
//         type="email"
//         placeholder="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         className={styles.input}
//       />
//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         className={styles.input}
//       />
//       <button onClick={handleLogin} className={styles.loginBtn}>
//         Login
//       </button>
//     </div>
//   );
// }

// export default DeliveryPartnerLogin;
