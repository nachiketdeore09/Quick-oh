// EditProductModal.jsx
import React, { useState } from "react";
import styles from "./UpdateProductModal.module.css";
import axios from "axios";

function EditProductModal({ product, onClose, onUpdate }) {
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState({
    productName: product.productName,
    description: product.description,
    productCategory: product.productCategory,
    price: product.price,
    discount: product.discount,
    stock: product.stock || "Available",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async () => {
    try {
      const res = await axios.put(
        `http://localhost:8000/api/v1/products/updateProduct/${product._id}`,
        formData,
        {
          withCredentials: true,
        }
      );
      console.log("Product updated:", res.data);
      onUpdate(res.data.data); // callback to refresh UI
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  // for image update function
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("productImage", file);
    setImageUploading(true);

    try {
      const res = await axios.put(
        `http://localhost:8000/api/v1/products/updateProductImage/${product._id}`,
        uploadData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Product image updated successfully.");
      onUpdate(res.data.data); // refresh updated image in parent
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Image update failed.");
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Edit Product</h2>

        {/* Product Image and Upload */}
        <div className={styles.imageSection}>
          <img
            src={product.productImage || "/placeholder.png"}
            alt="Product"
            className={styles.previewImage}
          />
          <label className={styles.imageUploadLabel}>
            Change Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className={styles.hiddenInput}
              disabled={imageUploading}
            />
          </label>
        </div>
        <p>Product Name</p>
        <input
          type="text"
          name="productName"
          value={formData.productName}
          onChange={handleChange}
          placeholder="Product Name"
        />
        <p>Product Description</p>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
        />
        <p>Category</p>
        <input
          type="text"
          name="productCategory"
          value={formData.productCategory}
          onChange={handleChange}
          placeholder="Product Category"
        />
        <p>Price</p>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price"
        />
        <p>Discount</p>
        <input
          type="number"
          name="discount"
          value={formData.discount}
          onChange={handleChange}
          placeholder="Discount"
        />
        <p>Stock</p>
        <select
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          className={styles.selectField}
        >
          <option value="Available">Available</option>
          <option value="Out Of Stock">Out Of Stock</option>
          <option value="Very Few Remaining">Very Few Remaining</option>
        </select>

        <div className={styles.buttonGroup}>
          <button onClick={handleUpdate} className={styles.saveBtn}>
            Save
          </button>
          <button onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProductModal;
