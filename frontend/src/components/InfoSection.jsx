import React from "react";
import { Box, Container, Grid, Card, Typography } from "@mui/material";
import {
  FlashOn,
  Verified,
  ShoppingBag,
  LocalOffer,
} from "@mui/icons-material";

const infoCards = [
  {
    title: "10-Minute Delivery",
    description: "Lightning-fast delivery right to your doorstep",
    icon: <FlashOn sx={{ fontSize: 40, color: "#00dfd8" }} />,
  },
  {
    title: "Quality Guaranteed",
    description: "100% fresh and authentic products",
    icon: <Verified sx={{ fontSize: 40, color: "#00dfd8" }} />,
  },
  {
    title: "Wide Selection",
    description: "5000+ products across all categories",
    icon: <ShoppingBag sx={{ fontSize: 40, color: "#00dfd8" }} />,
  },
  {
    title: "Best Prices",
    description: "Competitive prices with no hidden fees",
    icon: <LocalOffer sx={{ fontSize: 40, color: "#00dfd8" }} />,
  },
];

const InfoSection = () => {
  return (
    <Box
      sx={{
        width: "100%",
        py: 8,
        background: "linear-gradient(45deg, #f9fafb, #d2ecef)",
      }}
    >
      <Container>
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            mb: 6,
            background: "linear-gradient(90deg, #007cf0, #00dfd8)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Why Choose Quick-oh?
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            textAlign: "center",
            mb: 6,
            color: "text.secondary",
          }}
        >
          We're committed to making your shopping experience fast, convenient,
          and reliable
        </Typography>

        <Grid
          container
          spacing={6}
          justifyContent="center"
          alignItems="center"
          display="flex"
          flexWrap="wrap"
        >
          {infoCards.map((card) => (
            <Grid item key={card.title} xs={12} sm={6} md={3}>
              <Card
                sx={{
                  p: 3,
                  borderRadius: 4,
                  width: 280,
                  height: 260,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                  },
                }}
              >
                {card.icon}
                <Typography
                  variant="h6"
                  sx={{ mt: 2, fontWeight: "bold", color: "#333" }}
                >
                  {card.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 1, color: "text.secondary" }}
                >
                  {card.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default InfoSection;
