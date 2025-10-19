import React from "react";
import { Box, Container, Grid, Typography, IconButton } from "@mui/material";
import { Facebook, Instagram, Twitter, LinkedIn } from "@mui/icons-material";

const Footer = () => {
  return (
    <Box
      sx={{
        background: "linear-gradient(90deg, #007cf0, #00dfd8)",
        color: "white",
        mt: 10,
        py: 6,
        margin: "0",
        padding: "10px",
        position: "static",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center">
          {/* Brand Section */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
              Quick-oh
            </Typography>
            <Typography variant="body2">
              Delivering everything to your doorstep — fast, fresh, and
              reliable.
            </Typography>
          </Grid>

          {/* Links Section */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mb: 2, fontSize: "1rem" }}
            >
              Quick Links
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, cursor: "pointer" }}>
              Home
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, cursor: "pointer" }}>
              Shop
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, cursor: "pointer" }}>
              About Us
            </Typography>
            <Typography variant="body2" sx={{ cursor: "pointer" }}>
              Contact
            </Typography>
          </Grid>

          {/* Support Section */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mb: 2, fontSize: "1rem" }}
            >
              Support
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              FAQs
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Terms & Conditions
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Privacy Policy
            </Typography>
            <Typography variant="body2">Help Center</Typography>
          </Grid>

          {/* Social Media Section */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mb: 2, fontSize: "1rem" }}
            >
              Follow Us
            </Typography>
            <Box>
              <IconButton
                color="inherit"
                sx={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  mr: 1,
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
                }}
              >
                <Facebook />
              </IconButton>
              <IconButton
                color="inherit"
                sx={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  mr: 1,
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
                }}
              >
                <Instagram />
              </IconButton>
              <IconButton
                color="inherit"
                sx={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  mr: 1,
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
                }}
              >
                <Twitter />
              </IconButton>
              <IconButton
                color="inherit"
                sx={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
                }}
              >
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Section */}
        <Box
          sx={{
            textAlign: "center",
            borderTop: "1px solid rgba(255,255,255,0.3)",
            mt: 5,
            pt: 3,
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} Quick-oh. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
