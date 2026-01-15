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

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const { cartItems, addToCart, removeOneItem, removeFromCart } = useCart();
  const [openCart, setOpenCart] = useState(false);
  const [categories, setCategories] = useState([]);

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
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/category/getAllCategories",
          // "https://quick-oh.onrender.com/api/v1/category/getAllCategories",
          { withCredentials: true }
        );
        console.log(response.data.data);
        setCategories(response.data.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchProducts();
    fetchCategories();
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

  const getQuantity = (productId) => {
    const item = cartItems.find((item) => item._id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <Box sx={{ backgroundColor: "#f7f7f7", minHeight: "100vh", pb: 6 }}>
      {/* 🔶 HERO BANNER */}
      <Box
        sx={{
          mx: { xs: 2, md: 6 },
          mt: 3,
          mb: 4,
          p: { xs: 3, md: 4 },
          borderRadius: "20px",
          background: "linear-gradient(90deg, #007cf0, #00dfd8)",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
        // linear-gradient(90deg, #007cf0, #00dfd8)
        // linear-gradient(90deg, #b4ec51 0%, #f6d365 100%)
      >
        <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
          ⚡ LIGHTNING FAST DELIVERY
        </Typography>

        <Typography sx={{ fontSize: "36px", fontWeight: 800 }}>
          Groceries delivered in{" "}
          <span style={{ textDecoration: "underline" }}>10 minutes</span>
        </Typography>

        <Typography sx={{ fontSize: "16px", maxWidth: "600px" }}>
          Fresh fruits, vegetables, dairy and more delivered instantly to your
          doorstep.
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Box
            sx={{
              px: 2,
              py: 1,
              borderRadius: "999px",
              backgroundColor: "rgba(0,0,0,0.15)",
              fontSize: "14px",
            }}
          >
            ⏱ 10–15 min delivery
          </Box>
          <Box
            sx={{
              px: 2,
              py: 1,
              borderRadius: "999px",
              backgroundColor: "rgba(0,0,0,0.15)",
              fontSize: "14px",
            }}
          >
            🚚 Free delivery above ₹199
          </Box>
        </Box>
      </Box>

      {/* 🔍 SEARCH */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mb: 4,
        }}
      >
        <TextField
          placeholder="Search for fruits, milk, snacks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            width: "360px",
            backgroundColor: "white",
            borderRadius: "12px",
          }}
        />
        <Button
          onClick={handleSearch}
          sx={{
            px: 4,
            borderRadius: "12px",
            backgroundColor: "#0c831f",
            color: "white",
            fontWeight: 700,
            "&:hover": { backgroundColor: "#086618" },
          }}
        >
          {searching ? "Searching..." : "Search"}
        </Button>
      </Box>

      {/* 🟢 CATEGORY STRIP */}
      <Box sx={{ px: { xs: 2, md: 6 }, mb: 4 }}>
        <Typography
          sx={{
            fontSize: "22px",
            fontWeight: 700,
            mb: 2,
          }}
        >
          Shop by Category
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            pb: 1,
          }}
        >
          {categories.map((cat) => (
            <Box
              key={cat._id}
              sx={{
                minWidth: "140px",
                height: "170px",
                backgroundColor: "white",
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#007cf0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
              }}
            >
              {/* CATEGORY IMAGE */}
              <Box
                sx={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  mb: 1.5,
                  backgroundColor: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={cat.categoryImage}
                  alt={cat.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>

              {/* CATEGORY NAME */}
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 600,
                  textAlign: "center",
                  px: 1,
                  lineHeight: "18px",
                }}
              >
                {cat.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* 🛍 PRODUCT GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(4, 1fr)",
            lg: "repeat(6, 1fr)",
          },
          gap: "16px",
          px: { xs: 2, md: 6 },
        }}
      >
        {products.map((product) => {
          const discountedPrice =
            product.price - (product.price * product.discount) / 100;
          const quantity = getQuantity(product._id);
          return (
            <Card
              sx={{
                borderRadius: "16px",
                backgroundColor: "white",
                height: "320px",
                display: "flex",
                border: "1px solid #bfbfc4ff",
                flexDirection: "column",
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                "&:hover .product-image": {
                  transform: "scale(1.08)",
                },
              }}
            >
              {/* IMAGE SECTION */}
              <Box
                sx={{
                  height: "180px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {product.discount > 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      px: 1.5,
                      py: 0.5,
                      fontSize: "12px",
                      fontWeight: 700,
                      backgroundColor: "#ff9f1c",
                      color: "black",
                      borderRadius: "999px",
                      zIndex: 2,
                    }}
                  >
                    {product.discount}% OFF
                  </Box>
                )}

                <CardMedia
                  component="img"
                  image={product.productImage}
                  alt={product.productName}
                  className="product-image"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                  }}
                />
              </Box>

              {/* CONTENT SECTION */}
              <CardContent
                sx={{
                  flexGrow: 1,
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* QUANTITY */}
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "#777",
                    mb: 0.5,
                  }}
                >
                  {product.stock} in stock
                </Typography>

                {/* PRODUCT NAME */}
                <Typography
                  sx={{
                    fontSize: "15px",
                    fontWeight: 600,
                    lineHeight: "20px",
                    height: "40px",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {product.productName}
                </Typography>

                {/* PRICE + ADD */}
                <Box
                  sx={{
                    mt: "auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "16px" }}>
                      ₹{discountedPrice.toFixed(0)}
                    </Typography>

                    {product.discount > 0 && (
                      <Typography
                        sx={{
                          fontSize: "13px",
                          color: "#999",
                          textDecoration: "line-through",
                        }}
                      >
                        ₹{product.price.toFixed(0)}
                      </Typography>
                    )}
                  </Box>

                  {quantity === 0 ? (
                    /* ADD BUTTON */
                    <Button
                      onClick={() => addToCart(product)}
                      sx={{
                        minWidth: "72px",
                        height: "36px",
                        fontSize: "14px",
                        fontWeight: 700,
                        borderRadius: "10px",
                        backgroundColor: "#a3e635",
                        color: "#1a1a1a",
                        "&:hover": {
                          backgroundColor: "#84cc16",
                        },
                      }}
                    >
                      ADD
                    </Button>
                  ) : (
                    /* QUANTITY STEPPER */
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#a3e635",
                        borderRadius: "10px",
                        height: "36px",
                        minWidth: "96px",
                        justifyContent: "space-between",
                        px: 1,
                      }}
                    >
                      <Button
                        onClick={() =>
                          quantity == 1
                            ? removeFromCart(product._id)
                            : removeOneItem(product)
                        }
                        sx={{
                          minWidth: "28px",
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "#1a1a1a",
                        }}
                      >
                        −
                      </Button>

                      <Typography sx={{ fontWeight: 700 }}>
                        {quantity}
                      </Typography>

                      <Button
                        onClick={() => addToCart(product)}
                        sx={{
                          minWidth: "28px",
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "#1a1a1a",
                        }}
                      >
                        +
                      </Button>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};
export default Shop;
