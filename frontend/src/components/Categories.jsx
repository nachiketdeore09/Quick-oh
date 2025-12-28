import React, { useEffect, useState } from "react";
import {
  Card,
  CardActionArea,
  CardMedia,
  Typography,
  Grid,
  Container,
  Box,
} from "@mui/material";
import axios from "axios";

const Categories = () => {
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        // "http://localhost:8000/api/v1/category/getAllCategories"
        "https://quick-oh.onrender.com/api/v1/category/getAllCategories"
      );
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);
  // linear-gradient(135deg, #007cf0, #00dfd8)
  return (
    <Box
      sx={{
        width: "100%",
        background: "#07d6ed",
        py: 7,
      }}
    >
      <Container>
        <Typography
          variant="h3"
          component="h2"
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            mb: 6,
            background: "#f9fafb",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Explore Categories
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {categories.map((cat) => (
            <Grid item key={cat.name} xs={12} sm={6} md={3}>
              <Card
                sx={{
                  width: 260,
                  height: 270,
                  mx: "auto",
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                  },
                }}
              >
                <CardActionArea sx={{ position: "relative", height: 270 }}>
                  <CardMedia
                    component="img"
                    image={cat.categoryImage}
                    alt={cat.name}
                    sx={{
                      height: "100%",
                      width: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      bgcolor: "rgba(0,0,0,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "1.2rem",
                        textAlign: "center",
                        textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                      }}
                    >
                      {cat.name}
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Categories;
