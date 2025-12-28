import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "./UserContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { role } = useUser();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  //function to decrease product quantity in cart
  const removeOneItem = async (product) => {
    if (product.quantity === 1) {
      return removeFromCart(product._id);
    }
    try {
      await axios.post(
        "https://quick-oh.onrender.com/api/v1/cart/reduceOneItem",
        {
          productId: product._id,
        },
        { withCredentials: true }
      );

      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item._id === product._id);
        if (existingItem) {
          return prevItems.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity - 1 }
              : item
          );
        } else {
          return [...prevItems, { ...product, quantity: 1 }];
        }
      });
      console.log("reomved one item from cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to add item to cart. Please try again."
      );
    }
  };

  // function to add or increase product to your cart
  const addToCart = async (product) => {
    try {
      await axios.post(
        // "http://localhost:8000/api/v1/cart/addProductToCart",
        "https://quick-oh.onrender.com/api/v1/cart/addProductToCart",
        {
          productId: product._id,
          quantity: 1,
        },
        { withCredentials: true }
      );

      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item._id === product._id);
        if (existingItem) {
          return prevItems.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          return [...prevItems, { ...product, quantity: 1 }];
        }
      });
      console.log("added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to add item to cart. Please try again."
      );
    }
  };

  //to fetch cart on load
  const fetchCart = async () => {
    // console.log(isAuthenticated);
    if (!isAuthenticated) return;
    if (role === "deliveryPartner") return;
    try {
      const res = await axios.get(
        // "http://localhost:8000/api/v1/cart/getCartInfo",
        "https://quick-oh.onrender.com/api/v1/cart/getCartInfo",
        {
          withCredentials: true,
        }
      );

      // console.log("res from fetchCart: ", res);
      const cart = res?.data?.data?.cart;

      if (!cart || !Array.isArray(cart.items)) {
        // No cart exists yet for this user
        setCartItems([]);
        console.log("No cart found yet for this user. Initialized empty cart.");
        return;
      }

      const cartData = res.data.data.cart.items.map((item) => ({
        ...item.product,
        quantity: item.quantity,
      }));

      setCartItems(cartData);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("No cart found yet for this user.");
      } else {
        console.error("Failed to load cart:", error);
      }
      setCartItems([]);
    }
  };

  //to remove any item from cart
  const removeFromCart = async (productId) => {
    try {
      await axios.post(
        `https://quick-oh.onrender.com/api/v1/cart/removeAnItemFromCart`,
        {
          productId: productId,
        },
        {
          withCredentials: true,
        }
      );

      setCartItems((prev) => prev.filter((item) => item._id !== productId));
      console.log("Removed from cart");
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  // for clearing the cart
  const clearCart = async () => {
    if (!cartItems) return;
    try {
      const res = await axios.delete(
        // `https://localhost:8000/api/v1/cart/clearCart`,
        `https://quick-oh.onrender.com/api/v1/cart/clearCart`,
        {
          withCredentials: true,
        }
      );

      setCartItems([]);
      console.log("Cart cleared");
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeOneItem,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
