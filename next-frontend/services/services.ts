export { api } from "./api";
import { api } from "./api";
import { Product, Category } from "@/types";

export const authService = {
  // Assuming standard route names based on common patterns if not explicitly provided
  login: async (credentials: any) => {
    const response = await api.post("users/login", credentials);
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post("users/register", userData);
    return response.data;
  },
  logout: async () => {
    const response = await api.post("users/logout");
    return response.data;
  },
  updateAccount: async (data: { newName: string, newEmail: string, newAddress: string, newLatitude?: number, newLongitude?: number }) => {
    const response = await api.patch("users/update-account", data);
    return response.data;
  },
  addAddress: async (data: { label: string, address: string, latitude: number, longitude: number }) => {
    const response = await api.post("users/add-address", data);
    return response.data;
  },
  removeAddress: async (addressId: string) => {
    const response = await api.delete(`users/remove-address/${addressId}`);
    return response.data;
  },
  setPrimaryAddress: async (addressId: string) => {
    const response = await api.post(`users/set-primary-address/${addressId}`);
    return response.data;
  }
};

export const productService = {
  getAllCategories: async (): Promise<{ data: Category[] }> => {
    // Returns { statusCode, data, message }
    const response = await api.get("category/getAllCategories");
    return response.data;
  },
  getAllProducts: async (page = 1, limit = 20) => {
    const response = await api.get(`products/getAllProducts?page=${page}&limit=${limit}`);
    return response.data; // { data: { products, currentPage, totalPages, totalProducts } }
  },
  getSingleProduct: async (id: string) => {
    const response = await api.get(`products/getSingleProduct/${id}`);
    return response.data; // { data: Product }
  },
  searchProducts: async (keyword: string, page = 1, limit = 10) => {
    const response = await api.get(`products/searchProducts?keyword=${keyword}&page=${page}&limit=${limit}`);
    return response.data; // { data: [ product[] ] }
  }
};

export const cartService = {
  getCartInfo: async () => {
    const response = await api.get("cart/getCartInfo");
    return response.data; // { data: { cart: [], total: number } }
  },
  addProductToCart: async (productId: string, quantity: number) => {
    const response = await api.post("cart/addProductToCart", { productId, quantity });
    return response.data;
  },
  reduceOneItem: async (productId: string) => {
    const response = await api.post("cart/reduceOneItem", { productId });
    return response.data;
  },
  removeAnItemFromCart: async (productId: string) => {
    const response = await api.post("cart/removeAnItemFromCart", { productId });
    return response.data;
  },
  clearCart: async () => {
    const response = await api.delete("cart/clearCart");
    return response.data;
  }
};

export const orderService = {
  createOrder: async (address: string, latitude: number, longitude: number) => {
    const response = await api.post("order/createOrder", { address, latitude, longitude });
    return response.data; // { data: orderObject }
  },
  getUserOrderHistory: async () => {
    const response = await api.get("order/getUserOrderHistory");
    return response.data; // { data: order[] }
  },
  getSingleOrderById: async (id: string) => {
    const response = await api.get(`order/getSingleOrderById/${id}`);
    return response.data;
  },
  getLiveOrderStatus: async (id: string) => {
    const response = await api.get(`order/getLiveOrderStatus/${id}`);
    return response.data; // { data: { status } }
  },
  livePartnerLocation: async (id: string) => {
    const response = await api.get(`order/livePartnerLocation/${id}`);
    return response.data; // { data: { latitude, longitude } }
  },
  updateOrderStatus: async (id: string, status: string) => {
    const response = await api.post(`order/updateOrderStatus/${id}`, { status });
    return response.data;
  },
  getActiveOrders: async () => {
    const response = await api.get("order/getActiveOrders");
    return response.data;
  },
  adminAcceptOrder: async (id: string) => {
    const response = await api.put(`order/adminAcceptOrder/${id}`);
    return response.data;
  },
  acceptListedOrder: async (id: string) => {
    const response = await api.put(`order/acceptListedOrder/${id}`);
    return response.data;
  }
};

export const adminProductService = {
  createProduct: async (formData: FormData) => {
    // Note: FormData is needed for image upload
    const response = await api.post("products/createProduct", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  updateProduct: async (id: string, data: any) => {
    const response = await api.put(`products/updateProduct/${id}`, data);
    return response.data;
  },
  updateProductImage: async (id: string, formData: FormData) => {
    const response = await api.put(`products/updateProductImage/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  toggleStock: async (id: string, stockStatus: string) => {
    const response = await api.put(`products/toggleStock/${id}`, { stockStatus });
    return response.data;
  },
  deleteProduct: async (id: string) => {
    const response = await api.delete(`products/deleteProduct/${id}`);
    return response.data;
  }
};
