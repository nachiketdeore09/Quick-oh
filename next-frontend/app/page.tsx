"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { TimelineSteps } from "@/components/TimelineSteps";
import { Footer } from "@/components/Footer";
import { CategoryCard } from "@/components/CategoryCard";
import { productService } from "@/services/services";
import { Category } from "@/types";
import { Loader } from "@/components/Loader";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await productService.getAllCategories();
        // Assuming backend returns { data: [...] } or array directly
        setCategories(Array.isArray(data) ? data : (data as any).data || []);
      } catch (error) {
        console.error("Failed to fetch categories", error);
        // Fallback dummy data if backend fails
        setCategories([
          { _id: "1", name: "Fresh Vegetables", categoryImage: "" },
          { _id: "2", name: "Dairy & Eggs", categoryImage: "" },
          { _id: "3", name: "Snacks", categoryImage: "" },
          { _id: "4", name: "Beverages", categoryImage: "" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <main className="min-h-screen flex flex-col pt-16 md:pt-20">
      <Navbar />
      
      <div className="flex-1">
        <Hero />
        
        {/* Categories Section */}
        <section className="py-20 px-4 md:px-8 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
            </div>
            
            {loading ? (
              <Loader />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {categories.map((category) => (
                  <CategoryCard key={category._id} category={category} />
                ))}
              </div>
            )}
          </div>
        </section>

        <TimelineSteps />
      </div>
      
      <Footer />
    </main>
  );
}
