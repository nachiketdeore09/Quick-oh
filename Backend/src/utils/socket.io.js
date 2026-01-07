import { Server } from "socket.io";
import { setDeliveryLocation } from "./deliveryLocation.redis.js";
import { socketRateLimiter } from "./rateLimiter.redis.js";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173", // You can restrict this later to your frontend
            credentials: true,
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        // console.log(socket);
        console.log("New client connected:", socket.id);

        // Example: listen for room join
        socket.on("joinRoom", (roomId) => {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
        });

        socket.on("joinOrderRoom", ({ orderId }) => {
            socket.join(orderId);
            console.log(`Joined order room: order:${orderId}`);
        });

        ///////// CHAT SOCKET ///////////
        socket.on("join-chat", ({ orderId }) => {
            socket.join(orderId);
        });

        socket.on("chat-message", async (message) => {
            const allowed = await socketRateLimiter({
                socket,
                action: "chat",
                limit: 20,
                windowSeconds: 60
            });

            if (!allowed) return;
            io.to(message.orderId).emit("chat-message", message);
        });
        ///////// CHAT SOCKET ///////////

        socket.on("disconnect", (roomId) => {
            socket.leave(roomId);
            console.log("Client disconnected:", socket.id);
        });

        socket.on("updateLocation", async ({ orderId, latitude, longitude }) => {
            const allowed = await socketRateLimiter({
                socket,
                action: "updateLocation",
                limit: 30,           // 30 updates
                windowSeconds: 60    // per minute
            });
            if (!allowed) return;


            if (!orderId || latitude == null || longitude == null) return;
            // Save the latest location to redis.
            await setDeliveryLocation(orderId, latitude, longitude);

            // Broadcast to anyone tracking this delivery partner
            // io.emit(`location-update-${userId}`, { latitude, longitude });
            console.log(`joined room ${orderId}`);
            io.to(orderId).emit("partner-location-update", {
                latitude,
                longitude,
            });
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};