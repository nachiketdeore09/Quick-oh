export interface SavedAddress {
  _id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
}

export type UserRole = "customer" | "admin" | "deliveryPartner" | "vendor";

export interface User {
  _id: string;
  name?: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  address?: string;
  phoneNumber?: string;
  latitude?: number;
  longitude?: number;
  savedAddresses?: SavedAddress[];
}


export interface Product {
  _id: string;
  productName: string;
  description: string;
  price: number;
  discount: number;
  stock: string;
  productImage: string;
  productCategory: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  categoryImage: string;
}

export interface CartItem {
  product: {
    _id: string;
    productName: string;
    price: number;
    discount: number;
    productImage: string;
  };
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  cart: CartItem[];
  total: number;
}

export interface Order {
  _id: string;
  status: "Pending" | "Accepted" | "Assigned" | "Shipped" | "Delivered" | "Cancelled";
  address?: string;
  latitude?: number;
  longitude?: number;
  shippingAddress?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  totalAmount?: number;
  items?: any[];
  user?: User | string;
  assignedTo?: string;
  createdAt?: string;
}

