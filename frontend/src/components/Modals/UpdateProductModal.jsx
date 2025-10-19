import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Modal,
  CircularProgress,
  MenuItem,
  Avatar,
} from "@mui/material";
import axios from "axios";

export default function EditProductModal({ product, onClose, onUpdate }) {
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState({
    productName: product.productName,
    description: product.description,
    productCategory: product.productCategory,
    price: product.price,
    discount: product.discount,
    stock: product.stock || "Available",
  });

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUpdate = async () => {
    try {
      const res = await axios.put(
        `http://localhost:8000/api/v1/products/updateProduct/${product._id}`,
        formData,
        { withCredentials: true }
      );
      onUpdate(res.data.data);
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update product.");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("productImage", file);
    setImageUploading(true);

    try {
      const res = await axios.put(
        `http://localhost:8000/api/v1/products/updateProductImage/${product._id}`,
        uploadData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("Product image updated successfully!");
      onUpdate(res.data.data);
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Image update failed.");
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 550,
          bgcolor: "white",
          borderRadius: 3,
          boxShadow: "0px 6px 20px rgba(0,0,0,0.3)",
          p: 4,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            mb: 3,
            fontWeight: "bold",
            background: "linear-gradient(90deg, #007cf0, #00dfd8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Edit Product
        </Typography>

        {/* Image Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            mb: 3,
          }}
        >
          <Avatar
            src={product.productImage || "/placeholder.png"}
            alt="Product"
            sx={{
              width: 90,
              height: 90,
              border: "2px solid #007cf0",
              borderRadius: 2,
            }}
          />
          <Button
            variant="contained"
            component="label"
            sx={{
              background: "linear-gradient(90deg, #007cf0, #00dfd8)",
              color: "white",
              fontWeight: 600,
              "&:hover": {
                background: "linear-gradient(90deg, #00dfd8, #007cf0)",
              },
            }}
            disabled={imageUploading}
          >
            {imageUploading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Change Image"
            )}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageUpload}
            />
          </Button>
        </Box>

        {/* Form Fields */}
        <TextField
          label="Product Name"
          name="productName"
          fullWidth
          value={formData.productName}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          label="Description"
          name="description"
          multiline
          rows={3}
          fullWidth
          value={formData.description}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          label="Category"
          name="productCategory"
          fullWidth
          value={formData.productCategory}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          label="Price"
          name="price"
          type="number"
          fullWidth
          value={formData.price}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          label="Discount (%)"
          name="discount"
          type="number"
          fullWidth
          value={formData.discount}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          select
          label="Stock"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          fullWidth
          margin="normal"
        >
          <MenuItem value="Available">Available</MenuItem>
          <MenuItem value="Out Of Stock">Out Of Stock</MenuItem>
          <MenuItem value="Very Few Remaining">Very Few Remaining</MenuItem>
        </TextField>

        {/* Buttons */}
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}
        >
          <Button
            onClick={handleUpdate}
            variant="contained"
            sx={{
              background: "linear-gradient(90deg, #007cf0, #00dfd8)",
              fontWeight: 600,
              "&:hover": {
                background: "linear-gradient(90deg, #00dfd8, #007cf0)",
              },
            }}
          >
            Save
          </Button>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: "#007cf0",
              color: "#007cf0",
              fontWeight: 600,
              "&:hover": {
                borderColor: "#00dfd8",
                color: "#00dfd8",
              },
            }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
