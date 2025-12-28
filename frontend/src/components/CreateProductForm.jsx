import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  Stack,
  Input,
} from "@mui/material";
import axios from "axios";

function CreateProductForm({ onProductCreated }) {
  const [newProduct, setNewProduct] = useState({
    productName: "",
    description: "",
    productCategory: "",
    price: "",
    discount: "",
    stock: "",
    image: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(newProduct).forEach(([key, value]) => {
      if (key !== "image") formData.append(key, value);
    });
    if (newProduct.image) {
      formData.append("productImage", newProduct.image);
    } else {
      alert("Please provide a product image");
      return;
    }

    try {
      await axios.post(
        "https://quick-oh.onrender.com/api/v1/products/createProduct",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("✅ Product created successfully!");
      setNewProduct({
        productName: "",
        description: "",
        productCategory: "",
        price: "",
        discount: "",
        stock: "",
        image: null,
      });
      if (onProductCreated) onProductCreated();
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "❌ Failed to create product. Try again."
      );
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      height="100%"
      sx={{
        background: "linear-gradient(135deg, #007bff 0%, #00c6ff 100%)",
        py: 6,
        borderRadius: 4,
        padding: "0",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 4,
          width: "90%",
          maxWidth: "95%",
          height: "90%",
          maxHeight: "95%",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(6px)",
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
          Create New Product
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Product Name"
            variant="outlined"
            value={newProduct.productName}
            onChange={(e) =>
              setNewProduct({ ...newProduct, productName: e.target.value })
            }
            required
            fullWidth
          />

          <TextField
            label="Description"
            variant="outlined"
            multiline
            rows={3}
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
            required
            fullWidth
          />

          <TextField
            label="Category"
            variant="outlined"
            value={newProduct.productCategory}
            onChange={(e) =>
              setNewProduct({ ...newProduct, productCategory: e.target.value })
            }
            required
            fullWidth
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Price"
              type="number"
              variant="outlined"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
              required
              fullWidth
            />
            <TextField
              label="Discount (%)"
              type="number"
              variant="outlined"
              value={newProduct.discount}
              onChange={(e) =>
                setNewProduct({ ...newProduct, discount: e.target.value })
              }
              fullWidth
            />
          </Stack>

          <TextField
            label="Stock"
            type="text"
            variant="outlined"
            value={newProduct.stock}
            onChange={(e) =>
              setNewProduct({ ...newProduct, stock: e.target.value })
            }
            required
            fullWidth
          />

          <Input
            type="file"
            inputProps={{ accept: "image/*" }}
            onChange={(e) =>
              setNewProduct({ ...newProduct, image: e.target.files[0] })
            }
            required
            sx={{
              border: "1px solid #ccc",
              borderRadius: 2,
              p: 1,
              backgroundColor: "white",
            }}
          />

          <Button
            variant="contained"
            type="submit"
            fullWidth
            sx={{
              mt: 2,
              py: 1.2,
              fontWeight: "bold",
              fontSize: "1rem",
              background: "linear-gradient(90deg, #007bff, #00c6ff)",
              "&:hover": {
                background: "linear-gradient(90deg, #006ae0, #00a8e0)",
              },
            }}
          >
            Create Product
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default CreateProductForm;
