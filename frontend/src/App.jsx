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
import CustomerOrderDetails from "./pages/CustomerOrderDetails.jsx";
import { ToastContainer } from "react-toastify";
import Footer from "./components/Footer.jsx";
import DeliveryPartnerOrderDetails from "./pages/DeliveryPartnerOrderDetails.jsx";
import CartPage from "./pages/cartPage.jsx";
import FloatingCart from "./components/FloatingCart.jsx";
import "./App.css";

function App() {
  const [openCart, setOpenCart] = useState(false);
  return (
    <Router>
      <div className="App">
        <ToastContainer />
        <Navbar onCartClick={() => setOpenCart(true)} />
        {/* ✅ Global cart popup */}
        {/* <FloatingCart openCart={openCart} setOpenCart={setOpenCart} /> */}
        <main className="content">
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
              path="/customer-delivery-details/:orderId"
              element={<CustomerOrderDetails />}
            />
            <Route path="/delivery-dashboard" element={<Profile />} />
            <Route
              path="/deliveryPartner-delivery-details/:orderId"
              element={<DeliveryPartnerOrderDetails />}
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />

            {/* Add more routes as needed */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
