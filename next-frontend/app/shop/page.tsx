"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { productService } from "@/services/services";
import { Product, Category } from "@/types";
import { Loader, CardSkeleton } from "@/components/Loader";
import { Search, SlidersHorizontal, ChevronRight, ChevronLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategory = searchParams.get("category") || "all";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  
  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const catData = await productService.getAllCategories();
        let cats = Array.isArray(catData) ? catData : (catData as any).data || [];
        setCategories([{ _id: "all", name: "All Items", categoryImage: "" }, ...cats]);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Products on page or search change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        if (debouncedSearch.trim()) {
          const resp = await productService.searchProducts(debouncedSearch, page, 12);
          const results = resp.data || resp;
          setProducts(Array.isArray(results) ? results : []);
          setTotalPages(1); // Standard search endpoint in spec didn't outline pagination response exactly
        } else {
          const resp = await productService.getAllProducts(page, 12);
          const data = resp.data || {};
          setProducts(data.products || []);
          setTotalPages(data.totalPages || 1);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [debouncedSearch, page]);

  // Client-side filtering for Category (assuming API doesn't have a category query param)
  const filteredProducts = useMemo(() => {
    if (activeCategory === "all" || activeCategory === "All Items") return products;
    return products.filter(p => p.productCategory === activeCategory || p.productCategory?.includes(activeCategory));
  }, [products, activeCategory]);

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Shop Groceries</h1>
            <p className="text-gray-500">Fast delivery to your doorstep</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-[#007cf0] outline-none transition shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-28 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" /> Categories
              </h3>
              <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => {
                        setActiveCategory(cat.name);
                        router.replace(`/shop?category=${encodeURIComponent(cat.name)}`, { scroll: false });
                    }}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-left text-sm font-medium transition ${
                      activeCategory === cat.name || (activeCategory === "all" && cat._id === "all")
                        ? "bg-[#007cf0] text-white" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <CardSkeleton key={n} />)}
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {!debouncedSearch && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 py-4">
                    <button 
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-medium text-sm">Page {page} of {totalPages}</span>
                    <button 
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                      className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">No products found.</h3>
                <p className="text-gray-500 mt-2">Try adjusting your category or search query.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function Shop() {
  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Suspense fallback={<div className="min-h-screen pt-32"><Loader /></div>}>
        <ShopContent />
      </Suspense>
    </div>
  );
}
