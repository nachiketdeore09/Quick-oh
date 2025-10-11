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

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogoutClick = () => {
    setShowModal(true);
    handleCloseUserMenu();
  };

  const confirmLogout = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/users/logout",
        {},
        { withCredentials: true }
      );
      console.log(res);
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

  const cancelLogout = () => {
    setShowModal(false);
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#007CF0",
        boxShadow: "none",
        px: 3,
        width: "100%",
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: "100px", // makes navbar taller
          width: "100%",
          display: "flex",
          justifyContent: "space-between", // spreads content to corners
          alignItems: "center",
        }}
      >
        <Typography
          variant="h6"
          noWrap
          component={Link}
          to="/"
          sx={{
            mr: 2,
            textDecoration: "none",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Quick-oh.
        </Typography>

        {/* Mobile Menu Icon */}
        <Box
          sx={{
            flexGrow: 1,
            display: { xs: "flex", md: "none" },
            alignItems: "center",
            gap: 2,
          }}
        >
          <IconButton size="large" onClick={handleOpenNavMenu} color="inherit">
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorElNav}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
          >
            <MenuItem onClick={handleCloseNavMenu} component={Link} to="/">
              Home
            </MenuItem>
            <MenuItem
              onClick={handleCloseNavMenu}
              component={Link}
              to={role === "deliveryPartner" ? "/active-orders" : "/shop"}
            >
              {role === "deliveryPartner" ? "Active Orders" : "Shop"}
            </MenuItem>
            <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
          </Menu>
        </Box>

        {/* Desktop Links */}
        <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, gap: 2 }}>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button
            color="inherit"
            component={Link}
            to={role === "deliveryPartner" ? "/active-orders" : "/shop"}
          >
            {role === "deliveryPartner" ? "Active Orders" : "Shop"}
          </Button>
          <Button color="inherit" onClick={handleLogoutClick}>
            Logout
          </Button>
        </Box>

        {/* Profile + Dropdown */}
        <Box sx={{ flexGrow: 0 }}>
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              {isAuthenticated && profileImage ? (
                <Avatar src={profileImage} />
              ) : (
                <Avatar />
              )}
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
            sx={{ mt: "45px" }}
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
