import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./VendorDashboard.module.css";
import { useUser } from "../context/UserContext.jsx";
import PasswordChangeModal from "../components/PasswordChangeModal.jsx";
import UpdateProductModal from "../components/UpdateProductModal.jsx";
import CreateProductForm from "../components/CreateProductForm";

function VendorDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  // for the products section
  const [products, setProducts] = useState([]);
  //for product modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });

  // import the userCOntext function
  const { updateProfileImage } = useUser();
  // Editable fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/users/current-user",
        { withCredentials: true }
      );
      setUser(res.data.data);
      setFormData({
        name: res.data.data.name || "",
        email: res.data.data.email || "",
        address: res.data.data.address || "",
      });
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async () => {
    try {
      const res = await axios.patch(
        "http://localhost:8000/api/v1/users/update-account",
        {
          newName: formData.name,
          newEmail: formData.email,
          newAddress: formData.address,
        },
        { withCredentials: true }
      );
      console.log(formData);
      console.log("Update response:", res.data);
      setUser((prev) => ({
        ...prev,
        name: formData.name,
        email: formData.email,
        address: formData.address,
      }));
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const res = await axios.patch(
        "http://localhost:8000/api/v1/users/profilePicture",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Upload success:", res.data);
      setUser((prev) => ({
        ...prev,
        profilePicture: res.data.data.profilePicture,
      }));
      updateProfileImage(res.data.data.profilePicture);
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
  };

  // handlers of Password Change

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/users/change-password",
        passwordForm,
        { withCredentials: true }
      );
      alert("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Failed to change password. Try again."
      );
    }
  };

  // For the products section of dashboard

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/products/getAllProducts",
        { withCredentials: true }
      );
      setProducts(res.data.data.products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!user) return <div className={styles.error}>User not found.</div>;

  return (
    <div className={styles.profileContainer}>
      <h2 className={styles.title}>Your Profile</h2>

      {/* profile section */}
      <div className={styles.profileCard}>
        <div className={styles.imageWrapper}>
          <img
            src={user.profilePicture}
            alt="Profile"
            className={styles.profileImage}
          />
          <label htmlFor="fileUpload" className={styles.editIcon}>
            ✎
          </label>
          <input
            type="file"
            id="fileUpload"
            style={{ display: "none" }}
            onChange={handleImageChange}
            accept="image/*"
          />
        </div>
        <div className={styles.infoContainer}>
          <div className={styles.info}>
            {["name", "email", "address"].map((field) => (
              <p key={field}>
                <strong>
                  {field.charAt(0).toUpperCase() + field.slice(1)}:
                </strong>{" "}
                {isEditing ? (
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className={styles.inputField}
                  />
                ) : (
                  formData[field]
                )}
              </p>
            ))}
            <p>
              <strong>Phone Number:</strong> {user.phoneNumber}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>

            <div className={styles.buttonGroup}>
              {!isEditing ? (
                <button className={styles.editBtn} onClick={handleEditToggle}>
                  Edit
                </button>
              ) : (
                <>
                  <button className={styles.saveBtn} onClick={handleUpdate}>
                    Save
                  </button>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>

            <button
              className={styles.changePasswordBtn}
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </button>
            {showPasswordModal && (
              <PasswordChangeModal
                oldPassword={passwordForm.oldPassword}
                newPassword={passwordForm.newPassword}
                onChange={handlePasswordInputChange}
                onSubmit={handleChangePassword}
                onCancel={() => setShowPasswordModal(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/** List Product section form */}
      <CreateProductForm onProductCreated={fetchProducts} />

      {/* Created Products Section */}
      <div className={styles.dashboardContainer}>
        <h2 className={styles.createdProductsTitle}>Created Products</h2>
        {products.length > 0 ? (
          <div className={styles.productList}>
            {products.map((product) => (
              <div
                key={product._id}
                className={styles.productCard}
                onClick={() => {
                  setSelectedProduct(product);
                  setShowEditModal(true);
                }}
              >
                <img
                  src={product.productImage || "/placeholder.png"}
                  alt={product.productName}
                  className={styles.productImage}
                />
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.productName}</h3>
                  <p className={styles.productDescription}>
                    {product.description}
                  </p>
                  <p className={styles.productPrice}>₹{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noProducts}>No products created yet.</p>
        )}
      </div>

      {/* Modal code */}
      {showEditModal && selectedProduct && (
        <UpdateProductModal
          product={selectedProduct}
          onClose={() => setShowEditModal(false)}
          onUpdate={() => {
            setShowEditModal(false);
            fetchProducts(); // Refresh the list
          }}
        />
      )}
    </div>
  );
}

export default VendorDashboard;
