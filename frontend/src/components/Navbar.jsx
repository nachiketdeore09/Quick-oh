import { useEffect, useState } from "react";
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
import LogoutModal from "./Modals/Logout-Popup";
import { useUser } from "../context/UserContext";
import axios from "axios";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import Popover from "@mui/material/Popover";
import moment from "moment";

function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const { profileImage, updateProfileImage, role, updateRole } = useUser();
  const [anchorElBell, setAnchorElBell] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [hasNewOrder, setHasNewOrder] = useState(false);

  const handleOpenNavMenu = (e) => setAnchorElNav(e.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleOpenUserMenu = (e) => setAnchorElUser(e.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  useEffect(() => {
    if (isAuthenticated) fetchUserOrders();
  }, [isAuthenticated]);

  const fetchUserOrders = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/order/getUserOrderHistory",
        {
          withCredentials: true,
        }
      );

      const orders = res.data.data || [];
      if (orders.length === 0) {
        setCurrentOrder(null);
        return;
      }

      // Find the latest non-completed order
      const activeOrder = orders.find(
        (order) =>
          order.status !== "Completed" &&
          order.status !== "Delivered" &&
          order.status !== "Cancelled"
      );

      if (activeOrder) {
        setCurrentOrder(activeOrder);
        setHasNewOrder(true);
      } else {
        setCurrentOrder(null);
      }
    } catch (error) {
      console.error("Error fetching user orders:", error);
    }
  };

  const handleBellClick = (event) => {
    setAnchorElBell(event.currentTarget);
    setHasNewOrder(false);
  };

  const handleLogoutClick = () => {
    setShowModal(true);
    handleCloseUserMenu();
  };

  const handleBellClose = () => setAnchorElBell(null);

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
          {/* {reminder bell button} */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              mr: 1,
            }}
          >
            <IconButton color="inherit" onClick={handleBellClick}>
              <Badge color="error" variant={hasNewOrder ? "dot" : "standard"}>
                <NotificationsIcon sx={{ color: "white" }} />
              </Badge>
            </IconButton>

            <Popover
              open={Boolean(anchorElBell)}
              anchorEl={anchorElBell}
              onClose={handleBellClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
              PaperProps={{
                sx: { p: 2, minWidth: 220 },
              }}
            >
              {currentOrder ? (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Current Order
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Order ID:{" "}
                    <span style={{ color: "#007cf0", fontWeight: 500 }}>
                      {currentOrder._id.slice(-6)}
                    </span>
                  </Typography>
                  <Typography variant="body2">
                    Status:{" "}
                    <b
                      style={{
                        color:
                          currentOrder.status === "Preparing"
                            ? "#f57c00"
                            : currentOrder.status === "Out for Delivery"
                            ? "#0288d1"
                            : "#43a047",
                      }}
                    >
                      {currentOrder.status}
                    </b>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {moment(currentOrder.createdAt).fromNow()}
                  </Typography>
                  <Button
                    fullWidth
                    size="small"
                    sx={{ mt: 1, textTransform: "none" }}
                    onClick={() => {
                      handleBellClose();
                      navigate(`/delivery-details/${currentOrder._id}`);
                    }}
                  >
                    View Details
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ textAlign: "center" }}>
                  💤 No current orders
                </Typography>
              )}
            </Popover>
          </Box>
        </Box>

        {/* 🔔 Reminder Bell */}
        {/* <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            mr: 1,
          }}
        >
          <IconButton color="inherit" onClick={handleBellClick}>
            <Badge color="error" variant={hasNewOrder ? "dot" : "standard"}>
              <NotificationsIcon sx={{ color: "white" }} />
            </Badge>
          </IconButton>

          <Popover
            open={Boolean(anchorElBell)}
            anchorEl={anchorElBell}
            onClose={handleBellClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            PaperProps={{
              sx: { p: 2, minWidth: 220 },
            }}
          >
            {currentOrder ? (
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Current Order
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Order ID:{" "}
                  <span style={{ color: "#007cf0", fontWeight: 500 }}>
                    {currentOrder._id.slice(-6)}
                  </span>
                </Typography>
                <Typography variant="body2">
                  Status:{" "}
                  <b
                    style={{
                      color:
                        currentOrder.status === "Preparing"
                          ? "#f57c00"
                          : currentOrder.status === "Out for Delivery"
                          ? "#0288d1"
                          : "#43a047",
                    }}
                  >
                    {currentOrder.status}
                  </b>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {moment(currentOrder.createdAt).fromNow()}
                </Typography>
                <Button
                  fullWidth
                  size="small"
                  sx={{ mt: 1, textTransform: "none" }}
                  onClick={() => {
                    handleBellClose();
                    navigate(`/delivery-details/${currentOrder._id}`);
                  }}
                >
                  View Details
                </Button>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ textAlign: "center" }}>
                💤 No current orders
              </Typography>
            )}
          </Popover>
        </Box> */}

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
