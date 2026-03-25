import axios from "axios";

// Using new Base URL
const API_BASE_URL = "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for httpOnly cookies (JWT)
  headers: {
    "Content-Type": "application/json",
  },
});

// We no longer need to manually manage the token since it's an httpOnly cookie.
// The browser will automatically attach the cookie.

// Generic Error Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // console.error("API Error Response:", error.response);
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Maybe clear the React Context or redirect to login
        // localStorage.removeItem("quickoh_user"); // if we store user metadata
      }
    }
    return Promise.reject(error);
  }
);
