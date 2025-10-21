import axios from "axios";

const instance = axios.create({
    baseURL: "https://quick-oh.onrender.com/api/v1", // Adjust based on your backend
    withCredentials: true,
});

export default instance;
