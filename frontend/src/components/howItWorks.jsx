import { Box, Container, Typography, Grid } from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";

const steps = [
  {
    id: 1,
    title: "Browse & Select",
    description: "Choose from 5000+ products across categories",
    icon: ShoppingBagOutlinedIcon,
  },
  {
    id: 2,
    title: "Quick Checkout",
    description: "Pay securely with multiple payment options",
    icon: VerifiedUserOutlinedIcon,
  },
  {
    id: 3,
    title: "Track in Real-time",
    description: "Watch your order move towards you live",
    icon: LocationOnOutlinedIcon,
  },
  {
    id: 4,
    title: "Receive at Door",
    description: "Get delivery in 10 minutes or less",
    icon: LocalShippingOutlinedIcon,
  },
];

const HowItWorks = () => {
  return (
    <Box
      sx={{
        py: { xs: 10, md: 14 },
        background: `
          linear-gradient(
            180deg,
            #f9fafb 0%,
            #f0fdf4 50%,
            #ffffff 100%
          )
        `,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box textAlign="center" mb={10}>
          <Box
            sx={{
              display: "inline-block",
              px: 3,
              py: 1,
              borderRadius: 999,
              background: "rgba(0, 223, 216, 0.12)",
              color: "#007cf0",
              fontWeight: 600,
              fontSize: "0.9rem",
              mb: 2,
            }}
          >
            Simple Process
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 2,
              background: "linear-gradient(135deg, #007cf0 0%, #00dfd8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            How It Works
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "1.1rem",
              maxWidth: 480,
              mx: "auto",
            }}
          >
            Get your groceries in 4 simple steps
          </Typography>
        </Box>

        {/* Steps */}
        <Box sx={{ position: "relative" }}>
          {/* Connecting Line */}
          <Box
            sx={{
              position: "absolute",
              top: 88,
              left: "6%",
              right: "6%",
              height: 3,
              background: "linear-gradient(90deg, #00dfd8 0%, #007cf0 100%)",
              display: { xs: "none", md: "block" },
              zIndex: 0,
            }}
          />

          <Grid
            container
            spacing={4}
            justifyContent="space-between"
            alignItems="flex-start"
          >
            {steps.map((step) => (
              <Grid item xs={12} md={3} key={step.id}>
                <Box
                  sx={{
                    textAlign: "center",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {/* Icon */}
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      mx: "auto",
                      mb: 3,
                      borderRadius: "50%",
                      background: "#ffffff",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {/* Step Number */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #007cf0 0%, #00dfd8 100%)",
                        color: "#fff",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.9rem",
                      }}
                    >
                      {step.id}
                    </Box>

                    <step.icon sx={{ fontSize: 42, color: "#00dfd8" }} />
                  </Box>

                  {/* Text */}
                  <Typography fontWeight={700} fontSize="1.1rem" mb={1}>
                    {step.title}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    fontSize="0.95rem"
                    sx={{ maxWidth: 220, mx: "auto" }}
                  >
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorks;
