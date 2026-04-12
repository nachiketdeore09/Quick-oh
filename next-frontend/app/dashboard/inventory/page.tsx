"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { productService, adminProductService } from "@/services/services";
import { Product, Category } from "@/types";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  RefreshCcw, 
  X, 
  Upload, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InventoryDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    price: "",
    discount: "0",
    stock: "Available",
    productCategory: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth Protection
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== "admin" && user?.role !== "vendor"))) {
      toast.error("Access denied. Admin/Vendor only.");
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Initial Fetch
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodResp, catResp] = await Promise.all([
        productService.getAllProducts(1, 100),
        productService.getAllCategories()
      ]);
      setProducts(prodResp.data.products);
      setCategories(catResp.data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      productName: "",
      description: "",
      price: "",
      discount: "0",
      stock: "Available",
      productCategory: categories[0]?.name || "",
    });
    setSelectedImage(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName,
      description: product.description,
      price: product.price.toString(),
      discount: product.discount.toString(),
      stock: product.stock,
      productCategory: product.productCategory,
    });
    setSelectedImage(null);
    setImagePreview(product.productImage);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (selectedImage) {
        data.append("productImage", selectedImage);
      }

      if (editingProduct) {
        // Update product details
        await adminProductService.updateProduct(editingProduct._id, formData);
        
        // If image changed, update picture separately
        if (selectedImage) {
          const imgData = new FormData();
          imgData.append("productImage", selectedImage);
          await adminProductService.updateProductImage(editingProduct._id, imgData);
        }
        toast.success("Product updated successfully");
      } else {
        // Create new product
        if (!selectedImage) {
          toast.error("Product image is required");
          setSubmitting(false);
          return;
        }
        await adminProductService.createProduct(data);
        toast.success("Product created successfully");
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await adminProductService.deleteProduct(id);
      toast.success("Product deleted");
      setProducts(products.filter(p => p._id !== id));
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleToggleStock = async (id: string, currentStock: string) => {
    const nextStock = currentStock === "Available" ? "Out Of Stock" : "Available";
    try {
      await adminProductService.toggleStock(id, nextStock);
      setProducts(products.map(p => p._id === id ? { ...p, stock: nextStock } : p));
      toast.success(`Stock marked as ${nextStock}`);
    } catch (error) {
      toast.error("Failed to update stock");
    }
  };

  const filteredProducts = products.filter(p => 
    p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.productCategory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || !user) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col pt-16 md:pt-20">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Package className="text-[#007cf0]" /> Inventory Management
            </h1>
            <p className="text-gray-500 mt-1">Manage your shop catalog and stock levels</p>
          </div>
          
          <button 
            onClick={openAddModal}
            className="bg-gradient-to-r from-[#007cf0] to-[#00dfd8] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-[#007cf0]/20 flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" /> Add New Item
          </button>
        </section>

        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search products by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#007cf0]/50 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchData} 
              className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition group"
              title="Refresh Data"
            >
              <RefreshCcw className="w-5 h-5 text-gray-500 group-active:rotate-180 transition-transform duration-500" />
            </button>
            <button className="flex items-center gap-2 px-5 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-medium text-gray-600 dark:text-gray-300">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="h-[380px] bg-white dark:bg-gray-900 rounded-3xl animate-pulse border border-gray-100 dark:border-gray-800" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                >
                  {/* Image Holder */}
                  <div className="relative aspect-square bg-gray-50 dark:bg-gray-800/50 p-6 flex items-center justify-center">
                    <img 
                      src={product.productImage} 
                      alt={product.productName}
                      className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                      <button 
                        onClick={() => openEditModal(product)}
                        className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg hover:bg-white dark:hover:bg-gray-700 text-[#007cf0]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product._id)}
                        className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg hover:bg-red-50 dark:hover:bg-red-600 hover:text-white text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className={cn(
                        "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md",
                        product.stock === "Available" 
                          ? "bg-green-500/10 text-green-600 border border-green-500/20" 
                          : "bg-red-500/10 text-red-600 border border-red-500/20"
                      )}>
                        {product.stock}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-bold text-[#007cf0] uppercase tracking-widest">{product.productCategory}</span>
                       <span className="text-lg font-bold">₹{product.price}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 mb-4">{product.productName}</h3>
                    
                    <button 
                      onClick={() => handleToggleStock(product._id, product.stock)}
                      className={cn(
                        "w-full py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2",
                        product.stock === "Available"
                          ? "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100"
                          : "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/40 text-[#007cf0] hover:bg-blue-100"
                      )}
                    >
                      {product.stock === "Available" ? <X className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Mark as {product.stock === "Available" ? "Out Of Stock" : "Available"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[40px] border border-dashed border-gray-200 dark:border-gray-800">
            <Package className="w-16 h-16 text-gray-200 dark:text-gray-800 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or add a new item.</p>
          </div>
        )}
      </main>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 md:p-8 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-2xl font-bold">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                  <X />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 overflow-y-auto max-h-[70vh] space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Image */}
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Product Image</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-[#007cf0] transition-colors relative overflow-hidden group"
                    >
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-4" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="text-white w-8 h-8" />
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-300 mb-2" />
                          <span className="text-xs text-gray-500">Upload Image</span>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      className="hidden" 
                      accept="image/*" 
                    />
                  </div>

                  {/* Right Column: Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Product Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.productName}
                        onChange={e => setFormData({...formData, productName: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#007cf0]/50"
                        placeholder="e.g. Fresh Organic Apples"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Category</label>
                      <select 
                        required
                        value={formData.productCategory}
                        onChange={e => setFormData({...formData, productCategory: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#007cf0]/50"
                      >
                        {categories.map(cat => (
                          <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-1">Price (₹)</label>
                        <input 
                          required
                          type="number" 
                          value={formData.price}
                          onChange={e => setFormData({...formData, price: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#007cf0]/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Discount (%)</label>
                        <input 
                          type="number" 
                          value={formData.discount}
                          onChange={e => setFormData({...formData, discount: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#007cf0]/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Initial Stock</label>
                      <select 
                        value={formData.stock}
                        onChange={e => setFormData({...formData, stock: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#007cf0]/50"
                      >
                        <option value="Available">Available</option>
                        <option value="Out Of Stock">Out Of Stock</option>
                        <option value="Very Few Remaining">Low Stock</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Description</label>
                  <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#007cf0]/50 resize-none"
                    placeholder="Describe the product features, quantity, origins..."
                  ></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-[#007cf0] to-[#00dfd8] text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> {editingProduct ? "Update Product" : "Save Product"}</>}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

// Utility function (if not available globally)
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
