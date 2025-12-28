import { io } from "socket.io-client";

const socket = io("https://quick-oh.onrender.com", {
    withCredentials: true,
    autoConnect: true,
});

export default socket;
