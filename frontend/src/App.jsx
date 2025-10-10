import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Navbar from "./components/Navbar.jsx";
import Register from "./pages/Register";
import Login from "./pages/Login.jsx";
import Shop from "./pages/Shop.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Profile from "./pages/Profile.jsx";
import VendorLogin from "./pages/VendorLogin.jsx";
import VendorDashboard from "./pages/VendorDashboard.jsx";
import Orders from "./pages/Order.jsx";
import DeliveryPartnerLogin from "./pages/DeliveryPartnerLogin.jsx";
import ActiveOrders from "./pages/ActiveOrders.jsx";
import DeliveryDetails from "./pages/DeliveryDetails.jsx";
import { ToastContainer } from "react-toastify";
import PaymentPage from "./pages/PaymentPage";

function App() {
  return (
    <Router>
      <ToastContainer />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/shop"
          element={
            <ProtectedRoute>
              <Shop />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/vendor/Dashboard" element={<VendorDashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/delivery-login" element={<DeliveryPartnerLogin />} />
        <Route path="/active-orders" element={<ActiveOrders />} />
        <Route
          path="/delivery-details/:orderId"
          element={<DeliveryDetails />}
        />
        <Route path="/payment" element={<PaymentPage />} />
        {/* <Route path="/delivery-dashboard" element={} /> */}
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
