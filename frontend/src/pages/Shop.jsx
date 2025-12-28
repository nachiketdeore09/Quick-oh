import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  AppBar,
  Toolbar,
} from "@mui/material";
import { useCart } from "../context/CartContext.jsx";
import FloatingCart from "../components/FloatingCart.jsx";
const Shop = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const { addToCart } = useCart();
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          // "http://localhost:8000/api/v1/products/getAllProducts",
          "https://quick-oh.onrender.com/api/v1/products/getAllProducts",
          { withCredentials: true }
        );
        setProducts(res.data.data.products);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      setSearching(true);
      const res = await axios.get(
        // `https://localhost:8000/api/v1/products/searchProducts?keyword=${searchTerm}&page=1&limit=20`,
        `https://quick-oh.onrender.com/api/v1/products/searchProducts?keyword=${searchTerm}&page=1&limit=20`,
        { withCredentials: true }
      );
      setProducts(res.data.data);
    } catch (err) {
      console.error("Error searching products:", err);
    } finally {
      setSearching(false);
    }
  };
  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f9fafb, #d2ecef)",
        minHeight: "100vh",
        fontFamily: "Arial, Helvetica, sans-serif",
        pb: 6,
      }}
    >
      {" "}
      {/* Header */}{" "}
      <AppBar
        position="static"
        sx={{ backgroundColor: "rgb(90, 90, 90)", mb: 4, boxShadow: "none" }}
      >
        {" "}
        <Toolbar sx={{ justifyContent: "center" }}>
          {" "}
          <Typography
            variant="h4"
            sx={{ color: "#d8ce00", fontWeight: "bold", letterSpacing: "1px" }}
          >
            {" "}
            🛒 Shop{" "}
          </Typography>{" "}
        </Toolbar>{" "}
      </AppBar>{" "}
      <FloatingCart /> {/* Search Bar */}{" "}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 4,
          gap: 2,
        }}
      >
        {" "}
        <TextField
          variant="outlined"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            width: "340px",
            backgroundColor: "white",
            borderRadius: "8px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#555" },
              "&:hover fieldset": { borderColor: "#00dfd8" },
              "&.Mui-focused fieldset": { borderColor: "#555" },
            },
          }}
        />{" "}
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            backgroundColor: "linear-gradient(135deg, #0428a0, #00dfd8)",
            color: "#f9fafb",
            fontWeight: "bold",
            borderRadius: "8px",
            px: 3,
            py: 1,
            "&:hover": { backgroundColor: "#04508a" },
          }}
        >
          {" "}
          {searching ? "Searching..." : "Search"}{" "}
        </Button>{" "}
      </Box>{" "}
      {/* Product Grid */}{" "}
      <Grid
        container
        spacing={3}
        justifyContent="center"
        sx={{ px: { xs: 2, sm: 4, md: 6 } }}
      >
        {" "}
        {products.map((product) => {
          const discountedPrice =
            product.price - (product.price * product.discount) / 100;
          return (
            <Grid item key={product._id}>
              {" "}
              <Card
                sx={{
                  width: "300px",
                  background: "#f9fafb",
                  color: "rgb(90, 90, 90)",
                  borderRadius: "14px",
                  boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.4)",
                    background: "linear-gradient(135deg, #f9fafb, #d2ecef)",
                  },
                }}
              >
                {" "}
                <CardMedia
                  component="img"
                  height="220"
                  image={product.productImage}
                  alt={product.productName}
                  sx={{
                    borderTopLeftRadius: "14px",
                    borderTopRightRadius: "14px",
                    objectFit: "contain",
                  }}
                />{" "}
                <CardContent>
                  {" "}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      color: "#555",
                      mb: 1,
                      textAlign: "center",
                    }}
                  >
                    {" "}
                    {product.productName}{" "}
                  </Typography>{" "}
                  {/* <Typography variant="body2" sx={{ color: "#555", mb: 1, textAlign: "center", minHeight: "40px", }} > {product.description} </Typography> */}{" "}
                  {/* <Typography variant="body2" sx={{ color: "#666", mb: 0.5, textAlign: "center", }} > Category: {product.productCategory} </Typography> */}{" "}
                  <Typography
                    variant="body2"
                    sx={{ color: "#666", mb: 1, textAlign: "center" }}
                  >
                    {" "}
                    Stock: {product.stock}{" "}
                  </Typography>{" "}
                  <Typography
                    variant="body1"
                    sx={{ textAlign: "center", mb: 2 }}
                  >
                    {" "}
                    <span
                      style={{
                        textDecoration: "line-through",
                        color: "#999",
                        marginRight: "8px",
                      }}
                    >
                      {" "}
                      ₹{product.price.toFixed(2)}{" "}
                    </span>{" "}
                    <span
                      style={{ color: "rgb(6, 180, 6)", fontWeight: "bold" }}
                    >
                      {" "}
                      ₹{discountedPrice.toFixed(2)}{" "}
                    </span>{" "}
                  </Typography>{" "}
                  <Box textAlign="center">
                    {" "}
                    <Button
                      onClick={() => addToCart(product)}
                      sx={{
                        backgroundColor: "#00dfd8",
                        color: "rgb(90,90,90)",
                        fontWeight: "bold",
                        borderRadius: "8px",
                        "&:hover": {
                          backgroundColor: "#02b0aa",
                          color: "white",
                        },
                      }}
                    >
                      {" "}
                      Add to Cart{" "}
                    </Button>{" "}
                  </Box>{" "}
                </CardContent>{" "}
              </Card>{" "}
            </Grid>
          );
        })}{" "}
      </Grid>{" "}
    </Box>
  );
};
export default Shop;
