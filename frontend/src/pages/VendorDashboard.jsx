import { useEffect, useState } from "react";
import axios from "axios";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useUser } from "../context/UserContext.jsx";
import PasswordChangeModal from "../components/Modals/PasswordChangeModal.jsx";
import UpdateProductModal from "../components/Modals/UpdateProductModal.jsx";
import CreateProductForm from "../components/CreateProductForm";

function VendorDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const { updateProfileImage } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/users/current-user",
        {
          withCredentials: true,
        }
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

  const handleEditToggle = () => setIsEditing(!isEditing);
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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
      setUser((prev) => ({ ...prev, ...formData }));
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const res = await axios.patch(
        "http://localhost:8000/api/v1/users/profilePicture",
        formData,
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

  const handlePasswordInputChange = (e) =>
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleChangePassword = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/v1/users/change-password",
        passwordForm,
        {
          withCredentials: true,
        }
      );
      alert("Password changed successfully!");
      setPasswordModal(false);
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Failed to change password. Try again."
      );
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/products/getAllProducts",
        {
          withCredentials: true,
        }
      );
      setProducts(res.data.data.products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <Typography align="center">Loading...</Typography>;
  if (!user) return <Typography align="center">User not found.</Typography>;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        py: 5,
        px: 3,
        background: "linear-gradient(135deg, #f9fafb, #97ebf3)",
        color: "white",
        fontFamily: "Roboto, sans-serif",
      }}
    >
      <Typography
        variant="h3"
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

      {/* Profile Section */}
      <Card
        sx={{
          background: "#f9fafb",
          backdropFilter: "blur(12px)",
          borderRadius: 3,
          width: "75%",
          mx: "auto",
          mb: 5,
          p: 3,
          color: "white",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        <CardContent sx={{ textAlign: "center" }}>
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
        </CardContent>
      </Card>

      <Divider sx={{ width: "85%", mx: "auto", mb: 5, borderColor: "#555" }} />

      {/* Create Product Form Centered */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 5,
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: "75%",
            background: "#f9fafb",
            borderRadius: 5,
            p: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            padding: "0",
          }}
        >
          <CreateProductForm onProductCreated={fetchProducts} />
        </Box>
      </Box>

      <Divider sx={{ width: "85%", mx: "auto", mb: 5, borderColor: "#555" }} />

      {/* Product Grid */}
      <Box
        sx={{
          mt: 3,
          background: "#f9fafb",
          p: 3,
          borderRadius: 3,
          width: "90%",
          mx: "auto",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          height: "auto",
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="start"
          gutterBottom
          sx={{
            background: "linear-gradient(90deg, #007bff, #00c6ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Created Products
        </Typography>

        {products.length > 0 ? (
          <Grid
            container
            spacing={4}
            sx={{
              display: "flex",
              // alignItems: "center",
              justifyContent: "flex-start",
              maxHeight: "100%",
              flexWrap: "wrap",
            }}
          >
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <Card
                  sx={{
                    height: 260,
                    width: 260,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "#bbdefb",
                    borderRadius: 2,
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                    "&:hover": {
                      transform: "scale(1.03)",
                      transition: "0.3s",
                      background: "#a0d0f7",
                      boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
                    },
                  }}
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowEditModal(true);
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                  >
                    <img
                      src={product.productImage || "/placeholder.png"}
                      alt={product.productName}
                      style={{
                        width: 120,
                        height: 120,
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                    />
                  </Box>
                  <CardContent
                    sx={{
                      textAlign: "center",
                      color: "#555",
                    }}
                  >
                    <Typography variant="h6">{product.productName}</Typography>
                    <Typography
                      sx={{
                        fontSize: 14,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {product.description}
                    </Typography>
                    <Typography fontWeight="bold">₹{product.price}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography sx={{ textAlign: "center" }}>
            No products created yet.
          </Typography>
        )}
      </Box>

      {passwordModal && (
        <PasswordChangeModal
          oldPassword={passwordForm.oldPassword}
          newPassword={passwordForm.newPassword}
          onChange={handlePasswordInputChange}
          onSubmit={handleChangePassword}
          onCancel={() => {
            console.log("here"), setPasswordModal(false);
          }}
        />
      )}

      {showEditModal && selectedProduct && (
        <UpdateProductModal
          product={selectedProduct}
          onClose={() => setShowEditModal(false)}
          onUpdate={() => {
            setShowEditModal(false);
            fetchProducts();
          }}
        />
      )}
    </Box>
  );
}

export default VendorDashboard;
