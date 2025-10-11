// src/components/CreateProductForm.jsx
import React, { useState } from "react";
import styles from "./CreateProductForm.module.css";
import axios from "axios";

function CreateProductForm({ onProductCreated }) {
  const [newProduct, setNewProduct] = useState({
    productName: "",
    description: "",
    productCategory: "",
    price: "",
    discount: "",
    stock: "",
    image: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("productName", newProduct.productName);
    formData.append("description", newProduct.description);
    formData.append("productCategory", newProduct.productCategory);
    formData.append("price", newProduct.price);
    formData.append("discount", newProduct.discount || 0);
    formData.append("stock", newProduct.stock);
    if (newProduct.image) {
      formData.append("productImage", newProduct.image);
    } else {
      alert("Please give an Image of Product");
    }

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/products/createProduct",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Product created successfully!");
      setNewProduct({
        productName: "",
        description: "",
        productCategory: "",
        price: "",
        discount: "",
        stock: "",
        image: null,
      });
      if (onProductCreated) onProductCreated(); // trigger refresh
    } catch (error) {
      alert(
        error?.response?.data?.message || "Failed to create product. Try again."
      );
    }
  };

  return (
    <div className={styles.createProductSection}>
      <h2 className={styles.createProductTitle}>Create New Product</h2>
      <form className={styles.createProductForm} onSubmit={handleSubmit}>
        <input
          type="text"
          name="productName"
          placeholder="Product Name"
          value={newProduct.productName}
          onChange={(e) =>
            setNewProduct({ ...newProduct, productName: e.target.value })
          }
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
          required
        />
        <input
          type="text"
          name="productCategory"
          placeholder="Category"
          value={newProduct.productCategory}
          onChange={(e) =>
            setNewProduct({ ...newProduct, productCategory: e.target.value })
          }
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: e.target.value })
          }
          required
        />
        <input
          type="number"
          name="discount"
          placeholder="Discount"
          value={newProduct.discount}
          onChange={(e) =>
            setNewProduct({ ...newProduct, discount: e.target.value })
          }
        />
        <input
          type="text"
          name="stock"
          placeholder="Stock"
          value={newProduct.stock}
          onChange={(e) =>
            setNewProduct({ ...newProduct, stock: e.target.value })
          }
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setNewProduct({ ...newProduct, image: e.target.files[0] })
          }
          required
        />

        <button type="submit" className={styles.createBtn}>
          Create Product
        </button>
      </form>
    </div>
  );
}

export default CreateProductForm;
