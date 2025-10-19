import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useUser } from "../context/UserContext";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });

  const { updateProfileImage } = useUser();

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/users/current-user",
        { withCredentials: true }
      );
      setUser(res.data.data);
      setFormData({
        name: res.data.data.name || "",
        email: res.data.data.email || "",
        address: res.data.data.address || "",
      });
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        try {
          const res = await axios.get(
            "http://localhost:8000/api/v1/order/getUserOrderHistory",
            { withCredentials: true }
          );
          setOrderHistory(res.data.data || []);
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      };
      fetchOrders();
    }
  }, [user]);

  const handleUpdate = async () => {
    try {
      await axios.patch(
        "http://localhost:8000/api/v1/users/update-account",
        {
          newName: formData.name,
          newEmail: formData.email,
          newAddress: formData.address,
        },
        { withCredentials: true }
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataImg = new FormData();
    formDataImg.append("profilePicture", file);

    try {
      const res = await axios.patch(
        "http://localhost:8000/api/v1/users/profilePicture",
        formDataImg,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setUser((prev) => ({
        ...prev,
        profilePicture: res.data.data.profilePicture,
      }));
      updateProfileImage(res.data.data.profilePicture);
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
  };

  const handlePasswordChange = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/v1/users/change-password",
        passwordForm,
        { withCredentials: true }
      );
      alert("Password changed successfully!");
      setPasswordModal(false);
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to change password.");
    }
  };

  if (loading)
    return (
      <>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "linear-gradient(to right, #1976d2, #42a5f5)",
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      </>
    );

  if (!user)
    return (
      <>
        <Typography align="center" sx={{ mt: 5 }}>
          User not found.
        </Typography>
      </>
    );

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f9fafb, #d2ecef)",
          py: 5,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: "80%",
            maxWidth: 900,
            borderRadius: 4,
            p: 4,
            background: "white",
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
            Your Profile
          </Typography>

          <Grid container spacing={4} alignItems="center">
            <Grid
              item
              xs={12}
              md={4}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                src={user.profilePicture}
                alt={user.name}
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  border: "3px solid #555",
                }}
              />
              <Button variant="outlined" component="label">
                Change Picture
                <input
                  type="file"
                  hidden
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </Button>
            </Grid>

            <Grid item xs={12} md={8}>
              {["name", "email", "address"].map((field) => (
                <TextField
                  key={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  name={field}
                  fullWidth
                  margin="normal"
                  value={formData[field]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  InputProps={{
                    readOnly: !isEditing,
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
              ))}
              <TextField
                fullWidth
                label="Phone Number"
                margin="normal"
                value={user.phoneNumber}
                InputProps={{ readOnly: true }}
              />
              <TextField
                fullWidth
                label="Role"
                margin="normal"
                value={user.role}
                InputProps={{ readOnly: true }}
              />

              <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                {!isEditing ? (
                  <Button
                    variant="contained"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleUpdate}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </>
                )}
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setPasswordModal(true)}
                >
                  Change Password
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            color="primary"
          >
            {user.role == "customer" ? "Order History" : "Past Orders"}
          </Typography>

          {orderHistory.length === 0 ? (
            <Alert severity="info">No orders yet.</Alert>
          ) : (
            <List>
              {orderHistory.map((order) => (
                <Paper
                  key={order._id}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  }}
                >
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={`Order ID: ${order._id}`}
                      secondary={
                        <>
                          <Typography variant="body2">
                            <strong>Status:</strong> {order.status}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Total:</strong> ₹{order.totalAmount}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Date:</strong>{" "}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </Typography>
                          <ul>
                            {order.items.map((item, idx) => (
                              <li key={idx}>
                                {item.product?.productName} — Qty:{" "}
                                {item.quantity}
                              </li>
                            ))}
                          </ul>
                        </>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          )}
        </Paper>

        {/* Password Change Modal */}
        <Dialog open={passwordModal} onClose={() => setPasswordModal(false)}>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <TextField
              margin="normal"
              label="Old Password"
              type="password"
              fullWidth
              name="oldPassword"
              value={passwordForm.oldPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  oldPassword: e.target.value,
                }))
              }
            />
            <TextField
              margin="normal"
              label="New Password"
              type="password"
              fullWidth
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordModal(false)} color="error">
              Cancel
            </Button>
            <Button
              onClick={handlePasswordChange}
              variant="contained"
              color="primary"
            >
              Change
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}

export default Profile;
