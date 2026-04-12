"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/services";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { User as UserIcon, Mail, MapPin, Phone, Edit2, CheckCircle2, Package, Map as MapIcon } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { 
  ssr: false, 
  loading: () => <div className="h-48 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl flex items-center justify-center text-gray-400">Loading Map...</div>
});

export default function UserDashboard() {
  const { user, isAuthenticated, login, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    newName: "",
    newEmail: "",
    newAddress: "",
    newLatitude: 0,
    newLongitude: 0
  });

  // Saved Addresses State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newSavedAddressData, setNewSavedAddressData] = useState({
    label: "",
    address: "",
    latitude: 0,
    longitude: 0
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "customer")) {
      router.push("/login?redirect=/dashboard");
    } else if (user) {
      setFormData({
        newName: user.name || "",
        newEmail: user.email || "",
        newAddress: user.address || "",
        newLatitude: user.latitude || 0,
        newLongitude: user.longitude || 0
      });
    }
  }, [user, isAuthenticated, authLoading, router]);

  const handleLocationSelect = (lat: number, lng: number, pickedAddress?: string) => {
    setFormData(prev => ({
      ...prev,
      newLatitude: lat,
      newLongitude: lng,
      newAddress: pickedAddress || prev.newAddress
    }));
  };

  const handleUpdate = async () => {
    if (!formData.newName || !formData.newEmail || !formData.newAddress) {
      toast.error("Please fill all editable fields");
      return;
    }

    setLoading(true);
    try {
      const resp = await authService.updateAccount(formData);
      toast.success("Profile updated successfully!");
      login({ ...user, ...resp.data });
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSavedLocationSelect = (lat: number, lng: number, pickedAddress?: string) => {
    setNewSavedAddressData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: pickedAddress || prev.address
    }));
  };

  const handleAddSavedAddress = async () => {
    if (!newSavedAddressData.label || !newSavedAddressData.address) {
      toast.error("Please provide a label and location");
      return;
    }
    setLoading(true);
    try {
      const resp = await authService.addAddress(newSavedAddressData);
      login({ ...user, ...resp.data });
      toast.success("Address saved successfully!");
      setIsAddingAddress(false);
      setNewSavedAddressData({ label: "", address: "", latitude: 0, longitude: 0 });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const resp = await authService.removeAddress(id);
      login({ ...user, ...resp.data });
      toast.success("Address deleted");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete address");
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      const resp = await authService.setPrimaryAddress(id);
      login({ ...user, ...resp.data });
      toast.success("Primary address updated");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to set primary address");
    }
  };

  if (authLoading) {
    return <div className="min-h-screen pt-32 text-center text-gray-500">Authenticating...</div>;
  }

  if (!user) {
    return null; // Will be handled by useEffect redirect
  }

  return (
    <div className="min-h-screen flex flex-col pt-20 bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">My Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Profile Section */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <UserIcon className="text-[#007cf0] w-6 h-6" /> Profile Details
                </h2>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-[#007cf0] flex items-center gap-1 hover:underline">
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </button>
                ) : (
                  <button onClick={() => setIsEditing(false)} className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Cancel
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-500">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.newName}
                      onChange={(e) => setFormData({ ...formData, newName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#007cf0] outline-none transition disabled:opacity-70"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-500">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      disabled={!isEditing}
                      value={formData.newEmail}
                      onChange={(e) => setFormData({ ...formData, newEmail: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#007cf0] outline-none transition disabled:opacity-70"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-500">Phone Number (Cannot be changed)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      disabled
                      value={user.phoneNumber || ""}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 outline-none opacity-50 cursor-not-allowed text-gray-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-medium mb-3 text-gray-500">Saved Delivery Location</label>
                  {isEditing ? (
                    <div className="mb-4">
                      <MapPicker onLocationSelect={handleLocationSelect} />
                      <p className="mt-2 text-xs text-gray-500 italic">Click on map or search to update your pinned location.</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MapIcon className="w-5 h-5 text-[#007cf0]" />
                        <span className="text-sm font-medium">GPS Coordinates Saved</span>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">
                        {user.latitude?.toFixed(4)}, {user.longitude?.toFixed(4)}
                      </span>
                    </div>
                  )}
                  
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      disabled={!isEditing}
                      rows={3}
                      value={formData.newAddress}
                      onChange={(e) => setFormData({ ...formData, newAddress: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#007cf0] outline-none transition disabled:opacity-70"
                    />
                  </div>
                </div>

                {isEditing && (
                  <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="bg-gradient-to-r from-[#007cf0] to-[#00dfd8] text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition w-full md:w-auto flex items-center justify-center gap-2"
                  >
                    {loading ? "Updating..." : <><CheckCircle2 className="w-5 h-5" /> Save Profile</>}
                  </button>
                )}
              </div>
            </div>

            {/* Saved Addresses Section */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="text-[#007cf0] w-6 h-6" /> Saved Addresses
                </h2>
                {!isAddingAddress && (
                  <button onClick={() => setIsAddingAddress(true)} className="text-sm font-medium text-[#007cf0] hover:underline">
                    + Add New
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {user.savedAddresses && user.savedAddresses.length > 0 ? (
                  user.savedAddresses.map((addr) => (
                    <div key={addr._id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-md text-xs">{addr.label}</span>
                          {(user.latitude === addr.latitude && user.longitude === addr.longitude) && (
                            <span className="text-xs text-green-500 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Primary</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{addr.address}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => handleSetPrimary(addr._id)}
                          className="px-3 py-1.5 text-xs font-medium text-[#007cf0] bg-[#007cf0]/10 hover:bg-[#007cf0]/20 rounded-lg transition"
                        >
                          Make Primary
                        </button>
                        <button 
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No additional addresses saved yet.</p>
                )}

                {isAddingAddress && (
                  <div className="mt-6 p-5 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
                    <h3 className="font-semibold mb-4">Add a New Address</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Label (e.g. Home, Office)</label>
                        <input
                          type="text"
                          placeholder="My Apartment"
                          value={newSavedAddressData.label}
                          onChange={(e) => setNewSavedAddressData({ ...newSavedAddressData, label: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-[#007cf0]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">Pin Location</label>
                        <MapPicker onLocationSelect={handleSavedLocationSelect} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Full Address</label>
                        <textarea
                          rows={2}
                          value={newSavedAddressData.address}
                          onChange={(e) => setNewSavedAddressData({ ...newSavedAddressData, address: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-[#007cf0]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddSavedAddress}
                          disabled={loading}
                          className="px-4 py-2 bg-[#007cf0] text-white rounded-xl text-sm font-medium hover:bg-[#0066c6] transition"
                        >
                          {loading ? "Saving..." : "Save Address"}
                        </button>
                        <button
                          onClick={() => setIsAddingAddress(false)}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions / Tracking Accessibility */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Quick Links</h2>

              <div className="space-y-3">
                <Link href="/orders" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition group">
                  <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-sm">
                    <Package className="w-5 h-5 text-[#007cf0]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Order History</h3>
                    <p className="text-xs text-gray-500">View past & active orders</p>
                  </div>
                </Link>

                <Link href="/orders" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition group border border-[#00dfd8]/30">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#007cf0] to-[#00dfd8] rounded-full flex items-center justify-center shadow-sm">
                    <MapIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Track Live Order</h3>
                    <p className="text-xs text-gray-500">Find active tracking links</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
