import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import styles from "./FloatingCart.module.css";
import LocationPickerModal from "./LocationPickerModal";

const FloatingCart = () => {
  const { cartItems, addToCart, removeOneItem, removeFromCart, clearCart } =
    useCart();
  const [showCart, setShowCart] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  // for the maps
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [coordinates, setCoordinates] = useState(null);

  // for redirecting
  const navigate = useNavigate();

  const totalPrice = cartItems.reduce(
    (acc, item) =>
      acc + (item.price - (item.price * item.discount) / 100) * item.quantity,
    0
  );

  // to place order from the cart
  const handlePlaceOrder = async () => {
    if (!shippingAddress || !shippingAddress.address.trim()) {
      alert("Please enter a shipping address");
      return;
    }
    let address = shippingAddress.address;
    let latitude = shippingAddress.latitude;
    let longitude = shippingAddress.longitude;

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/order/createOrder",
        {
          address: address,
          latitude: latitude,
          longitude: longitude,
        },
        { withCredentials: true }
      );
      alert("Order placed successfully!");
      setShowCart(false);
      navigate("/payment", {
        state: {
          amount: Math.round(totalPrice), // Pass total price (rounded)
          orderId: res.data.data._id, // Optional: send orderId
        },
      });
    } catch (error) {
      console.error("Order placement failed:", error);
      alert("Failed to place order");
    }
  };

  return (
    <>
      {cartItems.length > 0 && (
        <div className={styles.cartIcon} onClick={() => setShowCart(true)}>
          🛒 {cartItems.length}
        </div>
      )}

      {showCart && (
        <div className={styles.cartPopup}>
          <h3>Your Cart</h3>
          <ul className={styles.cartList}>
            {cartItems.map((item) => (
              <li key={item._id} className={styles.cartItem}>
                <div className={styles.productName}>{item.productName}</div>
                <div className={styles.quantityControls}>
                  <button onClick={() => removeOneItem(item)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => addToCart(item)}>+</button>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item._id)}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <p>Total: ₹{totalPrice.toFixed(2)}</p>

          {/*--- For selcting address ---*/}
          <button onClick={() => setShowLocationModal(true)}>
            Select Delivery Location
          </button>
          {showLocationModal && (
            <LocationPickerModal
              onClose={() => setShowLocationModal(false)}
              onSelect={({ address, latitude, longitude }) => {
                const fullAddress = {
                  address,
                  latitude: latitude,
                  longitude: longitude,
                };
                console.log(fullAddress.latitude, fullAddress.longitude);
                setShippingAddress(fullAddress);
                setCoordinates({ latitude, longitude });
                setShowLocationModal(false);
              }}
            />
          )}

          {selectedAddress?.address && (
            <p className={styles.selectedAddress}>
              Selected Address: {shippingAddress.address}
            </p>
          )}

          {/*--- PLacing order ---*/}
          <button
            className={styles.orderBtn}
            disabled={!shippingAddress.address}
            onClick={() => handlePlaceOrder()}
          >
            Place Order
          </button>

          <button
            onClick={() => setShowCart(false)}
            className={styles.closeBtn}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
};

export default FloatingCart;
