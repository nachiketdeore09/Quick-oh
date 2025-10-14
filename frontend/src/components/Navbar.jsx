import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Tooltip,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutModal from "./Logout-Popup";
import { useUser } from "../context/UserContext";
import axios from "axios";

function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const { profileImage, updateProfileImage, role, updateRole } = useUser();

  const handleOpenNavMenu = (e) => setAnchorElNav(e.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleOpenUserMenu = (e) => setAnchorElUser(e.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogoutClick = () => {
    setShowModal(true);
    handleCloseUserMenu();
  };

  const confirmLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/v1/users/logout",
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("isAuthenticated");
      updateProfileImage("");
      updateRole("");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setShowModal(false);
    }
  };

  const cancelLogout = () => setShowModal(false);

  return (
    <AppBar
      position="sticky"
      sx={{
        background: "linear-gradient(90deg, #007cf0, #00dfd8)",
        boxShadow: "0px 4px 15px rgba(0,0,0,0.2)",
        px: { xs: 2, md: 6 },
        py: 1,
        zIndex: 1300,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* 🛍️ Brand Logo */}
        <Typography
          variant="h5"
          component={Link}
          to="/"
          sx={{
            textDecoration: "none",
            color: "white",
            fontWeight: "bold",
            letterSpacing: "1px",
            "&:hover": {
              color: "#f4f4f4",
              textShadow: "0px 0px 8px rgba(255,255,255,0.6)",
            },
            transition: "all 0.3s ease",
          }}
        >
          Quick-oh<span style={{ color: "#fffb00" }}>.</span>
        </Typography>

        {/* 📱 Mobile Menu */}
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton
            size="large"
            onClick={handleOpenNavMenu}
            color="inherit"
            sx={{
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.1)" },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorElNav}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{ mt: 1 }}
          >
            <MenuItem component={Link} to="/" onClick={handleCloseNavMenu}>
              Home
            </MenuItem>
            <MenuItem
              component={Link}
              to={role === "deliveryPartner" ? "/active-orders" : "/shop"}
              onClick={handleCloseNavMenu}
            >
              {role === "deliveryPartner" ? "Active Orders" : "Shop"}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
          </Menu>
        </Box>

        {/* 💻 Desktop Menu */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            gap: 3,
            alignItems: "center",
          }}
        >
          {[
            { label: "Home", to: "/" },
            {
              label: role === "deliveryPartner" ? "Active Orders" : "Shop",
              to: role === "deliveryPartner" ? "/active-orders" : "/shop",
            },
          ].map((item) => (
            <Button
              key={item.label}
              component={Link}
              to={item.to}
              sx={{
                color: "white",
                fontWeight: 500,
                textTransform: "capitalize",
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 0,
                  height: "2px",
                  background: "#fff",
                  transition: "width 0.3s ease",
                },
                "&:hover::after": { width: "80%" },
              }}
            >
              {item.label}
            </Button>
          ))}

          <Button
            onClick={handleLogoutClick}
            sx={{
              color: "#fffb00",
              fontWeight: 600,
              textTransform: "capitalize",
              "&:hover": {
                color: "white",
                background: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Logout
          </Button>
        </Box>

        {/* 👤 Profile Dropdown */}
        <Box>
          <Tooltip title="Profile settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar
                src={isAuthenticated && profileImage ? profileImage : ""}
                alt="Profile"
                sx={{
                  border: "2px solid white",
                  transition: "transform 0.3s",
                  "&:hover": { transform: "scale(1.1)" },
                }}
              />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
            sx={{ mt: 1.5 }}
          >
            {!isAuthenticated ? (
              <MenuItem
                onClick={handleCloseUserMenu}
                component={Link}
                to="/login"
              >
                Login
              </MenuItem>
            ) : role === "vendor" ? (
              <MenuItem
                onClick={handleCloseUserMenu}
                component={Link}
                to="/vendor/dashboard"
              >
                Vendor Dashboard
              </MenuItem>
            ) : role === "deliveryPartner" ? (
              <MenuItem
                onClick={handleCloseUserMenu}
                component={Link}
                to="/delivery-dashboard"
              >
                Delivery Dashboard
              </MenuItem>
            ) : (
              <MenuItem
                onClick={handleCloseUserMenu}
                component={Link}
                to="/profile"
              >
                Profile
              </MenuItem>
            )}

            <Divider />
            <MenuItem
              onClick={handleCloseUserMenu}
              component={Link}
              to="/vendor/login"
            >
              Vendor Login
            </MenuItem>
            <MenuItem
              onClick={handleCloseUserMenu}
              component={Link}
              to="/delivery-login"
            >
              Delivery Login
            </MenuItem>
          </Menu>
        </Box>

        {showModal && (
          <LogoutModal onConfirm={confirmLogout} onCancel={cancelLogout} />
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
