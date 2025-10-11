import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Shop.module.css";
import FloatingCart from "../components/FloatingCart.jsx";
import { useCart } from "../context/CartContext.jsx";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);

  // using the cart context
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/products/getAllProducts",
          {
            withCredentials: true,
          }
        );
        console.log(res);
        setProducts(res.data.data.products);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  // for handling the search
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      setSearching(true);
      const res = await axios.get(
        `http://localhost:8000/api/v1/products/searchProducts?keyword=${searchTerm}&page=1&limit=20`,
        { withCredentials: true }
      );
      setProducts(res.data.data); // API returns array directly in `data`
    } catch (err) {
      console.error("Error searching products:", err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className={styles.shopContainer}>
      <h1 className={styles.title}>Shop</h1>
      <FloatingCart />
      <div className={styles.searchBar}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
          className={styles.searchInput}
        />
        <button onClick={handleSearch} className={styles.searchButton}>
          {searching ? "Searching..." : "Search"}
        </button>
      </div>

      <div className={styles.productsGrid}>
        {products.map((product) => {
          const discountedPrice =
            product.price - (product.price * product.discount) / 100;
          return (
            <div key={product._id} className={styles.productCard}>
              <img
                src={product.productImage}
                alt={product.productName}
                className={styles.productImage}
              />
              <h3 className={styles.productTitle}>{product.productName}</h3>
              <p className={styles.productDescription}>{product.description}</p>
              <p className={styles.productCategory}>
                Category: {product.productCategory}
              </p>
              <p className={styles.productStock}>Stock: {product.stock}</p>
              <p className={styles.productPrice}>
                <span className={styles.originalPrice}>
                  ${product.price.toFixed(2)}
                </span>
                <span className={styles.discountedPrice}>
                  {" "}
                  ${discountedPrice.toFixed(2)}
                </span>
              </p>
              <button
                className={styles.buyButton}
                onClick={() => addToCart(product)}
              >
                Add to Cart
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Shop;
