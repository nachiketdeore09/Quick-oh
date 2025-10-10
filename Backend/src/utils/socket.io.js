import { Server } from "socket.io";

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
        console.log("New client connected:", socket.id);

        // Example: listen for room join
        socket.on("joinRoom", (roomId) => {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });

        socket.on("updateLocation", ({ userId, latitude, longitude }) => {
            // Broadcast to anyone tracking this delivery partner
            io.emit(`location-update-${userId}`, { latitude, longitude });
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